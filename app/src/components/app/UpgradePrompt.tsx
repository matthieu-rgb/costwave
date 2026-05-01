'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  feature: string;
  currentCount: number;
  maxAllowed: number;
}

export function UpgradePrompt({ feature, currentCount, maxAllowed }: UpgradePromptProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <Alert className="bg-[hsl(var(--color-panel-2))] border-[hsl(var(--color-amber))] rounded-sm">
      <AlertCircle className="h-4 w-4 text-[hsl(var(--color-amber))]" strokeWidth={1.5} />
      <AlertDescription className="font-mono text-xs text-[hsl(var(--color-text-dim))] ml-2">
        <span className="text-[hsl(var(--color-amber))]">LIMIT REACHED:</span> You have{' '}
        <span className="text-[hsl(var(--color-text))]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {currentCount}/{maxAllowed}
        </span>{' '}
        {feature} on the Free plan.{' '}
        <Link
          href={`/${locale}/app/billing`}
          className="text-[hsl(var(--color-phosphor))] hover:underline inline-flex items-center gap-1"
        >
          Upgrade to Pro →
        </Link>
      </AlertDescription>
    </Alert>
  );
}
