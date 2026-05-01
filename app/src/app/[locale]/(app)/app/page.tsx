import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { providerCredential, providerUsageSnapshot } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((m) => m.headers()),
  });

  if (!session?.user?.id) {
    redirect('/en/login');
  }

  // Get all user's providers
  const providers = await db.query.providerCredential.findMany({
    where: eq(providerCredential.userId, session.user.id),
  });

  // Get all usage snapshots for user's providers
  const allSnapshots = await db.query.providerUsageSnapshot.findMany({
    where: sql`${providerUsageSnapshot.credentialId} IN (
      SELECT ${providerCredential.id}
      FROM ${providerCredential}
      WHERE ${providerCredential.userId} = ${session.user.id}
    )`,
    orderBy: desc(providerUsageSnapshot.periodStart),
    limit: 100,
  });

  // Calculate total cost MTD (month-to-date)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mtdSnapshots = allSnapshots.filter(
    (s) => s.periodStart >= monthStart
  );
  const totalCostMTD = mtdSnapshots.reduce(
    (sum, s) => sum + parseFloat(s.costUsd),
    0
  );

  // Calculate previous month for evolution
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthSnapshots = allSnapshots.filter(
    (s) => s.periodStart >= lastMonthStart && s.periodStart <= lastMonthEnd
  );
  const totalCostLastMonth = lastMonthSnapshots.reduce(
    (sum, s) => sum + parseFloat(s.costUsd),
    0
  );
  const evolution =
    totalCostLastMonth > 0
      ? ((totalCostMTD - totalCostLastMonth) / totalCostLastMonth) * 100
      : 0;

  // Calculate cost by provider for top 3
  const costByProvider = providers.map((p) => {
    const providerSnapshots = allSnapshots.filter(
      (s) => s.credentialId === p.id
    );
    const cost = providerSnapshots.reduce(
      (sum, s) => sum + parseFloat(s.costUsd),
      0
    );
    return { provider: p, cost };
  });
  const top3Providers = costByProvider
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 3);

  const totalRequests = allSnapshots.reduce((sum, s) => sum + s.requests, 0);

  const providerNames: Record<string, string> = {
    anthropic: 'Anthropic',
    openai: 'OpenAI',
    groq: 'Groq',
    mistral: 'Mistral AI',
    google: 'Google AI',
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 font-mono text-xs text-[hsl(var(--mc-text-dim))]">
          <span>MISSION CONTROL</span>
          <span>/</span>
          <span>DASHBOARD</span>
        </div>
        <h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight">
          OVERVIEW
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-4">
          <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Total MTD
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">
            ${totalCostMTD.toFixed(2)}
          </div>
        </Card>

        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-4">
          <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Month Evolution
          </div>
          <div
            className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${
              evolution > 0
                ? 'text-[hsl(var(--mc-red))]'
                : evolution < 0
                  ? 'text-[hsl(var(--mc-green))]'
                  : ''
            }`}
          >
            {evolution > 0 ? '+' : ''}
            {evolution.toFixed(1)}%
          </div>
        </Card>

        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-4">
          <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Top Providers
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {top3Providers.length > 0 ? (
              top3Providers.map(({ provider }) => (
                <Badge
                  key={provider.id}
                  variant="outline"
                  className="rounded-sm border-[hsl(var(--mc-phosphor))] bg-[hsl(var(--mc-phosphor))]/10 font-mono text-[9px] text-[hsl(var(--mc-phosphor))]"
                >
                  {providerNames[provider.providerType] || provider.providerType}
                </Badge>
              ))
            ) : (
              <span className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                No data
              </span>
            )}
          </div>
        </Card>

        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-4">
          <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Total Requests
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">
            {totalRequests.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-6">
        <div className="mb-4 font-mono text-sm font-semibold">
          COST TREND (30 DAYS)
        </div>
        <div className="flex h-64 items-center justify-center border border-dashed border-[hsl(var(--mc-border))]">
          <span className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Chart component (ÉTAPE 9)
          </span>
        </div>
      </Card>

      {/* Heatmap Placeholder */}
      <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-6">
        <div className="mb-4 font-mono text-sm font-semibold">
          ACTIVITY HEATMAP (7D × 24H)
        </div>
        <div className="flex h-48 items-center justify-center border border-dashed border-[hsl(var(--mc-border))]">
          <span className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
            Heatmap component (ÉTAPE 9)
          </span>
        </div>
      </Card>

      {/* Providers List */}
      {providers.length > 0 && (
        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-0">
          <div className="border-b border-[hsl(var(--mc-border))] p-4">
            <h3 className="font-mono text-sm font-semibold">
              CONNECTED PROVIDERS
            </h3>
          </div>
          <div className="divide-y divide-[hsl(var(--mc-border))]">
            {providers.map((provider) => {
              const providerSnapshots = allSnapshots.filter(
                (s) => s.credentialId === provider.id
              );
              const cost = providerSnapshots.reduce(
                (sum, s) => sum + parseFloat(s.costUsd),
                0
              );

              return (
                <Link
                  key={provider.id}
                  href={`/providers/${provider.id}`}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-[hsl(var(--mc-bg))]"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="rounded-sm border-[hsl(var(--mc-green))] bg-[hsl(var(--mc-green))]/10 font-mono text-[9px] text-[hsl(var(--mc-green))]"
                    >
                      LIVE
                    </Badge>
                    <div>
                      <div className="font-mono text-sm font-semibold">
                        {providerNames[provider.providerType] ||
                          provider.providerType}
                      </div>
                      <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                        {provider.label}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold tabular-nums text-[hsl(var(--mc-phosphor))]">
                      ${cost.toFixed(2)}
                    </div>
                    <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                      {providerSnapshots.reduce(
                        (sum, s) => sum + s.requests,
                        0
                      )}{' '}
                      requests
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      {providers.length === 0 && (
        <Card className="rounded-none border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="font-mono text-sm text-[hsl(var(--mc-text-dim))]">
              No providers configured. Add a provider to get started.
            </div>
            <Link href="/app/providers">
              <button className="rounded-sm border-[hsl(var(--mc-phosphor))] bg-[hsl(var(--mc-phosphor))] px-4 py-2 font-mono text-xs text-white hover:bg-[hsl(var(--mc-phosphor))]/90">
                ADD PROVIDER
              </button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
