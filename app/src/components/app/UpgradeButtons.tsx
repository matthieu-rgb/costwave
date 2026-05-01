'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/app/[locale]/(app)/billing/actions';
import { STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY } from '@/lib/stripe/config';
import { toast } from 'sonner';

export function UpgradeButtons() {
  const router = useRouter();
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);

  const handleUpgrade = async (priceId: string | undefined, isMonthly: boolean) => {
    if (!priceId) {
      toast.error('Price ID not configured');
      return;
    }

    const setLoading = isMonthly ? setLoadingMonthly : setLoadingYearly;
    setLoading(true);

    try {
      const result = await createCheckoutSession({ priceId });

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || 'Failed to create checkout session');
        setLoading(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => handleUpgrade(STRIPE_PRICE_PRO_MONTHLY, true)}
        disabled={loadingMonthly || loadingYearly}
        className="w-full bg-[hsl(var(--color-text))] text-[hsl(var(--color-bg))] hover:bg-[hsl(var(--color-text)/.9)] font-mono text-[10px] tracking-[0.15em] rounded-sm border-0"
      >
        {loadingMonthly ? 'LOADING...' : 'UPGRADE MONTHLY (4.99 EUR/MO) →'}
      </Button>
      <Button
        onClick={() => handleUpgrade(STRIPE_PRICE_PRO_YEARLY, false)}
        disabled={loadingMonthly || loadingYearly}
        variant="outline"
        className="w-full border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-panel-2))] font-mono text-[10px] tracking-[0.15em] rounded-sm"
      >
        {loadingYearly ? 'LOADING...' : 'UPGRADE YEARLY (39.99 EUR/YR) →'}
      </Button>
    </div>
  );
}
