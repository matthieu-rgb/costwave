'use client';

import { useEffect, useState } from 'react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

export function InstallPrompt() {
  const { isInstallable, isInstalled, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const t = useTranslations('push.install');

  useEffect(() => {
    if (!isInstallable || isInstalled || dismissed) return;

    // Afficher toast apres 30s
    const timer = setTimeout(() => {
      toast(
        <div className="flex items-start gap-3">
          <Download className="h-5 w-5 text-[hsl(var(--mc-phosphor))]" />
          <div className="flex-1">
            <p className="font-mono text-sm font-semibold">{t('title')}</p>
            <p className="mt-1 font-sans text-xs text-[hsl(var(--mc-text-dim))]">{t('description')}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={async () => {
                  const accepted = await install();
                  if (accepted) toast.success(t('installed'));
                }}
                className="rounded bg-[hsl(var(--mc-text))] px-3 py-1.5 font-mono text-xs font-semibold text-[hsl(var(--mc-bg))]"
              >
                {t('install')}
              </button>
              <button
                onClick={() => {
                  setDismissed(true);
                  toast.dismiss();
                }}
                className="rounded border border-[hsl(var(--mc-border))] px-3 py-1.5 font-mono text-xs"
              >
                {t('dismiss')}
              </button>
            </div>
          </div>
        </div>,
        { duration: Infinity }
      );
    }, 30000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, dismissed, install, t]);

  return null;
}
