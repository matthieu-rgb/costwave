'use client';

interface BudgetGaugeProps {
  value: number; // 0-100
  max?: number;
  size?: number;
  label?: string;
}

/**
 * Mission Control budget gauge component.
 *
 * SVG circular gauge with percentage indicator.
 * Color changes based on severity:
 * - 0-60%: green (ok)
 * - 61-80%: amber (warn)
 * - 81-95%: red (crit)
 * - 96-100%: red pulsing (breach)
 *
 * Design: circular progress ring, centered percentage, tabular-nums
 */
export function BudgetGauge({
  value,
  max = 100,
  size = 120,
  label,
}: BudgetGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine color based on percentage
  const getColor = () => {
    if (percentage <= 60) return 'hsl(var(--mc-green))';
    if (percentage <= 80) return 'hsl(var(--mc-amber))';
    return 'hsl(var(--mc-red))';
  };

  const getSeverity = () => {
    if (percentage <= 60) return 'ok';
    if (percentage <= 80) return 'warn';
    if (percentage <= 95) return 'crit';
    return 'breach';
  };

  const color = getColor();
  const severity = getSeverity();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className={severity === 'breach' ? 'animate-pulse' : ''}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--mc-border))"
            strokeWidth={strokeWidth}
            opacity={0.2}
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: 'stroke-dashoffset 0.5s ease',
            }}
          />
        </svg>

        {/* Centered percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="font-mono text-2xl font-semibold tabular-nums"
            style={{ color }}
          >
            {percentage.toFixed(0)}%
          </div>
        </div>
      </div>

      {label && (
        <div className="font-mono text-xs text-[hsl(var(--mc-text-dim))]">
          {label}
        </div>
      )}
    </div>
  );
}
