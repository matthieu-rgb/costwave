import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { providerCredential, providerUsageSnapshot } from '@/lib/db/schema';
import { eq, desc, sum, count } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProviderActions } from '@/components/app/ProviderActions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProviderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await import('next/headers').then((m) => m.headers()),
  });

  if (!session?.user?.id) {
    redirect('/en/login');
  }

  const provider = await db.query.providerCredential.findFirst({
    where: eq(providerCredential.id, id),
  });

  if (!provider || provider.userId !== session.user.id) {
    notFound();
  }

  const snapshots = await db.query.providerUsageSnapshot.findMany({
    where: eq(providerUsageSnapshot.credentialId, id),
    orderBy: desc(providerUsageSnapshot.periodStart),
    limit: 50,
  });

  // Calculate aggregated stats
  const totalCost = snapshots.reduce(
    (sum, s) => sum + parseFloat(s.costUsd),
    0
  );
  const totalRequests = snapshots.reduce((sum, s) => sum + s.requests, 0);
  const totalInputTokens = snapshots.reduce(
    (sum, s) => sum + s.inputTokens,
    0
  );
  const totalOutputTokens = snapshots.reduce(
    (sum, s) => sum + s.outputTokens,
    0
  );

  const providerNames: Record<string, string> = {
    anthropic: 'Anthropic',
    openai: 'OpenAI',
    groq: 'Groq',
    mistral: 'Mistral AI',
    google: 'Google AI',
  };

  const syncAge = provider.lastSync
    ? Math.floor((Date.now() - provider.lastSync.getTime()) / (1000 * 60 * 60))
    : null;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-2xl font-semibold tracking-tight">
                {providerNames[provider.providerType] || provider.providerType}
              </h1>
              <Badge
                variant="outline"
                className="rounded-sm border-[hsl(var(--mc-green))] bg-[hsl(var(--mc-green))]/10 font-mono text-[10px] text-[hsl(var(--mc-green))]"
              >
                CONNECTED
              </Badge>
              {snapshots.length > 0 && (
                <Badge
                  variant="outline"
                  className="rounded-sm border-[hsl(var(--mc-phosphor))] bg-[hsl(var(--mc-phosphor))]/10 font-mono text-[10px] text-[hsl(var(--mc-phosphor))]"
                >
                  LIVE
                </Badge>
              )}
            </div>
            <p className="mt-1 font-mono text-sm text-[hsl(var(--mc-text-dim))]">
              {provider.label}
            </p>
          </div>
        </div>

        <ProviderActions credentialId={provider.id} />
      </div>

      {/* Meta */}
      <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
              API Key
            </div>
            <div className="mt-1 font-mono text-xs">sk-••••••••••••••••</div>
          </div>
          <div>
            <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
              Added
            </div>
            <div className="mt-1 font-mono text-xs tabular-nums">
              {provider.createdAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
              Last Sync
            </div>
            <div className="mt-1 font-mono text-xs tabular-nums">
              {provider.lastSync ? (
                <>
                  {syncAge !== null && syncAge < 1
                    ? 'Just now'
                    : syncAge !== null && syncAge < 24
                      ? `${syncAge}h ago`
                      : `${Math.floor(syncAge! / 24)}d ago`}
                </>
              ) : (
                'Never'
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-4">
          <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Total Cost
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">
            ${totalCost.toFixed(2)}
          </div>
        </Card>

        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-4">
          <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Requests
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">
            {totalRequests.toLocaleString()}
          </div>
        </Card>

        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-4">
          <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Input Tokens
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">
            {(totalInputTokens / 1000).toFixed(1)}K
          </div>
        </Card>

        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-4">
          <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Output Tokens
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">
            {(totalOutputTokens / 1000).toFixed(1)}K
          </div>
        </Card>
      </div>

      {/* Snapshots Table */}
      {snapshots.length > 0 ? (
        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-0">
          <div className="border-b border-[hsl(var(--mc-border))] p-4">
            <h3 className="font-mono text-sm font-semibold">
              USAGE SNAPSHOTS
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[hsl(var(--mc-border))]">
                <tr className="bg-[hsl(var(--mc-bg))]">
                  <th className="p-3 text-left font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                    PERIOD
                  </th>
                  <th className="p-3 text-left font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                    MODEL
                  </th>
                  <th className="p-3 text-right font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                    REQUESTS
                  </th>
                  <th className="p-3 text-right font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                    INPUT TOKENS
                  </th>
                  <th className="p-3 text-right font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                    OUTPUT TOKENS
                  </th>
                  <th className="p-3 text-right font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                    COST
                  </th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot) => (
                  <tr
                    key={snapshot.id}
                    className="border-b border-[hsl(var(--mc-border))] hover:bg-[hsl(var(--mc-bg))]"
                  >
                    <td className="p-3 font-mono text-xs tabular-nums">
                      {snapshot.periodStart.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {snapshot.model || 'N/A'}
                    </td>
                    <td className="p-3 text-right font-mono text-xs tabular-nums">
                      {snapshot.requests.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-xs tabular-nums">
                      {snapshot.inputTokens.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-xs tabular-nums">
                      {snapshot.outputTokens.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-xs tabular-nums text-[hsl(var(--mc-phosphor))]">
                      ${parseFloat(snapshot.costUsd).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="font-mono text-sm text-[hsl(var(--mc-text-dim))]">
              No usage data available. Click SYNC to fetch usage.
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
