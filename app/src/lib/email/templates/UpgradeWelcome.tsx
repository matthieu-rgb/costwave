import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';

interface UpgradeWelcomeEmailProps {
  userName?: string;
  plan: 'monthly' | 'yearly';
}

export default function UpgradeWelcomeEmail({
  userName = 'there',
  plan = 'monthly',
}: UpgradeWelcomeEmailProps) {
  const billingPeriod = plan === 'yearly' ? '39.99 EUR/year' : '4.99 EUR/month';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>COSTWAVE</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Welcome to Costwave Pro</Text>

            <Text style={paragraph}>
              Hi {userName},
            </Text>

            <Text style={paragraph}>
              Thank you for upgrading to Costwave Pro ({billingPeriod}). You now have access to all Pro features:
            </Text>

            <Section style={features}>
              <Text style={featureItem}>✓ Unlimited LLM providers</Text>
              <Text style={featureItem}>✓ Unlimited budgets and alerts</Text>
              <Text style={featureItem}>✓ Unlimited history</Text>
              <Text style={featureItem}>✓ Claude Code Radar (real-time)</Text>
              <Text style={featureItem}>✓ Push notifications</Text>
              <Text style={featureItem}>✓ CSV/JSON exports</Text>
              <Text style={featureItem}>✓ Priority support</Text>
            </Section>

            <Hr style={divider} />

            <Text style={paragraph}>
              Your subscription will renew automatically on the same day each{' '}
              {plan === 'yearly' ? 'year' : 'month'}. You can manage your subscription, update payment methods, or cancel anytime from your{' '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/billing`} style={link}>
                billing dashboard
              </Link>
              .
            </Text>

            <Text style={paragraph}>
              Need help getting started? Check out our{' '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/docs`} style={link}>
                documentation
              </Link>{' '}
              or reach out to{' '}
              <Link href="mailto:support@costwave.app" style={link}>
                support@costwave.app
              </Link>
              .
            </Text>

            <Hr style={divider} />

            <Text style={footer}>
              COSTWAVE · LLM COST OBSERVABILITY PLATFORM
              <br />
              Built in France, operated in Europe
              <br />
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}`} style={footerLink}>
                costwave.app
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#07090B',
  fontFamily: 'IBM Plex Mono, monospace',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  padding: '20px 0',
  borderBottom: '1px solid #1A2128',
};

const logo = {
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '0.15em',
  color: '#D8E1E8',
  margin: 0,
};

const content = {
  padding: '20px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 600,
  color: '#D8E1E8',
  margin: '0 0 20px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#7B8893',
  margin: '0 0 16px',
};

const features = {
  margin: '20px 0',
  padding: '16px',
  backgroundColor: '#0D1115',
  border: '1px solid #1A2128',
};

const featureItem = {
  fontSize: '13px',
  lineHeight: '1.8',
  color: '#D8E1E8',
  margin: '0 0 8px',
};

const divider = {
  borderColor: '#1A2128',
  margin: '24px 0',
};

const link = {
  color: '#5EE6D0',
  textDecoration: 'none',
};

const footer = {
  fontSize: '11px',
  lineHeight: '1.6',
  color: '#4C5963',
  textAlign: 'center' as const,
  margin: '24px 0 0',
};

const footerLink = {
  color: '#7B8893',
  textDecoration: 'none',
};
