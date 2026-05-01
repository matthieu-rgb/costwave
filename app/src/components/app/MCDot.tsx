import { cn } from '@/lib/utils';

type Status = 'active' | 'idle' | 'error' | 'success' | 'pending';

interface MCDotProps {
  status: Status;
  pulse?: boolean;
  className?: string;
}

const statusColors: Record<Status, string> = {
  active: 'bg-[hsl(var(--mc-phosphor))]',
  idle: 'bg-[hsl(var(--mc-text-dim))]',
  error: 'bg-[hsl(var(--mc-red))]',
  success: 'bg-[hsl(var(--mc-green))]',
  pending: 'bg-[hsl(var(--mc-amber))]',
};

const statusGlow: Record<Status, string> = {
  active: 'shadow-[0_0_4px_hsl(var(--mc-phosphor))]',
  idle: '',
  error: 'shadow-[0_0_4px_hsl(var(--mc-red))]',
  success: 'shadow-[0_0_4px_hsl(var(--mc-green))]',
  pending: 'shadow-[0_0_4px_hsl(var(--mc-amber))]',
};

/**
 * Mission Control status pulse dot.
 *
 * Status indicators:
 * - active: phosphor blue (pulsing)
 * - idle: dim gray (no pulse)
 * - error: red (with glow)
 * - success: green (with glow)
 * - pending: amber (with glow)
 *
 * Design: 7-8px circle, glow effect, animation if pulse enabled
 */
export function MCDot({ status, pulse = false, className }: MCDotProps) {
  return (
    <div
      className={cn(
        'h-2 w-2 rounded-full',
        statusColors[status],
        statusGlow[status],
        pulse && 'animate-pulse',
        className
      )}
    />
  );
}
