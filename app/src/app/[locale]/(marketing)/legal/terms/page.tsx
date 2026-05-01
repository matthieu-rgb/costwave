import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - Costwave',
  description: 'Terms of Service for Costwave platform',
};

export default function TermsPage() {
  return (
    <div className="px-6 py-12">
      <div className="container mx-auto max-w-3xl">
        <Alert className="mb-8 rounded-sm border-[hsl(var(--color-amber))] bg-[hsl(var(--color-amber))]/5">
          <AlertTriangle className="h-4 w-4 text-[hsl(var(--color-amber))]" strokeWidth={1.5} />
          <AlertDescription className="ml-2 font-mono text-xs text-[hsl(var(--color-text-dim))]">
            <span className="text-[hsl(var(--color-amber))]">DRAFT:</span> These terms are a template and must be reviewed by legal counsel before public launch.
          </AlertDescription>
        </Alert>

        <h1 className="mb-8 font-sans text-4xl font-semibold text-[hsl(var(--color-text))]">
          Terms of Service
        </h1>

        <div className="prose prose-invert max-w-none space-y-6 font-sans text-sm leading-relaxed text-[hsl(var(--color-text-dim))]">
          <p className="font-mono text-xs text-[hsl(var(--color-text-mute))]">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Costwave ("Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              2. Description of Service
            </h2>
            <p>
              Costwave provides an observability platform for tracking LLM costs across multiple providers including Anthropic, OpenAI, Groq, Mistral AI, and Google AI. The Service allows you to monitor usage, set budgets, and receive alerts.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              3. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              4. API Keys and Data Security
            </h2>
            <p>
              Your API keys are encrypted using AES-256-GCM encryption with keys derived using Argon2id. We implement zero-knowledge architecture meaning your encryption keys are never stored at rest. You acknowledge that loss of your account password may result in inability to decrypt your API keys.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              5. Subscription and Billing
            </h2>
            <p>
              Costwave offers a Free plan and a Pro plan. Pro subscriptions are billed monthly or annually in advance via Stripe. Subscription fees are non-refundable except as required by law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              6. Acceptable Use
            </h2>
            <p>
              You agree not to use the Service to: (a) violate any laws, (b) infringe on intellectual property rights, (c) transmit malware or harmful code, (d) attempt to gain unauthorized access to the Service or other users' accounts, or (e) interfere with the proper functioning of the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              7. Data Collection and Privacy
            </h2>
            <p>
              Our collection and use of personal information is described in our Privacy Policy. By using the Service, you consent to such collection and use.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              8. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time for violation of these Terms or for any other reason at our discretion.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              9. Limitation of Liability
            </h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              10. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-xl font-semibold text-[hsl(var(--color-text))]">
              11. Contact
            </h2>
            <p>
              For questions about these Terms, contact us at: hello@costwave.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
