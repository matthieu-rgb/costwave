import { Resend } from 'resend';
import { BudgetAlertEmail } from './templates/BudgetAlert';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-key-for-dev');

interface BudgetAlertEmailProps {
  budgetName: string;
  threshold: number;
  usedAmount: number;
  maxAmount: number;
  period: string;
  locale: 'fr' | 'en' | 'de';
  deepLink: string;
}

const subjects = {
  fr: (threshold: number) => `Alerte Budget: ${threshold}% atteint`,
  en: (threshold: number) => `Budget Alert: ${threshold}% reached`,
  de: (threshold: number) => `Budget-Warnung: ${threshold}% erreicht`,
};

export async function sendBudgetAlertEmail(
  to: string,
  props: BudgetAlertEmailProps
): Promise<void> {
  if (
    !process.env.RESEND_API_KEY ||
    process.env.RESEND_API_KEY === 'placeholder-key-for-dev'
  ) {
    console.log('[DEV] Skip email send to:', to, props);
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Costwave <noreply@0xmatthieu.dev>',
      to,
      subject: subjects[props.locale](props.threshold),
      react: BudgetAlertEmail(props),
    });

    console.log(`[email] Budget alert sent to ${to} (threshold: ${props.threshold}%)`);
  } catch (error) {
    console.error('[email] Failed to send budget alert:', (error as Error).message);
  }
}
