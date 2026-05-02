import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Shield } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { budget, providerCredential, providerUsageSnapshot, event, workflow } from '@/lib/db/schema';
import { eq, and, gte, lte, sql, inArray } from 'drizzle-orm';
import { BudgetCard } from '@/components/app/BudgetCard';
import { CreateBudgetDialog } from '@/components/app/CreateBudgetDialog';
import { MCBadge } from '@/components/app/MCBadge';

interface BudgetWithUsage {
  id: string;
  name?: string;
  scope: string;
  targetId: string | null;
  period: string;
  amountUsd: string;
  alertThresholds: number[];
  createdAt: Date;
  usedAmount: number;
  scopeLabel: string;
}

function getPeriodStart(period: string, now: Date = new Date()): Date {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);

  switch (period) {
    case 'day':
      return date;
    case 'week': {
      const day = date.getUTCDay();
      const diff = day === 0 ? 6 : day - 1;
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
  budgetData: {
    id: string;
    userId: string;
    scope: string;
    targetId: string | null;
    period: string;
    createdAt: Date;
  },
  periodStart: Date
): Promise<number> {
  const effectivePeriodStart =
    budgetData.createdAt > periodStart ? budgetData.createdAt : periodStart;

  try {
    if (budgetData.scope === 'global') {
      // Get user's credentials
      const credentials = await db.query.providerCredential.findMany({
        where: eq(providerCredential.userId, budgetData.userId),
        columns: { id: true },
      });

      if (credentials.length === 0) return 0;

      const credentialIds = credentials.map((c) => c.id);

      const result = await db
        .select({
          total: sql<string>`COALESCE(SUM(${providerUsageSnapshot.costUsd}), 0)`,
        })
        .from(providerUsageSnapshot)
        .where(
          and(
            inArray(providerUsageSnapshot.credentialId, credentialIds),
            gte(providerUsageSnapshot.periodStart, effectivePeriodStart),
            lte(providerUsageSnapshot.periodEnd, new Date())
          )
        );

      return parseFloat(result[0]?.total || '0');
    } else if (budgetData.scope === 'provider' && budgetData.targetId) {
      const result = await db
        .select({
          total: sql<string>`COALESCE(SUM(${providerUsageSnapshot.costUsd}), 0)`,
        })
        .from(providerUsageSnapshot)
        .where(
          and(
            eq(providerUsageSnapshot.credentialId, budgetData.targetId),
            gte(providerUsageSnapshot.periodStart, effectivePeriodStart),
            lte(providerUsageSnapshot.periodEnd, new Date())
          )
        );

      return parseFloat(result[0]?.total || '0');
    } else if (budgetData.scope === 'workflow' && budgetData.targetId) {
      const result = await db
        .select({
          total: sql<string>`COALESCE(SUM(${event.costUsd}), 0)`,
        })
        .from(event)
        .where(
          and(eq(event.workflowId, budgetData.targetId), gte(event.startedAt, effectivePeriodStart))
        );

      return parseFloat(result[0]?.total || '0');
    }

    return 0;
  } catch (error) {
    console.error(`[budgets] Error calculating usage for budget ${budgetData.id}:`, error);
    return 0;
  }
}

async function getScopeLabel(
  scope: string,
  targetId: string | null
): Promise<string> {
  if (scope === 'global') return 'ALL.PROVIDERS';

  if (scope === 'provider' && targetId) {
    const provider = await db.query.providerCredential.findFirst({
      where: eq(providerCredential.id, targetId),
    });
    return provider ? `${provider.providerType} / ${provider.label}` : 'provider';
  }

  if (scope === 'workflow' && targetId) {
    const wf = await db.query.workflow.findFirst({
      where: eq(workflow.id, targetId),
    });
    return wf ? wf.name : 'workflow';
  }

  return scope;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BudgetsPage({ params }: PageProps) {
  const { locale } = await params;

  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  // Query budgets
  const budgets = await db.query.budget.findMany({
    where: eq(budget.userId, session.user.id),
    orderBy: (budgets, { desc }) => [desc(budgets.createdAt)],
  });

  // Calculate usage for each budget
  const now = new Date();
  const budgetsWithUsage: BudgetWithUsage[] = await Promise.all(
    budgets.map(async (b) => {
      const periodStart = getPeriodStart(b.period, now);
      const usedAmount = await calculateBudgetUsage(
        {
          id: b.id,
          userId: session.user.id,
          scope: b.scope,
          targetId: b.targetId,
          period: b.period,
          createdAt: b.createdAt,
        },
        periodStart
      );
      const scopeLabel = await getScopeLabel(b.scope, b.targetId);

      return {
        ...b,
        usedAmount,
        scopeLabel,
      };
    })
  );

  // Calculate summary stats
  const breachCount = budgetsWithUsage.filter(
    (b) => (b.usedAmount / parseFloat(b.amountUsd)) * 100 >= 100
  ).length;
  const critCount = budgetsWithUsage.filter((b) => {
    const pct = (b.usedAmount / parseFloat(b.amountUsd)) * 100;
    return pct >= 90 && pct < 100;
  }).length;
  const warnCount = budgetsWithUsage.filter((b) => {
    const pct = (b.usedAmount / parseFloat(b.amountUsd)) * 100;
    return pct >= 75 && pct < 90;
  }).length;
  const nominalCount = budgets.length - breachCount - critCount - warnCount;

  const totalSpend = budgetsWithUsage.reduce((sum, b) => sum + b.usedAmount, 0);
  const totalMax = budgetsWithUsage.reduce((sum, b) => sum + parseFloat(b.amountUsd), 0);

  // Query providers and workflows for CreateBudgetDialog
  const providers = await db.query.providerCredential.findMany({
    where: eq(providerCredential.userId, session.user.id),
    columns: {
      id: true,
      label: true,
      providerType: true,
    },
  });

  const workflows = await db.query.workflow.findMany({
    where: eq(workflow.userId, session.user.id),
    columns: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="flex flex-col gap-0 bg-[hsl(var(--mc-bg))]">
      {/* Header */}
      <header
        className="flex h-[38px] items-center gap-3.5 border-b px-3.5 font-mono text-[10px] text-[hsl(var(--mc-text-dim))]"
        style={{ borderColor: 'hsl(var(--mc-border))' }}
      >
        <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide text-[hsl(var(--mc-text))]">
          <Shield className="h-3 w-3" /> BUDGETS
        </span>
        <span className="text-[hsl(var(--mc-text-mute))]">·</span>
        <span>
          {budgets.length} CONFIGURED · {breachCount} BREACH · {warnCount} WARN
        </span>
        <div className="flex-1" />
        <span className="tabular-nums text-[hsl(var(--mc-text-mute))]">UPDATED 12s</span>
      </header>

      {/* Summary Strip */}
      <div
        className="flex items-center gap-6 border-b bg-[hsl(var(--mc-panel))] px-4.5 py-3.5"
        style={{ borderColor: 'hsl(var(--mc-border))' }}
      >
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
            BUDGETS.HEALTH
          </div>
          <div className="mt-1 font-mono text-[22px] tabular-nums text-[hsl(var(--mc-text))]">
            {nominalCount}{' '}
            <span className="text-[13px] text-[hsl(var(--mc-text-mute))]">/ {budgets.length}</span>{' '}
            <span className="text-[11px] text-[hsl(var(--mc-phosphor))]">NOMINAL</span>
          </div>
        </div>

        <div
          className="h-9 w-px"
          style={{ backgroundColor: 'hsl(var(--mc-border))' }}
        />

        <div>
          <div className="font-mono text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
            SPEND / TOTAL
          </div>
          <div className="mt-1 font-mono text-[22px] tabular-nums text-[hsl(var(--mc-text))]">
            ${totalSpend.toFixed(0)}{' '}
            <span className="text-[13px] text-[hsl(var(--mc-text-mute))]">
              / ${totalMax.toFixed(0)}
            </span>
          </div>
        </div>

        <div
          className="h-9 w-px"
          style={{ backgroundColor: 'hsl(var(--mc-border))' }}
        />

        <div>
          <div className="font-mono text-[9px] uppercase tracking-wide text-[hsl(var(--mc-text-mute))]">
            BREACH / CRIT / WARN
          </div>
          <div className="mt-1 flex gap-1.5">
            {breachCount > 0 && <MCBadge severity="breach">{breachCount} BREACH</MCBadge>}
            {warnCount > 0 && <MCBadge severity="warn">{warnCount} WARN</MCBadge>}
            {nominalCount > 0 && <MCBadge severity="info">{nominalCount} OK</MCBadge>}
          </div>
        </div>

        <div className="flex-1" />

        <CreateBudgetDialog providers={providers} workflows={workflows} />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-3">
        {budgets.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-[hsl(var(--mc-text-mute))]" />
              <p className="mt-4 font-mono text-sm text-[hsl(var(--mc-text-dim))]">
                No budgets configured
              </p>
              <p className="mt-1 font-mono text-xs text-[hsl(var(--mc-text-mute))]">
                Create your first budget to track spending
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {budgetsWithUsage.map((b) => (
              <BudgetCard key={b.id} budget={b} usedAmount={b.usedAmount} scopeLabel={b.scopeLabel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
