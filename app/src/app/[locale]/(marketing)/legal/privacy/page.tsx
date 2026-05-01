import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - Costwave',
  description: 'Privacy Policy for Costwave platform',
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="prose prose-invert max-w-none space-y-6 font-sans text-sm leading-relaxed text-[hsl(var(--color-text-dim))]">
          <p className="font-mono text-xs text-[hsl(var(--color-text-mute))]">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              1. Information We Collect
            </h2>
            <p>
              We collect the following types of information:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Account information: email address, name, password (hashed)</li>
              <li>Usage data: LLM provider usage statistics, costs, and metadata</li>
              <li>API keys: encrypted with AES-256-GCM (zero-knowledge architecture)</li>
              <li>Billing information: processed and stored by Stripe</li>
              <li>Technical data: IP address, browser type, device information</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Provide and maintain the Service</li>
              <li>Process your payments and manage subscriptions</li>
              <li>Send you service-related notifications and alerts</li>
              <li>Improve and optimize the Service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              3. Zero-Knowledge Encryption
            </h2>
            <p>
              Your LLM provider API keys are encrypted using AES-256-GCM with keys derived from your password using Argon2id. We cannot decrypt your API keys without your password. If you lose your password, you will lose access to your encrypted API keys.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              4. Data Sharing
            </h2>
            <p>
              We do not sell your personal information. We share data with:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Stripe: for payment processing</li>
              <li>Resend: for transactional emails</li>
              <li>Service providers: under strict confidentiality agreements</li>
              <li>Legal authorities: when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              5. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. After account deletion, we retain certain data for up to 30 days for backup purposes, then permanently delete it. Billing records are retained for 7 years for legal compliance.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              6. Your Rights (GDPR)
            </h2>
            <p>
              If you are in the EU, you have the right to:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at: privacy@costwave.app
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              7. Cookies
            </h2>
            <p>
              We use essential cookies for authentication and session management. See our Cookie Policy for details.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              8. Security
            </h2>
            <p>
              We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and access controls. However, no system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              9. International Transfers
            </h2>
            <p>
              Your data is stored in the EU (France). If you access the Service from outside the EU, your information may be transferred internationally. We ensure appropriate safeguards are in place.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              10. Children's Privacy
            </h2>
            <p>
              The Service is not intended for users under 18 years old. We do not knowingly collect data from children.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              12. Contact Us
            </h2>
            <p>
              For privacy questions or to exercise your rights, contact us at: privacy@costwave.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
