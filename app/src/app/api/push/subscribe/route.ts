import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { pushSubscription } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const SubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  deviceLabel: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = SubscribeSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const { endpoint, keys, deviceLabel } = parsed.data;

    // Upsert subscription (ON CONFLICT endpoint DO UPDATE)
    // Check if subscription already exists
    const existing = await db.query.pushSubscription.findFirst({
      where: eq(pushSubscription.endpoint, endpoint),
    });

    if (existing) {
      // Update userId if different (user re-subscribed from another account)
      await db
        .update(pushSubscription)
        .set({
          userId: session.user.id,
          p256dh: keys.p256dh,
          auth: keys.auth,
          deviceLabel: deviceLabel || existing.deviceLabel,
        })
        .where(eq(pushSubscription.endpoint, endpoint));

      console.log(`[api/push/subscribe] Updated subscription for user ${session.user.id}`);
    } else {
      // Insert new subscription
      await db.insert(pushSubscription).values({
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        deviceLabel,
      });

      console.log(`[api/push/subscribe] Created subscription for user ${session.user.id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/push/subscribe] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}
