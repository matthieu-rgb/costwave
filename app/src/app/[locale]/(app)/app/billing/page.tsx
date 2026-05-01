import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { CreditCard } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { subscription } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PLANS, PRICING } from '@/lib/stripe/config';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UpgradeButtons } from '@/components/app/UpgradeButtons';
import { ManageSubscriptionButton } from '@/components/app/ManageSubscriptionButton';

export const metadata = {
  title: 'Billing - Costwave',
  description: 'Manage your subscription and billing',
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BillingPage({ params }: PageProps) {
  const { locale } = await params;

  // Auth check
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const userId = session.user.id;

  // Get user subscription
  const userSubscription = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  });

  const currentPlan = userSubscription?.plan || 'free';
  const isActive = userSubscription?.status === 'active';
  const isPro = currentPlan === 'pro' && isActive;

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-5 h-5 text-[hsl(var(--color-phosphor))]" strokeWidth={1.5} />
          <h1
            className="font-mono text-sm tracking-[0.15em] text-[hsl(var(--color-text))]"
            style={{ letterSpacing: '0.15em' }}
          >
            BILLING
          </h1>
        </div>
        <p className="font-mono text-xs text-[hsl(var(--color-text-dim))]">
          MANAGE YOUR SUBSCRIPTION AND PLAN
        </p>
      </div>

      {/* Current Plan Status */}
      <Card className="mb-6 bg-[hsl(var(--color-panel))] border-[hsl(var(--color-border))] rounded-none">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs tracking-[0.15em] text-[hsl(var(--color-text-mute))]">
                CURRENT PLAN
              </span>
              <Badge
                variant={isPro ? 'default' : 'secondary'}
                className="font-mono text-[9px] tracking-[0.15em] rounded-sm"
              >
                {currentPlan.toUpperCase()}
              </Badge>
              {isPro && (
                <Badge
                  variant="outline"
                  className="font-mono text-[9px] tracking-[0.15em] rounded-sm border-[hsl(var(--color-green))] text-[hsl(var(--color-green))]"
                >
                  ACTIVE
                </Badge>
              )}
            </div>
          </div>

          {isPro && userSubscription?.currentPeriodEnd && (
            <p className="font-mono text-xs text-[hsl(var(--color-text-dim))] mb-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
              RENEWS ON{' '}
              {new Date(userSubscription.currentPeriodEnd).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          {isPro ? (
            <ManageSubscriptionButton />
          ) : (
            <p className="font-mono text-xs text-[hsl(var(--color-text-dim))]">
              UPGRADE TO PRO TO UNLOCK UNLIMITED PROVIDERS, BUDGETS, AND REAL-TIME RADAR
            </p>
          )}
        </div>
      </Card>

      {/* Plan Comparison */}
      {!isPro && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Free Plan */}
          <Card className="bg-[hsl(var(--color-panel))] border-[hsl(var(--color-border))] rounded-none">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-mono text-sm tracking-[0.15em] text-[hsl(var(--color-text))] mb-2">
                  FREE
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className="font-mono text-4xl text-[hsl(var(--color-text))]"
                    style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                  >
                    0
                  </span>
                  <span className="font-mono text-xs text-[hsl(var(--color-text-mute))]">EUR/MONTH</span>
                </div>
                <p className="font-mono text-[9px] text-[hsl(var(--color-text-mute))] mt-1 tracking-[0.1em]">
                  CURRENT PLAN
                </p>
              </div>

              <div className="border-t border-[hsl(var(--color-border))] pt-4 space-y-2">
                {PLANS.free.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[hsl(var(--color-text-dim))] mt-0.5">·</span>
                    <span className="font-mono text-xs text-[hsl(var(--color-text-dim))]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-[hsl(var(--color-panel))] border-[hsl(var(--color-phosphor))] rounded-none relative">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-[hsl(var(--color-phosphor))] opacity-70" />
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-mono text-sm tracking-[0.15em] text-[hsl(var(--color-text))]">
                    PRO
                  </h3>
                  <Badge className="font-mono text-[9px] tracking-[0.15em] rounded-sm bg-[hsl(var(--color-phosphor)/.1)] border-[hsl(var(--color-phosphor))] text-[hsl(var(--color-phosphor))]">
                    RECOMMENDED
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="font-mono text-4xl text-[hsl(var(--color-text))]"
                    style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                  >
                    {PRICING.monthly.amount}
                  </span>
                  <span className="font-mono text-xs text-[hsl(var(--color-text-mute))]">EUR/MONTH</span>
                </div>
                <p className="font-mono text-[9px] text-[hsl(var(--color-text-dim))] mt-1 tracking-[0.1em]">
                  OR {PRICING.yearly.amount} EUR/YEAR ({PRICING.yearly.savings} SAVINGS)
                </p>
              </div>

              <div className="border-t border-[hsl(var(--color-border))] pt-4 space-y-2 mb-4">
                {PLANS.pro.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[hsl(var(--color-phosphor))] mt-0.5">·</span>
                    <span className="font-mono text-xs text-[hsl(var(--color-text))]">{feature}</span>
                  </div>
                ))}
              </div>

              <UpgradeButtons />
            </div>
          </Card>
        </div>
      )}

      {/* Features Comparison Table */}
      <Card className="bg-[hsl(var(--color-panel))] border-[hsl(var(--color-border))] rounded-none">
        <div className="border-b border-[hsl(var(--color-border))] px-6 py-3">
          <h3 className="font-mono text-xs tracking-[0.15em] text-[hsl(var(--color-text))]">
            PLAN COMPARISON
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <thead>
                <tr className="border-b border-[hsl(var(--color-border))]">
                  <th className="text-left py-2 pr-4 font-medium text-[hsl(var(--color-text-mute))] tracking-[0.15em] text-[9px]">
                    FEATURE
                  </th>
                  <th className="text-center py-2 px-4 font-medium text-[hsl(var(--color-text-mute))] tracking-[0.15em] text-[9px]">
                    FREE
                  </th>
                  <th className="text-center py-2 pl-4 font-medium text-[hsl(var(--color-text-mute))] tracking-[0.15em] text-[9px]">
                    PRO
                  </th>
                </tr>
              </thead>
              <tbody className="text-[hsl(var(--color-text-dim))]">
                <tr className="border-b border-[hsl(var(--color-border-soft))]">
                  <td className="py-3 pr-4">Providers</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 pl-4 text-center text-[hsl(var(--color-text))]">Unlimited</td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border-soft))]">
                  <td className="py-3 pr-4">Budgets</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 pl-4 text-center text-[hsl(var(--color-text))]">Unlimited</td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border-soft))]">
                  <td className="py-3 pr-4">History</td>
                  <td className="py-3 px-4 text-center">30 days</td>
                  <td className="py-3 pl-4 text-center text-[hsl(var(--color-text))]">Unlimited</td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border-soft))]">
                  <td className="py-3 pr-4">Claude Code Radar</td>
                  <td className="py-3 px-4 text-center">View only</td>
                  <td className="py-3 pl-4 text-center text-[hsl(var(--color-text))]">Realtime</td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border-soft))]">
                  <td className="py-3 pr-4">Push notifications</td>
                  <td className="py-3 px-4 text-center">—</td>
                  <td className="py-3 pl-4 text-center text-[hsl(var(--color-phosphor))]">✓</td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border-soft))]">
                  <td className="py-3 pr-4">Priority support</td>
                  <td className="py-3 px-4 text-center">—</td>
                  <td className="py-3 pl-4 text-center text-[hsl(var(--color-phosphor))]">✓</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">CSV/JSON exports</td>
                  <td className="py-3 px-4 text-center">—</td>
                  <td className="py-3 pl-4 text-center text-[hsl(var(--color-phosphor))]">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
