import type { PgBoss } from 'pg-boss';
import { db } from '@/lib/db';
import { budget, budgetAlertSent, providerUsageSnapshot, event, user } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { sendBudgetAlertEmail } from '@/lib/email/send-budget-alert';
import { sendPushToUser } from '@/lib/push/send';

interface BudgetCheck {
  id: string;
  userId: string;
  scope: string;
  targetId: string | null;
  period: string;
  amountUsd: string;
  alertThresholds: number[];
  createdAt: Date;
}

function getPeriodStart(period: string, now: Date = new Date()): Date {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);

  switch (period) {
    case 'day':
      return date;
    case 'week': {
      // Monday of current week
      const day = date.getUTCDay();
      const diff = day === 0 ? 6 : day - 1; // Sunday = 0, adjust to Monday
      date.setUTCDate(date.getUTCDate() - diff);
      return date;
    }
    case 'month':
      date.setUTCDate(1);
      return date;
    default:
      return date;
  }
}

async function calculateBudgetUsage(
  budget: BudgetCheck,
  periodStart: Date
): Promise<number> {
  // Adjust periodStart if budget was created after the period started
  const effectivePeriodStart = budget.createdAt > periodStart ? budget.createdAt : periodStart;

  try {
    if (budget.scope === 'global') {
      // Sum all provider usage snapshots for this user in the period
      const result = await db
        .select({
          total: sql<string>`COALESCE(SUM(${providerUsageSnapshot.costUsd}), 0)`,
        })
        .from(providerUsageSnapshot)
        .innerJoin(
          sql`(SELECT id FROM provider_credential WHERE "userId" = ${budget.userId})`,
          sql`provider_usage_snapshot."credentialId" = id`
        )
        .where(
          and(
            gte(providerUsageSnapshot.periodStart, effectivePeriodStart),
            lte(providerUsageSnapshot.periodEnd, new Date())
          )
        );

      return parseFloat(result[0]?.total || '0');
    } else if (budget.scope === 'provider' && budget.targetId) {
      // Sum provider usage snapshots for specific credential
      const result = await db
        .select({
          total: sql<string>`COALESCE(SUM(${providerUsageSnapshot.costUsd}), 0)`,
        })
        .from(providerUsageSnapshot)
        .where(
          and(
            eq(providerUsageSnapshot.credentialId, budget.targetId),
            gte(providerUsageSnapshot.periodStart, effectivePeriodStart),
            lte(providerUsageSnapshot.periodEnd, new Date())
          )
        );

      return parseFloat(result[0]?.total || '0');
    } else if (budget.scope === 'workflow' && budget.targetId) {
      // Sum event costs for specific workflow
      const result = await db
        .select({
          total: sql<string>`COALESCE(SUM(${event.costUsd}), 0)`,
        })
        .from(event)
        .where(
          and(
            eq(event.workflowId, budget.targetId),
            gte(event.startedAt, effectivePeriodStart)
          )
        );

      return parseFloat(result[0]?.total || '0');
    }

    return 0;
  } catch (error) {
    console.error(`[check-budgets] Error calculating usage for budget ${budget.id}:`, error);
    return 0;
  }
}

async function checkSingleBudget(budget: BudgetCheck, now: Date): Promise<void> {
  try {
    const periodStart = getPeriodStart(budget.period, now);
    const usedAmount = await calculateBudgetUsage(budget, periodStart);
    const maxAmount = parseFloat(budget.amountUsd);
    const percentage = maxAmount > 0 ? (usedAmount / maxAmount) * 100 : 0;

    // Get user for email and locale
    const userData = await db.query.user.findFirst({
      where: eq(user.id, budget.userId),
    });

    if (!userData) {
      console.error(`[check-budgets] User not found for budget ${budget.id}`);
      return;
    }

    // Check each threshold
    for (const threshold of budget.alertThresholds.sort((a, b) => a - b)) {
      if (percentage >= threshold) {
        // Check if alert already sent for this threshold and period
        const existingAlert = await db.query.budgetAlertSent.findFirst({
          where: and(
            eq(budgetAlertSent.budgetId, budget.id),
            eq(budgetAlertSent.threshold, threshold),
            eq(budgetAlertSent.periodStart, periodStart)
          ),
        });

        if (!existingAlert) {
          console.log(
            `[check-budgets] Sending alert for budget ${budget.id}: ${threshold}% threshold reached (${percentage.toFixed(1)}%)`
          );

          // Format period for display
          const formatPeriod = (date: Date, periodType: string): string => {
            const year = date.getUTCFullYear();
            const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
            const day = date.getUTCDate();

            if (periodType === 'day') {
              return `${month} ${day}, ${year}`;
            } else if (periodType === 'week') {
              return `Week of ${month} ${day}, ${year}`;
            } else {
              return `${month} ${year}`;
            }
          };

          const formattedPeriod = formatPeriod(periodStart, budget.period);
          const deepLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/${userData.locale || 'en'}/budgets`;

          // Send email
          if (userData.email) {
            await sendBudgetAlertEmail(userData.email, {
              budgetName: (budget as any).name || `${budget.scope} budget`,
              threshold,
              usedAmount,
              maxAmount,
              period: formattedPeriod,
              locale: (userData.locale as 'fr' | 'en' | 'de') || 'en',
              deepLink,
            });
          }

          // Send push notification
          await sendPushToUser(budget.userId, {
            title: `Budget Alert: ${threshold}% reached`,
            body: `${(budget as any).name || `${budget.scope} budget`}: $${usedAmount.toFixed(2)} / $${maxAmount.toFixed(2)}`,
            icon: '/icons/icon-192.png',
            url: `/${userData.locale || 'en'}/budgets`,
          });

          // Record alert sent
          await db.insert(budgetAlertSent).values({
            budgetId: budget.id,
            threshold,
            periodStart,
          });

          console.log(`[check-budgets] Alert sent for budget ${budget.id}, threshold ${threshold}%`);
        }
      }
    }
  } catch (error) {
    console.error(`[check-budgets] Error processing budget ${budget.id}:`, (error as Error).message);
    // Continue to next budget - one budget failure shouldn't block others
  }
}

export async function checkBudgets(): Promise<void> {
  const now = new Date();
  console.log(`[check-budgets] Starting budget check at ${now.toISOString()}`);

  try {
    // Query all budgets
    const budgets = (await db.query.budget.findMany()) as BudgetCheck[];

    console.log(`[check-budgets] Found ${budgets.length} budgets to check`);

    // Process each budget independently (errors in one won't stop others)
    await Promise.allSettled(budgets.map((b) => checkSingleBudget(b, now)));

    console.log(`[check-budgets] Completed budget check`);
  } catch (error) {
    console.error('[check-budgets] Fatal error:', (error as Error).message);
  }
}

export async function registerCheckBudgetsJob(boss: PgBoss): Promise<void> {
  // Schedule job to run every 15 minutes
  await boss.schedule('check-budgets', '*/15 * * * *', {}, {
    tz: 'UTC',
  });

  // Register job handler
  await boss.work('check-budgets', async () => {
    await checkBudgets();
  });

  console.log('[check-budgets] Job registered with schedule: */15 * * * *');
}
