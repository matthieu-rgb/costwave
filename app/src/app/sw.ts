import type { PrecacheEntry } from '@serwist/precaching';
import { Serwist } from 'serwist';
import { defaultCache } from '@serwist/next/worker';
import { NetworkFirst, NetworkOnly, CacheFirst, ExpirationPlugin } from 'serwist';

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

// Custom routes
serwist.registerCapture(
  ({ url }) => url.pathname.startsWith('/api/') &&
              !url.pathname.startsWith('/api/auth') &&
              !url.pathname.startsWith('/api/stripe'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60,
      }),
    ],
  })
);

serwist.registerCapture(
  ({ url }) => url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/api/stripe'),
  new NetworkOnly()
);

serwist.registerCapture(
  ({ url }) => url.pathname.match(/\/(icons|fonts)\/.+/) !== null,
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

serwist.addEventListeners();
