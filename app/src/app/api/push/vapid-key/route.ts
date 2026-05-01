import { NextResponse } from 'next/server';
import { getVapidKeys } from '@/lib/push/vapid';

export async function GET() {
  try {
    const vapidKeys = getVapidKeys();

    return NextResponse.json({
      publicKey: vapidKeys.publicKey,
    });
  } catch (error) {
    console.error('[api/push/vapid-key] Error:', error);
    return NextResponse.json({ error: 'Failed to get VAPID public key' }, { status: 500 });
  }
}
