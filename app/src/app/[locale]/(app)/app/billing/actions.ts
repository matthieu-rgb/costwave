'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { subscription, auditLog, user } from '@/lib/db/schema';
import { stripe } from '@/lib/stripe/client';
import { STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY } from '@/lib/stripe/config';
import { eq } from 'drizzle-orm';

const CreateCheckoutSessionSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
});

type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;

interface ActionResult {
  success: boolean;
  error?: string;
  url?: string;
}

async function getAuditContext() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
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

/**
 * Creates a Stripe Checkout session for Pro subscription.
 *
 * Flow:
 * 1. Validates input (price ID)
 * 2. Gets user session
 * 3. Creates or retrieves Stripe customer
 * 4. Creates Checkout session with success/cancel URLs
 * 5. Returns checkout URL for redirect
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<ActionResult> {
  try {
    // Validate input
    const validation = CreateCheckoutSessionSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid input',
      };
    }

    const { priceId } = validation.data;

    // Verify price ID is valid
    if (
      priceId !== STRIPE_PRICE_PRO_MONTHLY &&
      priceId !== STRIPE_PRICE_PRO_YEARLY
    ) {
      return { success: false, error: 'Invalid price ID' };
    }

    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id || !session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Check if user already has active subscription
    const existingSubscription = await db.query.subscription.findFirst({
      where: eq(subscription.userId, userId),
    });

    if (existingSubscription?.status === 'active') {
      return { success: false, error: 'You already have an active subscription' };
    }

    // Get or create Stripe customer
    let customerId = existingSubscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId,
        },
      });
      customerId = customer.id;
    }

    // Create Checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        userId,
      },
    });

    await logAudit({
      userId,
      action: 'checkout.session.created',
      resourceType: 'subscription',
      metadata: {
        priceId,
        sessionId: checkoutSession.id,
      },
    });

    return {
      success: true,
      url: checkoutSession.url || undefined,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Failed to create checkout session',
    };
  }
}

/**
 * Creates a Stripe Customer Portal session for managing subscription.
 *
 * Flow:
 * 1. Gets user session
 * 2. Retrieves user's subscription
 * 3. Creates portal session with return URL
 * 4. Returns portal URL for redirect
 */
export async function createPortalSession(): Promise<ActionResult> {
  try {
    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;

    // Get user's subscription
    const userSubscription = await db.query.subscription.findFirst({
      where: eq(subscription.userId, userId),
    });

    if (!userSubscription?.stripeCustomerId) {
      return { success: false, error: 'No subscription found' };
    }

    // Create portal session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    await logAudit({
      userId,
      action: 'portal.session.created',
      resourceType: 'subscription',
      metadata: {
        sessionId: portalSession.id,
      },
    });

    return {
      success: true,
      url: portalSession.url,
    };
  } catch (error) {
    console.error('Error creating portal session:', error);
    return {
      success: false,
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Failed to create portal session',
    };
  }
}
