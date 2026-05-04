import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, Eye, Bell, Code, Mail, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'About - Costwave',
  description: 'Learn about Costwave, the open-source LLM cost observability platform built in France.',
};

function StepCard({
  icon,
  number,
  title,
  description,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-none border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
          STEP {number}
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

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-[hsl(var(--color-border))] px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
            // ABOUT
          </p>
          <h1 className="mb-6 max-w-3xl font-sans text-5xl font-semibold leading-tight tracking-tight text-[hsl(var(--color-text))] md:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mb-8 max-w-2xl font-sans text-lg leading-relaxed text-[hsl(var(--color-text-dim))]">
            {t('hero.subtitle')}
          </p>
          <p className="max-w-2xl font-mono text-sm tracking-wide text-[hsl(var(--color-phosphor))]">
            {t('hero.mission')}
          </p>
        </div>
      </section>

      {/* Why Costwave */}
      <section className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-6 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-text-mute))]">
                {t('why.problemTitle').toUpperCase()}
              </p>
              <h2 className="mb-4 font-sans text-3xl font-semibold text-[hsl(var(--color-text))]">
                {t('why.problemTitle')}
              </h2>
              <p className="font-sans text-base leading-relaxed text-[hsl(var(--color-text-dim))]">
                {t('why.problem')}
              </p>
            </div>
            <div>
              <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
                {t('why.solutionTitle').toUpperCase()}
              </p>
              <h2 className="mb-4 font-sans text-3xl font-semibold text-[hsl(var(--color-text))]">
                {t('why.solutionTitle')}
              </h2>
              <p className="font-sans text-base leading-relaxed text-[hsl(var(--color-text-dim))]">
                {t('why.solution')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-[hsl(var(--color-border))] px-6 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12">
            <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
              // HOW IT WORKS
            </p>
            <h2 className="font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
              {t('howItWorks.title')}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StepCard
              icon={<Link2 className="h-5 w-5" strokeWidth={1.5} />}
              number="1"
              title={t('howItWorks.step1.title')}
              description={t('howItWorks.step1.description')}
            />
            <StepCard
              icon={<Eye className="h-5 w-5" strokeWidth={1.5} />}
              number="2"
              title={t('howItWorks.step2.title')}
              description={t('howItWorks.step2.description')}
            />
            <StepCard
              icon={<Bell className="h-5 w-5" strokeWidth={1.5} />}
              number="3"
              title={t('howItWorks.step3.title')}
              description={t('howItWorks.step3.description')}
            />
            <StepCard
              icon={<Code className="h-5 w-5" strokeWidth={1.5} />}
              number="4"
              title={t('howItWorks.step4.title')}
              description={t('howItWorks.step4.description')}
            />
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-6 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
            // OPEN SOURCE
          </p>
          <h2 className="mb-6 font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
            {t('openSource.title')}
          </h2>
          <p className="mb-6 font-sans text-lg leading-relaxed text-[hsl(var(--color-text-dim))]">
            {t('openSource.description')}
          </p>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            <Badge className="rounded-sm border-[hsl(var(--color-phosphor))] bg-[hsl(var(--color-phosphor))]/10 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
              {t('openSource.license')}
            </Badge>
            <Badge className="rounded-sm border-[hsl(var(--color-phosphor))] bg-[hsl(var(--color-phosphor))]/10 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
              {t('openSource.selfHostable')}
            </Badge>
          </div>

          <p className="mb-6 font-mono text-base font-semibold tracking-wide text-[hsl(var(--color-text))]">
            {t('openSource.verifyCode')}
          </p>

          <a
            href="https://github.com/matthieu-rgb/costwave"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel-2))] px-6 py-3 font-mono text-[11px] tracking-[0.15em] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg))]"
          >
            <ExternalLink className="h-4 w-4" />
            VIEW ON GITHUB
          </a>
        </div>
      </section>

      {/* Contact */}
      <section className="px-6 py-20">
        <div className="container mx-auto max-w-4xl">
          <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
            // CONTACT
          </p>
          <h2 className="mb-8 font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
            {t('contact.title')}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-none border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-none border border-[hsl(var(--color-border))] text-[hsl(var(--color-phosphor))]">
                <Mail className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 font-mono text-sm font-semibold text-[hsl(var(--color-text))]">
                Email
              </h3>
              <a
                href={`mailto:${t('contact.email')}`}
                className="font-mono text-xs text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-phosphor))]"
              >
                {t('contact.email')}
              </a>
            </Card>

            <Card className="rounded-none border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-none border border-[hsl(var(--color-border))] text-[hsl(var(--color-phosphor))]">
                <ExternalLink className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 font-mono text-sm font-semibold text-[hsl(var(--color-text))]">
                {t('contact.github')}
              </h3>
              <a
                href="https://github.com/matthieu-rgb/costwave"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-phosphor))]"
              >
                @matthieu-rgb/costwave
              </a>
            </Card>

            <Card className="rounded-none border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-none border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-mute))]">
                <ExternalLink className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 font-mono text-sm font-semibold text-[hsl(var(--color-text))]">
                {t('contact.linkedin')}
              </h3>
              <p className="font-mono text-xs text-[hsl(var(--color-text-mute))]">
                {t('contact.linkedinPlaceholder')}
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
