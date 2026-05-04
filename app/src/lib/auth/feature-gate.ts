import { db } from '@/lib/db';
import { subscription, providerCredential, budget } from '@/lib/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { PLANS } from '@/lib/stripe/config';

export interface SubscriptionInfo {
  plan: 'free' | 'pro';
  status: string;
  currentPeriodEnd: Date | null;
  isPro: boolean;
}

/**
 * Checks if a user has an active Pro subscription.
 *
 * @param userId - The user ID to check
 * @returns true if user has active Pro plan, false otherwise
 */
export async function isPro(userId: string): Promise<boolean> {
  const userSubscription = await db.query.subscription.findFirst({
    where: and(
      eq(subscription.userId, userId),
      eq(subscription.status, 'active')
    ),
  });

  return userSubscription?.plan === 'pro';
}

/**
 * Gets the user's active subscription information.
 *
 * @param userId - The user ID to query
 * @returns Subscription info or null if no subscription exists
 */
export async function getActiveSubscription(userId: string): Promise<SubscriptionInfo | null> {
  const userSubscription = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  });

  if (!userSubscription) {
    return {
      plan: 'free',
      status: 'none',
      currentPeriodEnd: null,
      isPro: false,
    };
  }

  const isActive = userSubscription.status === 'active';
  const planType = userSubscription.plan as 'free' | 'pro';

  return {
    plan: planType,
    status: userSubscription.status,
    currentPeriodEnd: userSubscription.currentPeriodEnd,
    isPro: isActive && planType === 'pro',
  };
}

/**
 * Checks if user can add another provider credential based on their plan.
 *
 * @param userId - The user ID to check
 * @returns { allowed: boolean, currentCount: number, maxAllowed: number }
 */
export async function canAddProvider(userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
}> {
  // V1: Temporarily allow 4 providers for all users (paywall disabled)
  // TODO V1.5: Re-enable paywall after Stripe live mode + billing page
  const maxAllowed = 4;

  const result = await db
    .select({ count: count() })
    .from(providerCredential)
    .where(eq(providerCredential.userId, userId));

  const currentCount = result[0]?.count || 0;

  return {
    allowed: currentCount < maxAllowed,
    currentCount,
    maxAllowed,
  };
}

/**
 * Checks if user can add another budget based on their plan.
 *
 * @param userId - The user ID to check
 * @returns { allowed: boolean, currentCount: number, maxAllowed: number }
 */
export async function canAddBudget(userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
}> {
  const userIsPro = await isPro(userId);
  const plan = userIsPro ? PLANS.pro : PLANS.free;

  const result = await db
    .select({ count: count() })
    .from(budget)
    .where(eq(budget.userId, userId));

  const currentCount = result[0]?.count || 0;
  const maxAllowed = plan.maxBudgets;

  return {
    allowed: currentCount < maxAllowed,
    currentCount,
    maxAllowed,
  };
}

/**
 * Checks if user has access to real-time radar features.
 *
 * @param userId - The user ID to check
 * @returns true if user can access real-time radar
 */
export async function canAccessRealtimeRadar(userId: string): Promise<boolean> {
  const userIsPro = await isPro(userId);
  const plan = userIsPro ? PLANS.pro : PLANS.free;
  return plan.radarRealtime;
}

/**
 * Checks if user can receive push notifications.
 *
 * @param userId - The user ID to check
 * @returns true if user can receive push notifications
 */
export async function canReceivePushNotifications(userId: string): Promise<boolean> {
  const userIsPro = await isPro(userId);
  const plan = userIsPro ? PLANS.pro : PLANS.free;
  return plan.pushNotifications;
}
