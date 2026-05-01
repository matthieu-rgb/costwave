import { cn } from '@/lib/utils';

interface MCPanelHeadProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

/**
 * Mission Control panel header component.
 *
 * Design:
 * - 28px height
 * - Uppercase monospace label (10-11px)
 * - Border bottom separator
 * - Optional action slot (right side)
 * - Background: --mc-bg
 */
export function MCPanelHead({
  children,
  className,
  action,
}: MCPanelHeadProps) {
  return (
    <div
      className={cn(
        'flex h-7 items-center justify-between border-b border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] px-3',
        className
      )}
    >
      <div className="font-mono text-[10px] uppercase tracking-wide text-[hsl(var(--mc-text-dim))]">
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
