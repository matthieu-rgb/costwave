import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Costwave - AI Cost Observatory',
    short_name: 'Costwave',
    description: 'Track AI inference costs across all providers in real-time',
    start_url: '/en/app',
    display: 'standalone',
    background_color: '#07090b',
    theme_color: '#0b968a',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    lang: 'en',
    dir: 'ltr',
    orientation: 'portrait-primary',
    categories: ['productivity', 'finance', 'developer tools'],
  };
}
