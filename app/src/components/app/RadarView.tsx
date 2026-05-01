'use client';

import { useStream } from '@/hooks/useStream';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface RadarViewProps {
  userId: string;
}

export function RadarView({ userId }: RadarViewProps) {
  const { events, connected, error } = useStream(userId);

  // Extract unique files and agents from events
  const files = new Set<string>();
  const agents = new Set<string>();

  events.forEach((event) => {
    if (event.metadata) {
      if (event.metadata.file) {
        files.add(event.metadata.file as string);
      }
      if (event.metadata.agent) {
        agents.add(event.metadata.agent as string);
      }
    }
  });

  const getEventColor = (type: string) => {
    if (type.includes('write') || type.includes('edit'))
      return 'hsl(var(--mc-phosphor))';
    if (type.includes('read')) return 'hsl(var(--mc-amber))';
    if (type.includes('grep') || type.includes('search'))
      return 'hsl(var(--mc-green))';
    if (type.includes('agent')) return '#3b82f6';
    if (type.includes('web')) return '#a855f7';
    return 'hsl(var(--mc-text-dim))';
  };

  const getStatusColor = (status: string) => {
    if (status === 'success') return 'hsl(var(--mc-green))';
    if (status === 'error') return 'hsl(var(--mc-red))';
    return 'hsl(var(--mc-amber))';
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Radar Canvas */}
      <div className="flex flex-1 items-center justify-center border-r border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))]">
        <svg
          width="880"
          height="600"
          className="overflow-visible"
          viewBox="0 0 880 600"
        >
          {/* Concentric rings */}
          {[100, 175, 250, 325].map((r, i) => (
            <circle
              key={r}
              cx="440"
              cy="300"
              r={r}
              fill="none"
              stroke="hsl(var(--mc-border))"
              strokeWidth="1"
              opacity={0.3}
            />
          ))}

          {/* Cardinal spokes (12) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x = 440 + Math.cos(angle) * 325;
            const y = 300 + Math.sin(angle) * 325;
            return (
              <line
                key={i}
                x1="440"
                y1="300"
                x2={x}
                y2={y}
                stroke="hsl(var(--mc-border))"
                strokeWidth="1"
                opacity={0.2}
              />
            );
          })}

          {/* Sweep arm (rotating) */}
          <g className="animate-[spin_24s_linear_infinite] origin-[440px_300px]">
            <line
              x1="440"
              y1="300"
              x2="440"
              y2="0"
              stroke="url(#sweep-gradient)"
              strokeWidth="2"
              opacity="0.6"
            />
            <defs>
              <linearGradient
                id="sweep-gradient"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="hsl(var(--mc-phosphor))" />
              </linearGradient>
            </defs>
          </g>

          {/* Center MAIN sprite */}
          <g>
            <circle
              cx="440"
              cy="300"
              r="12"
              fill="hsl(var(--mc-phosphor))"
              opacity="0.3"
            />
            <circle
              cx="440"
              cy="300"
              r="8"
              fill="hsl(var(--mc-phosphor))"
            />
            <text
              x="440"
              y="335"
              textAnchor="middle"
              className="fill-[hsl(var(--mc-text))] font-mono text-[10px]"
            >
              MAIN
            </text>
          </g>

          {/* Sub-agent sprites (orbital) */}
          {Array.from(agents)
            .slice(0, 5)
            .map((agent, i) => {
              const angle = (i * 72 * Math.PI) / 180;
              const r = 190;
              const x = 440 + Math.cos(angle) * r;
              const y = 300 + Math.sin(angle) * r;
              const colors = [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6',
              ];
              return (
                <g key={agent}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={colors[i]}
                    opacity="0.8"
                  />
                  <text
                    x={x}
                    y={y + 20}
                    textAnchor="middle"
                    className="fill-[hsl(var(--mc-text-dim))] font-mono text-[9px]"
                  >
                    {agent.slice(0, 8)}
                  </text>
                </g>
              );
            })}

          {/* File sprites (periphery) */}
          {Array.from(files)
            .slice(0, 12)
            .map((file, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const r = 290;
              const x = 440 + Math.cos(angle) * r;
              const y = 300 + Math.sin(angle) * r;
              return (
                <g key={file}>
                  <rect
                    x={x - 4}
                    y={y - 4}
                    width="8"
                    height="8"
                    fill="hsl(var(--mc-green))"
                    stroke="hsl(var(--mc-green))"
                    strokeWidth="1"
                    rx="0"
                  />
                </g>
              );
            })}
        </svg>
      </div>

      {/* Right: Panels */}
      <div className="flex w-96 flex-col gap-4 overflow-y-auto bg-[hsl(var(--mc-panel))] p-4">
        {/* Connection Status */}
        {error && (
          <Card className="rounded-sm border-[hsl(var(--mc-red))] bg-[hsl(var(--mc-red))]/10 p-3">
            <div className="font-mono text-xs text-[hsl(var(--mc-red))]">
              {error}
            </div>
          </Card>
        )}

        {/* Sub-agents */}
        <Card className="rounded-none border-[hsl(var(--mc-border))] p-0">
          <div className="border-b border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] px-3 py-2">
            <div className="font-mono text-[10px] uppercase tracking-wide text-[hsl(var(--mc-text-dim))]">
              SUB-AGENTS ({agents.size})
            </div>
          </div>
          <div className="divide-y divide-[hsl(var(--mc-border))]">
            {Array.from(agents).length > 0 ? (
              Array.from(agents)
                .slice(0, 10)
                .map((agent) => (
                  <div
                    key={agent}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <span className="font-mono text-xs">{agent}</span>
                    <Badge
                      variant="outline"
                      className="rounded-sm border-[hsl(var(--mc-green))] bg-[hsl(var(--mc-green))]/10 font-mono text-[9px] text-[hsl(var(--mc-green))]"
                    >
                      ACTIVE
                    </Badge>
                  </div>
                ))
            ) : (
              <div className="px-3 py-4 text-center font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                No agents detected
              </div>
            )}
          </div>
        </Card>

        {/* Files Seen */}
        <Card className="rounded-none border-[hsl(var(--mc-border))] p-0">
          <div className="border-b border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] px-3 py-2">
            <div className="font-mono text-[10px] uppercase tracking-wide text-[hsl(var(--mc-text-dim))]">
              FILES SEEN ({files.size})
            </div>
          </div>
          <div className="max-h-48 divide-y divide-[hsl(var(--mc-border))] overflow-y-auto">
            {Array.from(files).length > 0 ? (
              Array.from(files)
                .slice(0, 20)
                .map((file) => {
                  const ext = file.split('.').pop() || '';
                  return (
                    <div
                      key={file}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <span className="truncate font-mono text-xs">
                        {file.split('/').pop()}
                      </span>
                      <Badge
                        variant="outline"
                        className="rounded-sm font-mono text-[9px]"
                      >
                        {ext}
                      </Badge>
                    </div>
                  );
                })
            ) : (
              <div className="px-3 py-4 text-center font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                No files detected
              </div>
            )}
          </div>
        </Card>

        {/* Event Stream */}
        <Card className="flex-1 rounded-none border-[hsl(var(--mc-border))] p-0">
          <div className="border-b border-[hsl(var(--mc-border))] bg-[hsl(var(--mc-bg))] px-3 py-2">
            <div className="font-mono text-[10px] uppercase tracking-wide text-[hsl(var(--mc-text-dim))]">
              EVENT STREAM ({events.length})
            </div>
          </div>
          <div className="max-h-96 divide-y divide-[hsl(var(--mc-border))] overflow-y-auto">
            {events.length > 0 ? (
              events.slice(0, 50).map((event) => {
                const time = new Date(event.startedAt).toLocaleTimeString(
                  'en-US',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  }
                );

                return (
                  <div key={event.id} className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] tabular-nums text-[hsl(var(--mc-text-dim))]">
                        {time}
                      </span>
                      <Badge
                        variant="outline"
                        className="rounded-sm font-mono text-[9px]"
                        style={{
                          borderColor: getEventColor(event.type),
                          backgroundColor: `${getEventColor(event.type)}20`,
                          color: getEventColor(event.type),
                        }}
                      >
                        {event.type}
                      </Badge>
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(event.status),
                        }}
                      />
                    </div>
                    {typeof event.metadata?.message === 'string' && (
                      <div className="mt-1 font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                        {event.metadata.message}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center font-mono text-xs text-[hsl(var(--mc-text-dim))]">
                Waiting for events...
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
