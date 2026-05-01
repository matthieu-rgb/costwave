import Link from 'next/link';
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
            FEATURES
          </Link>
          <Link href="/pricing" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
            PRICING
          </Link>
          <Link href="/docs" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
            DOCS
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="font-mono text-[10px] tracking-[0.15em] text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]"
          >
            SIGN IN
          </Link>
          <Link
            href="/signup"
            className="rounded-sm bg-[hsl(var(--color-text))] px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.15em] text-[hsl(var(--color-bg))] hover:bg-[hsl(var(--color-text))]/90"
          >
            SIGN UP →
          </Link>
        </div>
      </div>
    </header>
  );
}

function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))]">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 font-mono text-sm font-semibold tracking-[0.15em] text-[hsl(var(--color-text))]">
              COSTWAVE
            </div>
            <p className="font-mono text-[10px] leading-relaxed tracking-wide text-[hsl(var(--color-text-mute))]">
              LLM COST OBSERVABILITY PLATFORM. BUILT IN FRANCE, OPERATED IN EUROPE.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-text-mute))]">
              PRODUCT
            </h3>
            <ul className="space-y-2 font-mono text-[10px] tracking-wide">
              <li>
                <Link href="/#features" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-text-mute))]">
              LEGAL
            </h3>
            <ul className="space-y-2 font-mono text-[10px] tracking-wide">
              <li>
                <Link href="/legal/terms" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-[9px] tracking-[0.15em] text-[hsl(var(--color-text-mute))]">
              CONNECT
            </h3>
            <ul className="space-y-2 font-mono text-[10px] tracking-wide">
              <li>
                <a
                  href="https://github.com/yourusername/costwave"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@costwave.app"
                  className="text-[hsl(var(--color-text-dim))] hover:text-[hsl(var(--color-text))]"
                >
                  Contact
                </a>
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
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
