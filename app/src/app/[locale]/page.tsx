import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('landing');

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-mono mb-4">{t('title')}</h1>
        <p className="text-text-dim mb-8">{t('subtitle')}</p>
      </div>
    </main>
  );
}
