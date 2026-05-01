import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { providerCredential } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AddProviderDialog } from '@/components/app/AddProviderDialog';

export default async function ProvidersPage() {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((m) => m.headers()),
  });

  if (!session?.user?.id) {
    redirect('/en/signin');
  }

  const providers = await db.query.providerCredential.findMany({
    where: eq(providerCredential.userId, session.user.id),
    orderBy: desc(providerCredential.createdAt),
  });

  const providerNames: Record<string, string> = {
    anthropic: 'Anthropic',
    openai: 'OpenAI',
    groq: 'Groq',
    mistral: 'Mistral AI',
    google: 'Google AI',
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            PROVIDERS
          </h1>
          <p className="mt-1 font-mono text-sm text-[hsl(var(--mc-text-dim))]">
            Manage your LLM provider API credentials
          </p>
        </div>
        <AddProviderDialog />
      </div>

      {providers.length === 0 ? (
        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="font-mono text-sm text-[hsl(var(--mc-text-dim))]">
              No providers configured
            </div>
            <AddProviderDialog />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => {
            const syncAge = provider.lastSync
              ? Math.floor((Date.now() - provider.lastSync.getTime()) / (1000 * 60 * 60))
              : null;

            return (
              <Link key={provider.id} href={`/providers/${provider.id}`}>
                <Card className="group cursor-pointer rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-4 transition-colors hover:border-[hsl(var(--mc-phosphor))]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-sm font-semibold">
                          {providerNames[provider.providerType] || provider.providerType}
                        </h3>
                        <Badge
                          variant="outline"
                          className="rounded-sm border-[hsl(var(--mc-green))] bg-[hsl(var(--mc-green))]/10 font-mono text-[10px] text-[hsl(var(--mc-green))]"
                        >
                          CONNECTED
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                        {provider.label}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--mc-border))] pt-3">
                    <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                      {provider.lastSync ? (
                        <>
                          Synced{' '}
                          {syncAge !== null && syncAge < 1
                            ? 'just now'
                            : syncAge !== null && syncAge < 24
                              ? `${syncAge}h ago`
                              : `${Math.floor(syncAge! / 24)}d ago`}
                        </>
                      ) : (
                        'Never synced'
                      )}
                    </div>
                    <div className="font-mono text-xs text-[hsl(var(--mc-phosphor))]">
                      VIEW →
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
