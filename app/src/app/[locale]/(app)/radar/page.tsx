import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { RadarView } from '@/components/app/RadarView';

export default async function RadarPage() {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((m) => m.headers()),
  });

  if (!session?.user?.id) {
    redirect('/en/signin');
  }

  return (
    <div className="flex h-screen flex-col bg-[hsl(var(--mc-bg))]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] px-6 py-3">
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="font-semibold text-[hsl(var(--mc-phosphor))]">
            CC.RADAR
          </span>
          <span className="text-[hsl(var(--mc-text-dim))]">·</span>
          <span className="text-[hsl(var(--mc-text-dim))]">
            CONTEXT 45.0k/1M
          </span>
          <span className="text-[hsl(var(--mc-text-dim))]">·</span>
          <span className="text-[hsl(var(--mc-text-dim))]">4.5%</span>
          <span className="text-[hsl(var(--mc-text-dim))]">·</span>
          <span className="text-[hsl(var(--mc-text-dim))]">
            claude-sonnet-4.5
          </span>
          <span className="text-[hsl(var(--mc-text-dim))]">·</span>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--mc-green))]" />
            <span className="text-[hsl(var(--mc-green))]">connected</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <RadarView userId={session.user.id} />

      {/* Legend */}
      <div className="border-t border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-panel))] px-6 py-2">
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--mc-phosphor))]" />
            <span className="text-[hsl(var(--mc-text-dim))]">Write</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--mc-amber))]" />
            <span className="text-[hsl(var(--mc-text-dim))]">Read</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--mc-green))]" />
            <span className="text-[hsl(var(--mc-text-dim))]">Grep</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[hsl(var(--mc-text-dim))]">Sub-agent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-[hsl(var(--mc-text-dim))]">Web</span>
          </div>
        </div>
      </div>

      {/* Terminal Strip */}
      <div className="border-t border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] px-6 py-2">
        <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
          <span className="text-[hsl(var(--mc-phosphor))]">
            /Users/matthieu/Dev/costwave/app
          </span>
          <span className="mx-2">$</span>
          <span>Listening for events...</span>
        </div>
      </div>
    </div>
  );
}
