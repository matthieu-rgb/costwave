import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Key, Shield, Info, User, Server, Database, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Security - Costwave',
  description: 'How Costwave encrypts your API keys and protects your data.',
};

function EncryptionCard({
  icon,
  title,
  algo,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  algo: string;
  description: string;
}) {
  return (
    <Card className="rounded-none border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-none border border-[hsl(var(--color-border))] text-[hsl(var(--color-phosphor))]">
        {icon}
      </div>
      <h3 className="mb-2 font-mono text-lg font-semibold text-[hsl(var(--color-text))]">
        {title}
      </h3>
      <Badge className="mb-3 rounded-sm border-[hsl(var(--color-phosphor))] bg-[hsl(var(--color-phosphor))]/10 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
        {algo}
      </Badge>
      <p className="font-sans text-sm leading-relaxed text-[hsl(var(--color-text-dim))]">
        {description}
      </p>
    </Card>
  );
}

export default async function SecurityPage() {
  const t = await getTranslations('security');

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-[hsl(var(--color-border))] px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
            // SECURITY
          </p>
          <h1 className="mb-6 max-w-3xl font-sans text-5xl font-semibold leading-tight tracking-tight text-[hsl(var(--color-text))] md:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="max-w-2xl font-mono text-lg tracking-wide text-[hsl(var(--color-phosphor))]">
            {t('hero.tagline')}
          </p>
        </div>
      </section>

      {/* Encryption Matrix */}
      <section className="border-b border-[hsl(var(--color-border))] px-6 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12">
            <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
              // ENCRYPTION & HASHING
            </p>
            <h2 className="font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
              {t('encryption.title')}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <EncryptionCard
              icon={<Lock className="h-5 w-5" strokeWidth={1.5} />}
              title={t('encryption.passwords.title')}
              algo={t('encryption.passwords.algo')}
              description={t('encryption.passwords.description')}
            />
            <EncryptionCard
              icon={<Key className="h-5 w-5" strokeWidth={1.5} />}
              title={t('encryption.providerKeys.title')}
              algo={t('encryption.providerKeys.algo')}
              description={t('encryption.providerKeys.description')}
            />
            <EncryptionCard
              icon={<Shield className="h-5 w-5" strokeWidth={1.5} />}
              title={t('encryption.costwaveKeys.title')}
              algo={t('encryption.costwaveKeys.algo')}
              description={t('encryption.costwaveKeys.description')}
            />
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-6 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12">
            <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
              // ARCHITECTURE
            </p>
            <h2 className="mb-4 font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
              {t('architecture.title')}
            </h2>
            <p className="font-sans text-lg text-[hsl(var(--color-text-dim))]">
              {t('architecture.description')}
            </p>
          </div>

          <div className="mb-8 overflow-x-auto rounded-sm border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] p-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))]">
                  <User className="h-6 w-6 text-[hsl(var(--color-text-dim))]" strokeWidth={1.5} />
                </div>
                <p className="max-w-[100px] text-center font-mono text-[10px] leading-tight text-[hsl(var(--color-text-dim))]">
                  {t('architecture.flow.userInput')}
                </p>
              </div>

              <ArrowRight className="hidden h-5 w-5 flex-shrink-0 self-center text-[hsl(var(--color-phosphor))] md:block" strokeWidth={1.5} />
              <div className="block h-5 w-5 rotate-90 text-[hsl(var(--color-phosphor))] md:hidden">
                <ArrowRight strokeWidth={1.5} />
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-[hsl(var(--color-phosphor))] bg-[hsl(var(--color-phosphor))]/10">
                  <Lock className="h-6 w-6 text-[hsl(var(--color-phosphor))]" strokeWidth={1.5} />
                </div>
                <p className="max-w-[120px] text-center font-mono text-[10px] leading-tight text-[hsl(var(--color-text-dim))]">
                  {t('architecture.flow.serverEncrypt')}
                </p>
                <Badge className="rounded-sm border-[hsl(var(--color-phosphor))] bg-[hsl(var(--color-phosphor))]/10 font-mono text-[8px] tracking-[0.1em] text-[hsl(var(--color-phosphor))]">
                  {t('architecture.flow.encryptionAlgo')}
                </Badge>
              </div>

              <ArrowRight className="hidden h-5 w-5 flex-shrink-0 self-center text-[hsl(var(--color-phosphor))] md:block" strokeWidth={1.5} />
              <div className="block h-5 w-5 rotate-90 text-[hsl(var(--color-phosphor))] md:hidden">
                <ArrowRight strokeWidth={1.5} />
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))]">
                  <Database className="h-6 w-6 text-[hsl(var(--color-text-dim))]" strokeWidth={1.5} />
                </div>
                <p className="max-w-[100px] text-center font-mono text-[10px] leading-tight text-[hsl(var(--color-text-dim))]">
                  {t('architecture.flow.dbStorage')}
                </p>
              </div>

              <ArrowRight className="hidden h-5 w-5 flex-shrink-0 self-center text-[hsl(var(--color-text-dim))] md:block" strokeWidth={1.5} />
              <div className="block h-5 w-5 rotate-90 text-[hsl(var(--color-text-dim))] md:hidden">
                <ArrowRight strokeWidth={1.5} />
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))]">
                  <Key className="h-6 w-6 text-[hsl(var(--color-text-dim))]" strokeWidth={1.5} />
                </div>
                <p className="max-w-[100px] text-center font-mono text-[10px] leading-tight text-[hsl(var(--color-text-dim))]">
                  {t('architecture.flow.runtime')}
                </p>
              </div>

              <ArrowRight className="hidden h-5 w-5 flex-shrink-0 self-center text-[hsl(var(--color-text-dim))] md:block" strokeWidth={1.5} />
              <div className="block h-5 w-5 rotate-90 text-[hsl(var(--color-text-dim))] md:hidden">
                <ArrowRight strokeWidth={1.5} />
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))]">
                  <Server className="h-6 w-6 text-[hsl(var(--color-text-dim))]" strokeWidth={1.5} />
                </div>
                <p className="max-w-[100px] text-center font-mono text-[10px] leading-tight text-[hsl(var(--color-text-dim))]">
                  {t('architecture.flow.providerCall')}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2 rounded-sm border border-[hsl(var(--color-red-dim))] bg-[hsl(var(--color-red-dim))]/10 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--color-red))]"></div>
                <p className="font-mono text-[10px] tracking-wide text-[hsl(var(--color-red))]">
                  {t('architecture.flow.discard')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-none border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel-2))] p-4">
              <p className="font-mono text-xs tracking-wide text-[hsl(var(--color-phosphor))]">
                {t('architecture.noPlaintext')}
              </p>
            </Card>
            <Card className="rounded-none border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel-2))] p-4">
              <p className="font-mono text-xs tracking-wide text-[hsl(var(--color-phosphor))]">
                {t('architecture.pepperServerOnly')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="border-b border-[hsl(var(--color-border))] px-6 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
            // AUDITABLE CODE
          </p>
          <h2 className="mb-6 font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
            {t('openSource.title')}
          </h2>
          <p className="mb-6 font-sans text-lg leading-relaxed text-[hsl(var(--color-text-dim))]">
            {t('openSource.description')}
          </p>

          <p className="mb-6 font-mono text-base font-semibold tracking-wide text-[hsl(var(--color-text))]">
            {t('openSource.verifyCode')}
          </p>

          <div className="mb-6 rounded-sm border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-4">
            <p className="font-mono text-xs tracking-wide text-[hsl(var(--color-text-dim))]">
              {t('openSource.auditFiles')}
            </p>
          </div>

          <a
            href="https://github.com/matthieu-rgb/costwave"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel-2))] px-6 py-3 font-mono text-[11px] tracking-[0.15em] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg))]"
          >
            VIEW ON GITHUB
          </a>
        </div>
      </section>

      {/* Self-Hostable */}
      <section className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-6 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
            // SELF-HOSTING
          </p>
          <h2 className="mb-6 font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
            {t('selfHostable.title')}
          </h2>
          <p className="mb-8 font-sans text-lg leading-relaxed text-[hsl(var(--color-text-dim))]">
            {t('selfHostable.description')}
          </p>

          <a
            href="https://github.com/matthieu-rgb/costwave/blob/main/docs/deployment.md"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm bg-[hsl(var(--color-text))] px-6 py-3 font-mono text-[11px] font-semibold tracking-[0.15em] text-[hsl(var(--color-bg))] hover:bg-[hsl(var(--color-text))]/90"
          >
            {t('selfHostable.cta').toUpperCase()}
          </a>
        </div>
      </section>

      {/* Compliance V2 */}
      <section className="px-6 py-20">
        <div className="container mx-auto max-w-4xl">
          <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-phosphor))]">
            // COMPLIANCE ROADMAP
          </p>
          <h2 className="mb-8 font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
            {t('compliance.title')}
          </h2>

          <Alert className="rounded-sm border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))]">
            <Info className="h-4 w-4 text-[hsl(var(--color-phosphor))]" strokeWidth={1.5} />
            <AlertDescription className="font-sans text-sm leading-relaxed text-[hsl(var(--color-text-dim))]">
              {t('compliance.v2Roadmap')}
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </div>
  );
}
