'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createPortalSession } from '@/app/[locale]/(app)/app/billing/actions';
import { toast } from 'sonner';

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleManage = async () => {
    setLoading(true);

    try {
      const result = await createPortalSession();

      if (result.success && result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer');
        setLoading(false);
      } else {
        toast.error(result.error || 'Failed to open billing portal');
        setLoading(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManage}
      disabled={loading}
      variant="outline"
      className="border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-panel-2))] font-mono text-[10px] tracking-[0.15em] rounded-sm"
    >
      {loading ? 'LOADING...' : 'MANAGE SUBSCRIPTION →'}
    </Button>
  );
}
