import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Hr,
  Section,
} from '@react-email/components';

interface BudgetAlertEmailProps {
  budgetName: string;
  threshold: number;
  usedAmount: number;
  maxAmount: number;
  period: string;
  locale: 'fr' | 'en' | 'de';
  deepLink: string;
}

const content = {
  fr: {
    subject: 'Alerte Budget',
    title: 'Seuil de budget atteint',
    body: 'Votre budget a atteint',
    details: 'Utilise',
    period: 'Periode',
    action: 'Voir le budget',
    footer:
      'Vous avez recu cette alerte car vous avez configure des alertes de budget dans Costwave.',
  },
  en: {
    subject: 'Budget Alert',
    title: 'Budget threshold reached',
    body: 'Your budget has reached',
    details: 'Used',
    period: 'Period',
    action: 'View Budget',
    footer: 'You received this alert because you configured budget alerts in Costwave.',
  },
  de: {
    subject: 'Budget-Warnung',
    title: 'Budget-Schwelle erreicht',
    body: 'Ihr Budget hat erreicht',
    details: 'Verwendet',
    period: 'Zeitraum',
    action: 'Budget ansehen',
    footer:
      'Sie haben diese Benachrichtigung erhalten, weil Sie Budget-Warnungen in Costwave konfiguriert haben.',
  },
};

export function BudgetAlertEmail({
  budgetName,
  threshold,
  usedAmount,
  maxAmount,
  locale,
  period,
  deepLink,
}: BudgetAlertEmailProps) {
  const t = content[locale];

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Top accent line */}
          <div
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, #5EE6D0, transparent 60%)',
              marginBottom: '24px',
            }}
          />

          {/* Title */}
          <Heading style={styles.title}>{t.title}</Heading>

          {/* Budget Name */}
          <Section style={styles.section}>
            <Text style={styles.budgetName}>{budgetName}</Text>
          </Section>

          {/* Main message */}
          <Section style={styles.section}>
            <Text style={styles.text}>
              {t.body} <strong style={styles.strong}>{threshold}%</strong>.
            </Text>
          </Section>

          {/* Details box */}
          <Section
            style={{
              ...styles.section,
              ...styles.detailsBox,
            }}
          >
            <Text style={styles.detailsLabel}>{t.details}:</Text>
            <Text style={styles.detailsValue}>
              ${usedAmount.toFixed(2)} / ${maxAmount.toFixed(2)}
            </Text>
            <Text style={styles.detailsPeriod}>
              {t.period}: {period}
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={styles.section}>
            <Link
              href={deepLink}
              style={styles.button}
            >
              {t.action} →
            </Link>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Text style={styles.footer}>{t.footer}</Text>

          {/* Branding */}
          <Text style={styles.branding}>
            Costwave Mission Control
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#07090B',
    fontFamily:
      '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace',
    margin: 0,
    padding: '40px 0',
  },
  container: {
    backgroundColor: '#0D1115',
    border: '1px solid #1A2128',
    borderRadius: '0px',
    margin: '0 auto',
    maxWidth: '600px',
    padding: '32px',
  },
  title: {
    color: '#D8E1E8',
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '0.02em',
    margin: '0 0 24px 0',
  },
  budgetName: {
    color: '#D8E1E8',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    margin: '0 0 16px 0',
    textTransform: 'uppercase' as const,
  },
  section: {
    marginBottom: '24px',
  },
  text: {
    color: '#7B8893',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0',
  },
  strong: {
    color: '#E8B86B',
    fontWeight: '600',
  },
  detailsBox: {
    backgroundColor: '#07090B',
    border: '1px solid #1A2128',
    borderLeft: '2px solid #E8B86B',
    padding: '16px',
  },
  detailsLabel: {
    color: '#4C5963',
    fontSize: '10px',
    letterSpacing: '0.15em',
    margin: '0 0 8px 0',
    textTransform: 'uppercase' as const,
  },
  detailsValue: {
    color: '#D8E1E8',
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    fontVariantNumeric: 'tabular-nums',
  },
  detailsPeriod: {
    color: '#7B8893',
    fontSize: '11px',
    margin: '0',
  },
  button: {
    backgroundColor: '#D8E1E8',
    borderRadius: '2px',
    color: '#07090B',
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.15em',
    padding: '12px 24px',
    textDecoration: 'none',
    textTransform: 'uppercase' as const,
  },
  hr: {
    borderColor: '#1A2128',
    borderStyle: 'solid',
    borderWidth: '1px 0 0 0',
    margin: '32px 0',
  },
  footer: {
    color: '#4C5963',
    fontSize: '11px',
    lineHeight: '1.4',
    margin: '0 0 16px 0',
  },
  branding: {
    color: '#4C5963',
    fontSize: '10px',
    letterSpacing: '0.15em',
    margin: '0',
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
  },
};
