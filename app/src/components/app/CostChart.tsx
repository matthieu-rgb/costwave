'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  cost: number;
  provider?: string;
}

interface CostChartProps {
  data: DataPoint[];
  height?: number;
}

/**
 * Mission Control cost trend chart.
 *
 * Features:
 * - Recharts AreaChart with phosphor gradient
 * - Monospace tabular-nums labels
 * - Mission Control color palette
 * - Responsive container
 *
 * Design: smooth area curve, phosphor gradient fill, minimal grid
 */
export function CostChart({ data, height = 300 }: CostChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--mc-phosphor))"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--mc-phosphor))"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--mc-border))"
          opacity={0.3}
        />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--mc-text-dim))"
          tick={{ fill: 'hsl(var(--mc-text-dim))', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
          tickLine={{ stroke: 'hsl(var(--mc-border))' }}
        />
        <YAxis
          stroke="hsl(var(--mc-text-dim))"
          tick={{ fill: 'hsl(var(--mc-text-dim))', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
          tickLine={{ stroke: 'hsl(var(--mc-border))' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--mc-panel))',
            border: '1px solid hsl(var(--mc-border))',
            borderRadius: '0',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'hsl(var(--mc-text-dim))' }}
          itemStyle={{ color: 'hsl(var(--mc-phosphor))' }}
          formatter={(value: unknown) => {
            const num = typeof value === 'number' ? value : 0;
            return `$${num.toFixed(2)}`;
          }}
        />
        <Area
          type="monotone"
          dataKey="cost"
          stroke="hsl(var(--mc-phosphor))"
          strokeWidth={2}
          fill="url(#costGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
