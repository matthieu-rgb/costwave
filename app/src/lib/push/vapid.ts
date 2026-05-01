import webpush from 'web-push';

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}

let cachedVapidKeys: VapidKeys | null = null;

export function getVapidKeys(): VapidKeys {
  if (cachedVapidKeys) {
    return cachedVapidKeys;
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:contact@0xmatthieu.dev';

  if (!publicKey || !privateKey) {
    // Generate keys if not present (dev mode)
    const generated = webpush.generateVAPIDKeys();

    console.warn('[VAPID] WARNING: VAPID keys not found in environment variables.');
    console.warn('[VAPID] Generated keys for development. Add these to your .env file:');
    console.warn(`VAPID_PUBLIC_KEY=${generated.publicKey}`);
    console.warn(`VAPID_PRIVATE_KEY=${generated.privateKey}`);
    console.warn(`VAPID_SUBJECT=${subject}`);

    cachedVapidKeys = {
      publicKey: generated.publicKey,
      privateKey: generated.privateKey,
      subject,
    };

    return cachedVapidKeys;
  }

  cachedVapidKeys = {
    publicKey,
    privateKey,
    subject,
  };

  return cachedVapidKeys;
}
