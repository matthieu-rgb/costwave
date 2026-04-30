import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { passkey } from '@better-auth/passkey';
import { twoFactor } from 'better-auth/plugins';
import { db } from './db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-key-for-dev');

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  trustedOrigins: [process.env.BETTER_AUTH_TRUSTED_ORIGINS || 'http://localhost:3001'],

  plugins: [
    // Magic link authentication via email
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder-key-for-dev') {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Costwave <noreply@0xmatthieu.dev>',
            to: email,
            subject: 'Your magic link to sign in',
            html: `
              <p>Click the link below to sign in to Costwave:</p>
              <p><a href="${url}">${url}</a></p>
              <p>This link will expire in 5 minutes.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            `,
          });
        } else {
          // Dev mode: log the magic link
          console.log(`[DEV] Magic link for ${email}: ${url}`);
        }
      },
      expiresIn: 300, // 5 minutes
    }),

    // WebAuthn passkey authentication
    passkey({
      rpName: 'Costwave',
      rpID: new URL(process.env.BETTER_AUTH_URL || 'http://localhost:3001').hostname,
    }),

    // Two-factor authentication (TOTP)
    twoFactor({
      issuer: 'Costwave',
    }),
  ],

  // Rate limiting is built-in and enabled by default in Better Auth
  // Default: 5 attempts per 15 minutes for login/signup
});
