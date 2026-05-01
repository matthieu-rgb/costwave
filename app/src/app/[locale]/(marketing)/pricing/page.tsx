import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { PLANS, PRICING } from '@/lib/stripe/config';

export const metadata = {
  title: 'Pricing - Costwave',
  description: 'Simple, transparent pricing. Start free, upgrade when you need more.',
};

export default function PricingPage() {
  return (
    <div className="px-6 py-20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
            // PRICING
          </p>
          <h1 className="mb-4 font-sans text-5xl font-semibold text-[hsl(var(--color-text))]">
            Simple, transparent pricing
          </h1>
          <p className="font-sans text-lg text-[hsl(var(--color-text-dim))]">
            Start free. Upgrade when you need unlimited providers and real-time features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          {/* Free Plan */}
          <Card className="rounded-none border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-8">
            <div className="mb-6">
              <h3 className="mb-2 font-mono text-sm tracking-[0.15em] text-[hsl(var(--color-text))]">
                FREE
              </h3>
              <div className="flex items-baseline gap-1">
                <span
                  className="font-mono text-5xl text-[hsl(var(--color-text))]"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  0
                </span>
                <span className="font-mono text-sm text-[hsl(var(--color-text-mute))]">
                  EUR / MONTH
                </span>
              </div>
              <p className="mt-2 font-mono text-xs text-[hsl(var(--color-text-mute))]">
                FOR INDIVIDUALS & SMALL PROJECTS
              </p>
            </div>

            <ul className="mb-6 space-y-3">
              {PLANS.free.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 text-[hsl(var(--color-text-dim))]" strokeWidth={1.5} />
                  <span className="font-mono text-xs text-[hsl(var(--color-text-dim))]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/signup">
              <Button
                variant="outline"
                className="w-full rounded-sm border-[hsl(var(--color-border))] font-mono text-[10px] tracking-[0.15em]"
              >
                START FREE →
              </Button>
            </Link>
          </Card>

          {/* Pro Plan */}
          <Card className="relative rounded-none border-[hsl(var(--color-phosphor))] bg-[hsl(var(--color-panel))] p-8">
            <div className="absolute left-0 right-0 top-0 h-[1px] bg-[hsl(var(--color-phosphor))] opacity-70" />

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-mono text-sm tracking-[0.15em] text-[hsl(var(--color-text))]">
                  PRO
                </h3>
                <Badge className="rounded-sm bg-[hsl(var(--color-phosphor))]/10 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
                  RECOMMENDED
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="font-mono text-5xl text-[hsl(var(--color-text))]"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {PRICING.monthly.amount}
                </span>
                <span className="font-mono text-sm text-[hsl(var(--color-text-mute))]">
                  EUR / MONTH
                </span>
              </div>
              <p className="mt-2 font-mono text-xs text-[hsl(var(--color-text-dim))]">
                OR {PRICING.yearly.amount} EUR/YEAR ({PRICING.yearly.savings} SAVINGS)
              </p>
            </div>

            <ul className="mb-6 space-y-3">
              {PLANS.pro.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 text-[hsl(var(--color-phosphor))]" strokeWidth={1.5} />
                  <span className="font-mono text-xs text-[hsl(var(--color-text))]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/signup">
              <Button className="w-full rounded-sm bg-[hsl(var(--color-text))] font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-bg))] hover:bg-[hsl(var(--color-text))]/90">
                UPGRADE TO PRO →
              </Button>
            </Link>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card className="rounded-none border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))]">
          <div className="border-b border-[hsl(var(--color-border))] px-6 py-4">
            <h3 className="font-mono text-xs tracking-[0.15em] text-[hsl(var(--color-text))]">
              FEATURE COMPARISON
            </h3>
          </div>
          <div className="overflow-x-auto p-6">
            <table className="w-full font-mono text-xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <thead>
                <tr className="border-b border-[hsl(var(--color-border))]">
                  <th className="py-3 pr-4 text-left font-medium tracking-[0.15em] text-[hsl(var(--color-text-mute))] text-[9px]">
                    FEATURE
                  </th>
                  <th className="px-4 py-3 text-center font-medium tracking-[0.15em] text-[hsl(var(--color-text-mute))] text-[9px]">
                    FREE
                  </th>
                  <th className="py-3 pl-4 text-center font-medium tracking-[0.15em] text-[hsl(var(--color-text-mute))] text-[9px]">
                    PRO
                  </th>
                </tr>
              </thead>
              <tbody className="text-[hsl(var(--color-text-dim))]">
                <ComparisonRow feature="Providers" free="1" pro="Unlimited" />
                <ComparisonRow feature="Budgets" free="1" pro="Unlimited" />
                <ComparisonRow feature="History" free="30 days" pro="Unlimited" />
                <ComparisonRow feature="Claude Code Radar" free="View only" pro="Realtime" />
                <ComparisonRow feature="Push notifications" free="—" pro="✓" proHighlight />
                <ComparisonRow feature="Priority support" free="—" pro="✓" proHighlight />
                <ComparisonRow feature="CSV/JSON exports" free="—" pro="✓" proHighlight />
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ComparisonRow({
  feature,
  free,
  pro,
  proHighlight,
}: {
  feature: string;
  free: string;
  pro: string;
  proHighlight?: boolean;
}) {
  return (
    <tr className="border-b border-[hsl(var(--color-border-soft))]">
      <td className="py-3 pr-4">{feature}</td>
      <td className="px-4 py-3 text-center">{free}</td>
      <td
        className={`py-3 pl-4 text-center ${
          proHighlight ? 'text-[hsl(var(--color-phosphor))]' : 'text-[hsl(var(--color-text))]'
        }`}
      >
        {pro}
      </td>
    </tr>
  );
}
