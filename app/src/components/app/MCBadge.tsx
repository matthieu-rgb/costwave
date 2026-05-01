import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Severity = 'info' | 'warn' | 'crit' | 'breach' | 'ok' | 'live';

interface MCBadgeProps {
  severity: Severity;
  children: React.ReactNode;
  className?: string;
}

const severityStyles: Record<Severity, string> = {
  info: 'border-[hsl(var(--mc-phosphor))] bg-[hsl(var(--mc-phosphor))]/10 text-[hsl(var(--mc-phosphor))]',
  warn: 'border-[hsl(var(--mc-amber))] bg-[hsl(var(--mc-amber))]/10 text-[hsl(var(--mc-amber))]',
  crit: 'border-[hsl(var(--mc-red))] bg-[hsl(var(--mc-red))]/10 text-[hsl(var(--mc-red))]',
  breach: 'border-[hsl(var(--mc-red))] bg-[hsl(var(--mc-red))]/20 text-[hsl(var(--mc-red))] animate-pulse',
  ok: 'border-[hsl(var(--mc-green))] bg-[hsl(var(--mc-green))]/10 text-[hsl(var(--mc-green))]',
  live: 'border-[hsl(var(--mc-phosphor))] bg-[hsl(var(--mc-phosphor))]/10 text-[hsl(var(--mc-phosphor))] animate-pulse',
};

/**
 * Mission Control status badge component.
 *
 * Severity scale:
 * - info: neutral status (blue phosphor)
 * - warn: warning status (amber)
 * - crit: critical status (red)
 * - breach: critical with pulse (red animated)
 * - ok: success status (green)
 * - live: active/live status (phosphor animated)
 *
 * Design: 0px radius, monospace, uppercase, severity-based colors
 */
export function MCBadge({ severity, children, className }: MCBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-sm font-mono text-[10px] uppercase tracking-wide',
        severityStyles[severity],
        className
      )}
    >
      {children}
    </Badge>
  );
}
