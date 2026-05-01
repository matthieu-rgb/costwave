'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { budget, auditLog } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const CreateBudgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  scope: z.enum(['global', 'provider', 'workflow'], {
    errorMap: () => ({ message: 'Invalid scope' }),
  }),
  targetId: z.string().uuid().optional(),
  period: z.enum(['day', 'week', 'month'], {
    errorMap: () => ({ message: 'Invalid period' }),
  }),
  amountUsd: z.number().positive('Amount must be positive'),
  alertThresholds: z
    .array(z.number().int().min(1).max(100))
    .min(1, 'At least one threshold required')
    .refine((arr) => arr.every((v, i, a) => i === 0 || v > a[i - 1]), {
      message: 'Thresholds must be in ascending order',
    }),
}).refine(
  (data) => {
    // targetId required if scope is not global
    if (data.scope !== 'global' && !data.targetId) {
      return false;
    }
    // targetId must be null if scope is global
    if (data.scope === 'global' && data.targetId) {
      return false;
    }
    return true;
  },
  {
    message: 'targetId required for provider/workflow scope, must be null for global scope',
  }
);

const UpdateBudgetSchema = CreateBudgetSchema.partial();

type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;
type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>;

interface ActionResult {
  success: boolean;
  error?: string;
  budgetId?: string;
}

async function getAuditContext() {
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  return { ip, userAgent };
}

async function logAudit(params: {
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}) {
  const { ip, userAgent } = await getAuditContext();

  await db.insert(auditLog).values({
    userId: params.userId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    ip,
    userAgent,
    metadata: params.metadata,
  });
}

export async function createBudget(input: CreateBudgetInput): Promise<ActionResult> {
  try {
    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parsed = CreateBudgetSchema.safeParse(input);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Validation failed',
      };
    }

    const data = parsed.data;

    // Insert budget
    const [newBudget] = await db
      .insert(budget)
      .values({
        userId: session.user.id,
        scope: data.scope,
        targetId: data.targetId || null,
        period: data.period,
        amountUsd: data.amountUsd.toString(),
        alertThresholds: data.alertThresholds,
      })
      .returning({ id: budget.id });

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: 'budget.create',
      resourceType: 'budget',
      resourceId: newBudget.id,
      metadata: {
        scope: data.scope,
        period: data.period,
        amountUsd: data.amountUsd,
      },
    });

    return { success: true, budgetId: newBudget.id };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[createBudget] Error:', error);
    } else {
      console.error('[createBudget] Error:', (error as Error).message);
    }
    return { success: false, error: 'Failed to create budget. Please try again.' };
  }
}

export async function updateBudget(
  id: string,
  input: UpdateBudgetInput
): Promise<ActionResult> {
  try {
    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const existingBudget = await db.query.budget.findFirst({
      where: eq(budget.id, id),
    });

    if (!existingBudget) {
      return { success: false, error: 'Budget not found' };
    }

    if (existingBudget.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    const parsed = UpdateBudgetSchema.safeParse(input);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Validation failed',
      };
    }

    const data = parsed.data;

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {};
    if (data.scope !== undefined) updateData.scope = data.scope;
    if (data.targetId !== undefined) updateData.targetId = data.targetId;
    if (data.period !== undefined) updateData.period = data.period;
    if (data.amountUsd !== undefined) updateData.amountUsd = data.amountUsd.toString();
    if (data.alertThresholds !== undefined) updateData.alertThresholds = data.alertThresholds;

    // Update budget
    await db.update(budget).set(updateData).where(eq(budget.id, id));

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: 'budget.update',
      resourceType: 'budget',
      resourceId: id,
      metadata: { updatedFields: Object.keys(updateData) },
    });

    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[updateBudget] Error:', error);
    } else {
      console.error('[updateBudget] Error:', (error as Error).message);
    }
    return { success: false, error: 'Failed to update budget. Please try again.' };
  }
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  try {
    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const existingBudget = await db.query.budget.findFirst({
      where: eq(budget.id, id),
    });

    if (!existingBudget) {
      return { success: false, error: 'Budget not found' };
    }

    if (existingBudget.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete budget (cascade to budget_alert_sent)
    await db.delete(budget).where(eq(budget.id, id));

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: 'budget.delete',
      resourceType: 'budget',
      resourceId: id,
    });

    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[deleteBudget] Error:', error);
    } else {
      console.error('[deleteBudget] Error:', (error as Error).message);
    }
    return { success: false, error: 'Failed to delete budget. Please try again.' };
  }
}
