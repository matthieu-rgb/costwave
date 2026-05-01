import { Resend } from 'resend';
import UpgradeWelcomeEmail from './templates/UpgradeWelcome';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-key-for-dev');

export async function sendUpgradeWelcomeEmail(
  to: string,
  userName: string,
  plan: 'monthly' | 'yearly'
): Promise<void> {
  if (
    !process.env.RESEND_API_KEY ||
    process.env.RESEND_API_KEY === 'placeholder-key-for-dev'
  ) {
    console.log('[DEV] Skip upgrade email send to:', to, { userName, plan });
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Costwave <noreply@0xmatthieu.dev>',
      to,
      subject: 'Welcome to Costwave Pro',
      react: UpgradeWelcomeEmail({ userName, plan }),
    });

    console.log(`[email] Upgrade welcome sent to ${to} (plan: ${plan})`);
  } catch (error) {
    console.error('[email] Failed to send upgrade welcome:', (error as Error).message);
  }
}
