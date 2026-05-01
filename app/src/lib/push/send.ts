import webpush from 'web-push';
import { db } from '@/lib/db';
import { pushSubscription } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getVapidKeys } from './vapid';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  try {
    // Get VAPID keys
    const vapidKeys = getVapidKeys();

    // Set VAPID details for web-push
    webpush.setVapidDetails(vapidKeys.subject, vapidKeys.publicKey, vapidKeys.privateKey);

    // Query all push subscriptions for this user
    const subscriptions = await db.query.pushSubscription.findMany({
      where: eq(pushSubscription.userId, userId),
    });

    if (subscriptions.length === 0) {
      console.log(`[push] No subscriptions found for user ${userId}`);
      return;
    }

    console.log(`[push] Sending notification to ${subscriptions.length} subscription(s) for user ${userId}`);

    // Send notification to each subscription
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          await webpush.sendNotification(subscription, JSON.stringify(payload));

          console.log(`[push] Notification sent to subscription ${sub.id}`);
        } catch (error) {
          // Handle 410 Gone (subscription expired)
          if ((error as any).statusCode === 410) {
            console.log(`[push] Subscription ${sub.id} expired (410 Gone), removing from DB`);
            await db.delete(pushSubscription).where(eq(pushSubscription.id, sub.id));
          } else {
            // Log other errors but continue
            console.error(`[push] Failed to send to subscription ${sub.id}:`, (error as Error).message);
          }
        }
      })
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`[push] Sent ${successCount}/${subscriptions.length} notifications successfully`);
  } catch (error) {
    console.error('[push] Error in sendPushToUser:', (error as Error).message);
  }
}
