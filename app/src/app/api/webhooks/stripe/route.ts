/**
 * Stripe Webhook Handler
 *
 * Handles Stripe events for subscription lifecycle management.
 *
 * LOCAL DEV SETUP:
 *   1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 *   2. Run: stripe listen --forward-to localhost:3001/api/webhooks/stripe
 *   3. Copy the webhook signing secret (whsec_xxx) to .env.local as STRIPE_WEBHOOK_SECRET
 *
 * PRODUCTION SETUP:
 *   1. Create webhook endpoint in Stripe Dashboard
 *   2. Set URL to https://your-domain.com/api/webhooks/stripe
 *   3. Select events:
 *      - customer.subscription.created
 *      - customer.subscription.updated
 *      - customer.subscription.deleted
 *      - invoice.payment_succeeded
 *      - invoice.payment_failed
 *   4. Copy signing secret to production .env
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/client';
import { db } from '@/lib/db';
import { subscription as subscriptionTable, auditLog, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { sendUpgradeWelcomeEmail } from '@/lib/email/send-upgrade-welcome';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set - webhook verification will fail');
}

/**
 * Extract current_period_end from Stripe Subscription
 * Stripe API 2026-04-22.dahlia moved current_period_end to items.data[0].current_period_end
 */
function extractCurrentPeriodEnd(subscription: Stripe.Subscription): Date {
  const subId = subscription.id;

  // Try new location first (API 2026-04-22.dahlia+)
  if (subscription.items?.data && subscription.items.data.length > 0) {
    const itemPeriodEnd = subscription.items.data[0].current_period_end;
    if (itemPeriodEnd && typeof itemPeriodEnd === 'number') {
      const date = new Date(itemPeriodEnd * 1000);
      if (!isNaN(date.getTime())) {
        console.log(`[webhook] Using items.data[0].current_period_end for ${subId}`);
        return date;
      }
    }
  } else {
    console.warn(`[webhook] subscription.items.data is empty or missing for ${subId}`);
  }

  // Fallback to old location (pre-2026 API versions)
  const legacyPeriodEnd = (subscription as any).current_period_end;
  if (legacyPeriodEnd && typeof legacyPeriodEnd === 'number') {
    const date = new Date(legacyPeriodEnd * 1000);
    if (!isNaN(date.getTime())) {
      console.log(`[webhook] Using legacy current_period_end for ${subId}`);
      return date;
    }
  }

  // Last resort: use billing_cycle_anchor
  if (subscription.billing_cycle_anchor && typeof subscription.billing_cycle_anchor === 'number') {
    const date = new Date(subscription.billing_cycle_anchor * 1000);
    if (!isNaN(date.getTime())) {
      console.warn(`[webhook] Using billing_cycle_anchor as fallback for ${subId}`);
      return date;
    }
  }

  // Emergency fallback: current date + 30 days
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 30);
  console.error(`[webhook] All timestamp fields missing or invalid for ${subId}, using +30 days fallback`);
  return fallback;
}

async function logAudit(params: {
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLog).values({
    userId: params.userId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    ip: 'stripe-webhook',
    userAgent: 'stripe-webhook',
    metadata: params.metadata,
  });
}

async function handleSubscriptionCreated(subscriptionFromEvent: Stripe.Subscription) {
  if (!stripe) {
    console.error('Stripe not configured');
    return;
  }

  const customerId = subscriptionFromEvent.customer as string;
  const subscriptionId = subscriptionFromEvent.id;

  // Fetch full subscription with items expanded to ensure current_period_end is available
  // Webhook events may not include all nested fields
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  });

  // Fetch customer to get email
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    console.error(`Customer ${customerId} was deleted`);
    return;
  }

  // Get user by Stripe customer email
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, customer.email || ''),
  });

  if (!existingUser) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // Check if subscription already exists
  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscriptionTable.userId, existingUser.id),
  });

  const subscriptionData = {
    userId: existingUser.id,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    plan: 'pro' as const,
    status: subscription.status,
    currentPeriodEnd: extractCurrentPeriodEnd(subscription),
  };

  if (existingSubscription) {
    // Update existing
    await db.update(subscriptionTable)
      .set({
        ...subscriptionData,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionTable.id, existingSubscription.id));
  } else {
    // Insert new
    await db.insert(subscriptionTable).values(subscriptionData);
  }

  await logAudit({
    userId: existingUser.id,
    action: 'subscription.created',
    resourceType: 'subscription',
    resourceId: subscriptionId,
    metadata: {
      plan: 'pro',
      status: subscription.status,
    },
  });

  // Send welcome email
  const billingPeriod = subscription.items.data[0]?.price.recurring?.interval;
  const planType = billingPeriod === 'year' ? 'yearly' : 'monthly';
  if (customer.email) {
    await sendUpgradeWelcomeEmail(
      customer.email,
      existingUser.name || 'there',
      planType
    );
  }

  console.log(`✓ Subscription created for user ${existingUser.id}`);
}

async function handleSubscriptionUpdated(subscriptionFromEvent: Stripe.Subscription) {
  if (!stripe) {
    console.error('Stripe not configured');
    return;
  }

  const subscriptionId = subscriptionFromEvent.id;

  // Fetch full subscription with items expanded to ensure current_period_end is available
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  });

  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscriptionTable.stripeSubscriptionId, subscriptionId),
  });

  if (!existingSubscription) {
    console.error(`Subscription ${subscriptionId} not found in database`);
    return;
  }

  await db.update(subscriptionTable)
    .set({
      status: subscription.status,
      currentPeriodEnd: extractCurrentPeriodEnd(subscription),
      updatedAt: new Date(),
    })
    .where(eq(subscriptionTable.stripeSubscriptionId, subscriptionId));

  await logAudit({
    userId: existingSubscription.userId,
    action: 'subscription.updated',
    resourceType: 'subscription',
    resourceId: subscriptionId,
    metadata: {
      status: subscription.status,
    },
  });

  console.log(`✓ Subscription ${subscriptionId} updated`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscriptionTable.stripeSubscriptionId, subscriptionId),
  });

  if (!existingSubscription) {
    console.error(`Subscription ${subscriptionId} not found in database`);
    return;
  }

  await db.update(subscriptionTable)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptionTable.stripeSubscriptionId, subscriptionId));

  await logAudit({
    userId: existingSubscription.userId,
    action: 'subscription.deleted',
    resourceType: 'subscription',
    resourceId: subscriptionId,
    metadata: {
      status: 'canceled',
    },
  });

  console.log(`✓ Subscription ${subscriptionId} canceled`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) return;

  const subscriptionId = (invoice as any).subscription as string;

  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscriptionTable.stripeSubscriptionId, subscriptionId),
  });

  if (!existingSubscription) {
    console.error(`Subscription ${subscriptionId} not found in database`);
    return;
  }

  // Ensure subscription is marked as active
  await db.update(subscriptionTable)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(eq(subscriptionTable.stripeSubscriptionId, subscriptionId));

  await logAudit({
    userId: existingSubscription.userId,
    action: 'invoice.payment_succeeded',
    resourceType: 'subscription',
    resourceId: subscriptionId,
    metadata: {
      amount: invoice.amount_paid,
      currency: invoice.currency,
    },
  });

  console.log(`✓ Payment succeeded for subscription ${subscriptionId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) return;

  const subscriptionId = (invoice as any).subscription as string;

  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscriptionTable.stripeSubscriptionId, subscriptionId),
  });

  if (!existingSubscription) {
    console.error(`Subscription ${subscriptionId} not found in database`);
    return;
  }

  await db.update(subscriptionTable)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscriptionTable.stripeSubscriptionId, subscriptionId));

  await logAudit({
    userId: existingSubscription.userId,
    action: 'invoice.payment_failed',
    resourceType: 'subscription',
    resourceId: subscriptionId,
    metadata: {
      attempt_count: invoice.attempt_count,
    },
  });

  console.log(`⚠️  Payment failed for subscription ${subscriptionId}`);
}

export async function POST(req: NextRequest) {
  // Early return if Stripe not configured (V1 production)
  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('Stripe webhook called but STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 503 }
    );
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!stripe) {
    console.error('Stripe client not initialized');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 503 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[webhook] Unhandled event type: ${event.type} (ignored, not an error)`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[webhook] Error processing event:', errorMessage);
    if (errorStack) {
      console.error('[webhook] Stack trace:', errorStack);
    }
    console.error('[webhook] Event type:', event.type);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
