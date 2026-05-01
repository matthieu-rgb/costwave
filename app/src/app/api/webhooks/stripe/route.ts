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
import { subscription, auditLog, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { sendUpgradeWelcomeEmail } from '@/lib/email/send-upgrade-welcome';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set - webhook verification will fail');
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

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  // Get user by Stripe customer ID
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, subscription.customer_email || ''),
  });

  if (!existingUser) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // Check if subscription already exists
  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscription.userId, existingUser.id),
  });

  const subscriptionData = {
    userId: existingUser.id,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    plan: 'pro' as const,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  };

  if (existingSubscription) {
    // Update existing
    await db.update(subscription)
      .set({
        ...subscriptionData,
        updatedAt: new Date(),
      })
      .where(eq(subscription.id, existingSubscription.id));
  } else {
    // Insert new
    await db.insert(subscription).values(subscriptionData);
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
  if (subscription.customer_email) {
    await sendUpgradeWelcomeEmail(
      subscription.customer_email,
      existingUser.name || 'there',
      planType
    );
  }

  console.log(`✓ Subscription created for user ${existingUser.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscription.stripeSubscriptionId, subscriptionId),
  });

  if (!existingSubscription) {
    console.error(`Subscription ${subscriptionId} not found in database`);
    return;
  }

  await db.update(subscription)
    .set({
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date(),
    })
    .where(eq(subscription.stripeSubscriptionId, subscriptionId));

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
    where: eq(subscription.stripeSubscriptionId, subscriptionId),
  });

  if (!existingSubscription) {
    console.error(`Subscription ${subscriptionId} not found in database`);
    return;
  }

  await db.update(subscription)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscription.stripeSubscriptionId, subscriptionId));

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
  if (!invoice.subscription) return;

  const subscriptionId = invoice.subscription as string;

  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscription.stripeSubscriptionId, subscriptionId),
  });

  if (!existingSubscription) {
    console.error(`Subscription ${subscriptionId} not found in database`);
    return;
  }

  // Ensure subscription is marked as active
  await db.update(subscription)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(eq(subscription.stripeSubscriptionId, subscriptionId));

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
  if (!invoice.subscription) return;

  const subscriptionId = invoice.subscription as string;

  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscription.stripeSubscriptionId, subscriptionId),
  });

  if (!existingSubscription) {
    console.error(`Subscription ${subscriptionId} not found in database`);
    return;
  }

  await db.update(subscription)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscription.stripeSubscriptionId, subscriptionId));

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

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
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
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
