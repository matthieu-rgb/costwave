'use client';

import { MCBadge } from './MCBadge';
import { MCDot } from './MCDot';

interface Event {
  id: string;
  type: string;
  status: string;
  startedAt: Date;
  durationMs: number | null;
  metadata: Record<string, unknown> | null;
}

interface EventTimelineProps {
  events: Event[];
  maxItems?: number;
}

/**
 * Mission Control event timeline component.
 *
 * Displays real-time SSE events with kind badges:
 * - WRITE: phosphor (file write operations)
 * - READ: amber (file read operations)
 * - GREP: green (search operations)
 * - AGENT: blue (sub-agent spawns)
 * - WEB: purple (web fetch operations)
 *
 * Design: vertical timeline, monospace timestamps, status dots, kind badges
 */
export function EventTimeline({ events, maxItems = 50 }: EventTimelineProps) {
  const getEventKind = (type: string): 'write' | 'read' | 'grep' | 'agent' | 'web' | 'other' => {
    const lower = type.toLowerCase();
    if (lower.includes('write') || lower.includes('edit')) return 'write';
    if (lower.includes('read')) return 'read';
    if (lower.includes('grep') || lower.includes('search')) return 'grep';
    if (lower.includes('agent') || lower.includes('task')) return 'agent';
    if (lower.includes('web') || lower.includes('fetch')) return 'web';
    return 'other';
  };

  const getKindColor = (kind: string): string => {
    switch (kind) {
      case 'write':
        return 'hsl(var(--mc-phosphor))';
      case 'read':
        return 'hsl(var(--mc-amber))';
      case 'grep':
        return 'hsl(var(--mc-green))';
      case 'agent':
        return '#3b82f6';
      case 'web':
        return '#a855f7';
      default:
        return 'hsl(var(--mc-text-dim))';
    }
  };

  const getStatusDot = (status: string): 'success' | 'error' | 'pending' => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    return 'pending';
  };

  return (
    <div className="space-y-3">
      {events.slice(0, maxItems).map((event) => {
        const kind = getEventKind(event.type);
        const color = getKindColor(kind);
        const time = new Date(event.startedAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });

        return (
          <div
            key={event.id}
            className="flex items-start gap-3 border-l-2 border-[hsl(var(--mc-border))] pl-3"
          >
            <div className="flex min-w-[60px] items-center gap-2 pt-1">
              <span className="font-mono text-[10px] tabular-nums text-[hsl(var(--mc-text-dim))]">
                {time}
              </span>
              <MCDot status={getStatusDot(event.status)} />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="font-mono text-xs font-medium uppercase"
                  style={{ color }}
                >
                  {kind}
                </div>
                {event.durationMs && (
                  <span className="font-mono text-[10px] text-[hsl(var(--mc-text-dim))]">
                    {event.durationMs}ms
                  </span>
                )}
              </div>

              {typeof event.metadata?.message === 'string' && (
                <div className="font-mono text-xs text-[hsl(var(--mc-text))]">
                  {event.metadata.message}
                </div>
              )}

              {typeof event.metadata?.file === 'string' && (
                <div className="font-mono text-[10px] text-[hsl(var(--mc-text-dim))]">
                  {event.metadata.file}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {events.length === 0 && (
        <div className="py-8 text-center font-mono text-xs text-[hsl(var(--mc-text-dim))]">
          No events yet
        </div>
      )}
    </div>
  );
}
