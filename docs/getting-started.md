# Getting Started with Costwave

Welcome to Costwave. This guide will help you set up your account and start tracking AI costs across multiple providers.

## Create Your Account

1. Visit the Costwave dashboard
2. Sign up using one of these methods:
   - **Email and password** - Traditional account with optional 2FA
   - **Magic link** - Passwordless login via email
   - **Passkey** - WebAuthn/biometric authentication (recommended)

3. Verify your email address (if using email/password)

[screenshot: signup page]

## Connect Your First Provider

After signing in, connect an LLM provider to start tracking costs.

### Supported Providers

- **Anthropic** (Claude models)
- **OpenAI** (GPT models)
- **Groq** (Llama, Mixtral)
- **Mistral** (Mistral models)
- **Google** (Gemini models)

### Adding a Provider

1. Navigate to **Providers** in the sidebar
2. Click **Add Provider**
3. Select your provider from the dropdown
4. Enter your API key
5. Give it a label (e.g., "Production Anthropic")
6. Click **Save**

[screenshot: add provider dialog]

### Where to Find API Keys

| Provider | Location |
|----------|----------|
| Anthropic | https://console.anthropic.com/settings/keys |
| OpenAI | https://platform.openai.com/api-keys |
| Groq | https://console.groq.com/keys |
| Mistral | https://console.mistral.ai/api-keys |
| Google | https://aistudio.google.com/apikey |

**Security Note**: Your API keys are encrypted with AES-256-GCM using a vault key derived from your account. Costwave never stores keys in plaintext.

## Create Your First Budget

Budgets help you stay on top of costs with automatic alerts.

1. Navigate to **Budgets** in the sidebar
2. Click **New Budget**
3. Configure:
   - **Scope**: Global (all providers), single provider, or specific workflow
   - **Period**: Day, week, or month
   - **Amount**: Budget limit in USD
   - **Alert thresholds**: Default is 50%, 75%, 90%, 100%
4. Click **Create**

[screenshot: create budget dialog]

You'll receive alerts via:
- **Email** - Sent to your account email
- **Push notifications** - If enabled (Pro plan only)

## Understanding the Dashboard

Your dashboard provides a real-time overview of AI costs.

[screenshot: dashboard view]

### Key Metrics

- **Total Cost (MTD)** - Month-to-date spending across all providers
- **Active Budgets** - Number of budgets with alerts
- **Top Providers** - Highest spending providers this period
- **Recent Events** - Latest API calls and workflow runs

### Cost Chart

The 7-day cost heatmap shows spending patterns by provider. Hover over any cell to see:
- Provider name
- Date
- Total cost
- Request count
- Token usage (input/output)

### Event Timeline

Real-time stream of tracked events from:
- Provider API usage (if synced)
- API ingestion calls
- Claude Code sessions
- n8n workflows
- Custom integrations

## Next Steps

- **[API Reference](./api-reference.md)** - Integrate custom workflows
- **[Python SDK](./sdk-python.md)** - Track agent costs from Python
- **[Claude Code Hook](./claude-code-hook.md)** - Automatic Claude Code tracking
- **[n8n Integration](./n8n-integration.md)** - Track n8n workflow costs

## Free vs Pro Plans

| Feature | Free | Pro |
|---------|------|-----|
| Providers | 1 | Unlimited |
| Budgets | 1 | Unlimited |
| History | 30 days | Unlimited |
| Push Notifications | No | Yes |
| Real-time Radar | No | Yes |
| Support | Community | Priority |

Upgrade to Pro from **Settings > Billing**.
