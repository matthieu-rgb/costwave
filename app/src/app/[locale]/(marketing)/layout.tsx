import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

async function MarketingHeader() {
  const t = await getTranslations('marketing');

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))]/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-full items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm font-semibold tracking-[0.15em] text-[hsl(var(--color-text))]">
          COSTWAVE
        </Link>

        <nav className="hidden items-center gap-6 font-mono text-[10px] tracking-[0.15em] md:flex">
          <Link href="/#features" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
            {t('header.features').toUpperCase()}
          </Link>
          <Link href="/pricing" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
            {t('header.pricing').toUpperCase()}
          </Link>
          <Link href="/about" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
            {t('header.about').toUpperCase()}
          </Link>
          <Link href="/security" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
            {t('header.security').toUpperCase()}
          </Link>
          <a
            href="https://github.com/matthieu-rgb/costwave/tree/main/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]"
          >
            {t('header.docs').toUpperCase()}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="login"
            className="font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]"
          >
            {t('header.signin').toUpperCase()}
          </Link>
          <Link
            href="signup"
            className="rounded-sm bg-[hsl(var(--color-text))] px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.15em] text-[hsl(var(--color-bg))] hover:bg-[hsl(var(--color-text))]/90"
          >
            {t('header.signup').toUpperCase()} →
          </Link>
        </div>
      </div>
    </header>
  );
}

async function MarketingFooter() {
  const currentYear = new Date().getFullYear();
  const t = await getTranslations('marketing');

  return (
    <footer className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))]">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 font-mono text-sm font-semibold tracking-[0.15em] text-[hsl(var(--color-text))]">
              COSTWAVE
            </div>
            <p className="font-mono text-[10px] leading-relaxed tracking-wide text-[hsl(var(--color-text-mute))]">
              {t('footer.tagline').toUpperCase()}
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-text-mute))]">
              {t('footer.company').toUpperCase()}
            </h3>
            <ul className="space-y-2 font-mono text-[10px] tracking-wide">
              <li>
                <Link href="/about" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  {t('footer.security')}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@costwave.app"
                  className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]"
                >
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-text-mute))]">
              {t('footer.resources').toUpperCase()}
            </h3>
            <ul className="space-y-2 font-mono text-[10px] tracking-wide">
              <li>
                <Link href="/#features" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  {t('footer.features')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  {t('footer.pricing')}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/matthieu-rgb/costwave/tree/main/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]"
                >
                  {t('footer.docs')}
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/matthieu-rgb/costwave"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]"
                >
                  {t('footer.github')}
                </a>
              </li>
              <li>
                <span className="text-[hsl(var(--color-text-mute))]">
                  {t('footer.blog')} ({t('footer.blogPlaceholder')})
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-text-mute))]">
              {t('footer.legal').toUpperCase()}
            </h3>
            <ul className="space-y-2 font-mono text-[10px] tracking-wide">
              <li>
                <Link href="/legal/terms" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  {t('footer.cookies')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--color-border))] pt-6 font-mono text-[9px] tracking-wide text-[hsl(var(--color-text-mute))] md:flex-row">
          <div>
            © {currentYear} COSTWAVE. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/en" className="hover:text-[hsl(var(--color-text))]">
              EN
            </Link>
            <span>·</span>
            <Link href="/fr" className="hover:text-[hsl(var(--color-text))]">
              FR
            </Link>
            <span>·</span>
            <Link href="/de" className="hover:text-[hsl(var(--color-text))]">
              DE
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main-content" className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
