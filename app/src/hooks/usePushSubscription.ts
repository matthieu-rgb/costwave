'use client';

import { useState, useEffect, useCallback } from 'react';

interface UsePushSubscriptionReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | null;
  loading: boolean;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription(): UsePushSubscriptionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window;

      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Check if already subscribed
  useEffect(() => {
    if (!isSupported) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(subscription !== null);
      } catch (error) {
        console.error('[usePushSubscription] Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('[usePushSubscription] Push notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('[usePushSubscription] Error requesting permission:', error);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('[usePushSubscription] Push notifications not supported');
      return false;
    }

    if (permission !== 'granted') {
      console.warn('[usePushSubscription] Permission not granted');
      return false;
    }

    setLoading(true);

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Fetch VAPID public key
      const response = await fetch('/api/push/vapid-key');
      if (!response.ok) {
        throw new Error('Failed to fetch VAPID public key');
      }

      const { publicKey } = await response.json();

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      // Send subscription to server
      const subscribeResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          },
        }),
      });

      if (!subscribeResponse.ok) {
        throw new Error('Failed to save subscription to server');
      }

      setIsSubscribed(true);
      console.log('[usePushSubscription] Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('[usePushSubscription] Error subscribing:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        console.log('[usePushSubscription] Successfully unsubscribed');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[usePushSubscription] Error unsubscribing:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
