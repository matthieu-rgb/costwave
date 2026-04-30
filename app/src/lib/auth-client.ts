import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';
import { twoFactorClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  plugins: [magicLinkClient(), passkeyClient(), twoFactorClient()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  magicLink,
  passkey,
  twoFactor,
} = authClient;
