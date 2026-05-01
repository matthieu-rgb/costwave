import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy - Costwave',
  description: 'Cookie Policy for Costwave platform',
};

export default function CookiesPage() {
  return (
    <div className="px-6 py-12">
      <div className="container mx-auto max-w-3xl">
        <Alert className="mb-8 rounded-sm border-[hsl(var(--color-amber))] bg-[hsl(var(--color-amber))]/5">
          <AlertTriangle className="h-4 w-4 text-[hsl(var(--color-amber))]" strokeWidth={1.5} />
          <AlertDescription className="ml-2 font-mono text-xs text-[hsl(var(--color-text-dim))]">
            <span className="text-[hsl(var(--color-amber))]">DRAFT:</span> This policy is a template and must be reviewed by legal counsel before public launch.
          </AlertDescription>
        </Alert>

        <h1 className="mb-8 font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
          Cookie Policy
        </h1>

        <div className="prose prose-invert max-w-none space-y-6 font-sans text-sm leading-relaxed text-[hsl(var(--color-text-dim))]">
          <p className="font-mono text-xs text-[hsl(var(--color-text-mute))]">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and enable certain features.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              2. How We Use Cookies
            </h2>
            <p>
              Costwave uses only essential cookies required for the Service to function. We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              3. Essential Cookies
            </h2>
            <p>
              These cookies are necessary for the Service to operate:
            </p>
            <table className="mt-4 w-full border-collapse border border-[hsl(var(--color-border))]">
              <thead>
                <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))]">
                  <th className="border-r border-[hsl(var(--color-border))] p-3 text-left font-mono text-xs">
                    Cookie Name
                  </th>
                  <th className="border-r border-[hsl(var(--color-border))] p-3 text-left font-mono text-xs">
                    Purpose
                  </th>
                  <th className="p-3 text-left font-mono text-xs">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-[hsl(var(--color-border))]">
                  <td className="border-r border-[hsl(var(--color-border))] p-3">
                    better_auth_session
                  </td>
                  <td className="border-r border-[hsl(var(--color-border))] p-3">
                    Authentication session
                  </td>
                  <td className="p-3">30 days</td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border))]">
                  <td className="border-r border-[hsl(var(--color-border))] p-3">
                    locale
                  </td>
                  <td className="border-r border-[hsl(var(--color-border))] p-3">
                    Language preference (FR/EN/DE)
                  </td>
                  <td className="p-3">1 year</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              4. Third-Party Cookies
            </h2>
            <p>
              We use Stripe for payment processing, which may set its own cookies during checkout. Refer to Stripe's privacy policy for details: https://stripe.com/privacy
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              5. Managing Cookies
            </h2>
            <p>
              You can control cookies through your browser settings. However, disabling essential cookies will prevent you from using the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              6. Contact
            </h2>
            <p>
              For questions about our use of cookies, contact us at: privacy@costwave.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
