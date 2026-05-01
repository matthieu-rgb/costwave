import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, Radar, Shield, Smartphone } from 'lucide-react';

export const metadata = {
  title: 'Costwave - LLM Cost Observability Platform',
  description: 'Track every dollar spent on LLM inference across all your providers in real-time.',
};

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-[hsl(var(--color-border))] bg-[radial-gradient(hsl(var(--color-bg-grid))_1px,transparent_1px)] bg-[length:20px_20px] px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-5xl">
          <Badge className="mb-6 rounded-sm border-[hsl(var(--color-phosphor))] bg-[hsl(var(--color-phosphor))]/10 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
            NOW IN BETA
          </Badge>

          <h1 className="mb-6 max-w-3xl font-sans text-5xl font-semibold leading-tight tracking-tight text-[hsl(var(--color-text))] md:text-6xl">
            Your LLM cost{' '}
            <span className="text-[hsl(var(--color-phosphor))]">observatory</span>
          </h1>

          <p className="mb-8 max-w-2xl font-sans text-lg leading-relaxed text-[hsl(var(--color-text-dim))]">
            Track every dollar spent on LLM inference in real-time across all your providers. See Claude Code work from the inside.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button className="rounded-sm bg-[hsl(var(--color-text))] px-6 py-3 font-mono text-[11px] font-semibold tracking-[0.15em] text-[hsl(var(--color-bg))] hover:bg-[hsl(var(--color-text))]/90">
                SIGN UP — FREE FOREVER →
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" className="rounded-sm border-[hsl(var(--color-border))] px-6 py-3 font-mono text-[11px] tracking-[0.15em] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-panel-2))]">
                LEARN MORE
              </Button>
            </Link>
          </div>

          <p className="mt-6 font-mono text-[10px] tracking-wide text-[hsl(var(--color-text-mute))]">
            NO CREDIT CARD · OPEN SOURCE AGENT · SOC 2 IN PROGRESS
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-b border-[hsl(var(--color-border))] px-6 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12">
            <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
              // FEATURES
            </p>
            <h2 className="font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
              Built like a cockpit. Not like a dashboard.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FeatureCard
              icon={<Layers className="h-5 w-5" strokeWidth={1.5} />}
              label="MULTI-PROVIDER"
              title="All providers, one view"
              description="Anthropic, OpenAI, Groq, Mistral, xAI. Track usage, tokens, latency, and cost in real-time across all your LLM providers."
            />
            <FeatureCard
              icon={<Radar className="h-5 w-5" strokeWidth={1.5} />}
              label="CLAUDE CODE RADAR"
              title="Real-time agent trace"
              description="Visualize the main agent, sub-agents, files accessed, tools called. Context window usage shown like a fuel gauge."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" strokeWidth={1.5} />}
              label="BUDGETS & ALERTS"
              title="Set limits, stay safe"
              description="Define budgets by provider, model, or workflow. Get alerts at 75/90/100% thresholds via email, Slack, or webhook."
            />
            <FeatureCard
              icon={<Smartphone className="h-5 w-5" strokeWidth={1.5} />}
              label="ANYWHERE ACCESS"
              title="Desktop + Mobile PWA"
              description="Full cockpit on desktop, alerts on mobile. Install as a PWA, works offline, native push notifications."
            />
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-6 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
            // PRICING
          </p>
          <h2 className="mb-4 font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
            Start free. Upgrade when ready.
          </h2>
          <p className="mb-8 font-sans text-lg text-[hsl(var(--color-text-dim))]">
            Free plan includes 1 provider, 1 budget, and 30 days of history. Pro unlocks everything for 4.99 EUR/month.
          </p>
          <Link href="/pricing">
            <Button className="rounded-sm bg-[hsl(var(--color-text))] px-6 py-3 font-mono text-[11px] font-semibold tracking-[0.15em] text-[hsl(var(--color-bg))] hover:bg-[hsl(var(--color-text))]/90">
              VIEW FULL PRICING →
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-sans text-3xl font-semibold text-[hsl(var(--color-text))]">
            Ready to track your LLM costs?
          </h2>
          <p className="mb-8 font-sans text-lg text-[hsl(var(--color-text-dim))]">
            Sign up in 30 seconds. No credit card required.
          </p>
          <Link href="/signup">
            <Button className="rounded-sm bg-[hsl(var(--color-text))] px-8 py-4 font-mono text-[11px] font-semibold tracking-[0.15em] text-[hsl(var(--color-bg))] hover:bg-[hsl(var(--color-text))]/90">
              GET STARTED FREE →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  label,
  title,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-none border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-text-mute))]">
          {label}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[hsl(var(--color-border))] text-[hsl(var(--color-phosphor))]">
          {icon}
        </div>
      </div>
      <h3 className="mb-3 font-mono text-lg font-semibold text-[hsl(var(--color-text))]">
        {title}
      </h3>
      <p className="font-sans text-sm leading-relaxed text-[hsl(var(--color-text-dim))]">
        {description}
      </p>
    </Card>
  );
}
