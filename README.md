# Costwave

Real-time AI cost tracking across providers, agents, and workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/[username]/costwave)](https://github.com/[username]/costwave/stargazers)

[screenshot placeholder: Costwave dashboard]

## Features

- **5 LLM Providers**: Anthropic, OpenAI, Groq, Mistral, Google
- **Budget Management**: Set limits with automatic alerts (50%, 75%, 90%, 100%)
- **Real-Time Tracking**: API ingestion for custom workflows and agents
- **Python SDK**: Track costs from Python scripts and automation
- **Claude Code Hooks**: Automatic session tracking for Claude Code
- **n8n Integration**: Custom node for no-code workflow tracking
- **PWA Support**: Install on iOS, Android, Mac, Windows
- **Self-Hosted or SaaS**: Full data control with self-hosting option
- **Multi-Language**: English, French, German
- **Zero-Knowledge Encryption**: API keys encrypted with AES-256-GCM

## Quick Start (SaaS)

1. Sign up at https://costwave.app
2. Connect a provider via **Providers > Add Provider**
3. Set a budget via **Budgets > New Budget**
4. Start tracking costs in real-time

## Quick Start (Self-Hosted)

```bash
git clone https://github.com/[username]/costwave.git
cd costwave
cp .env.example .env
# Edit .env with your configuration
docker compose up -d
cd app && npx drizzle-kit push
```

Visit http://localhost:3001

See [Self-Hosting Guide](docs/self-hosting.md) for complete setup.

## Documentation

- [Getting Started](docs/getting-started.md) - Account setup and first provider
- [API Reference](docs/api-reference.md) - Integrate custom workflows
- [Python SDK](docs/sdk-python.md) - Track agent costs from Python
- [Claude Code Hook](docs/claude-code-hook.md) - Automatic Claude Code tracking
- [n8n Integration](docs/n8n-integration.md) - No-code workflow tracking
- [Budgets and Alerts](docs/budgets-and-alerts.md) - Budget management and notifications
- [Self-Hosting](docs/self-hosting.md) - Deploy your own instance
- [Architecture](docs/architecture.md) - Technical deep dive
- [Contributing](docs/contributing.md) - Contribute to Costwave

## Architecture

```
User
  |
  +-- Web Dashboard (PWA)
  +-- Python SDK
  +-- Claude Code Hook
  +-- n8n Custom Node
  |
  v
Costwave API (Next.js 15)
  |
  +-- PostgreSQL (events, budgets, credentials)
  +-- Langfuse v4 (LLM tracing)
  +-- Stripe (billing)
  +-- Resend (email alerts)
  +-- Web Push (notifications)
```

See [Architecture Docs](docs/architecture.md) for details.

## Pricing

| Plan | Price | Providers | Budgets | History | Push Alerts | Radar |
|------|-------|-----------|---------|---------|-------------|-------|
| **Free** | $0 | 1 | 1 | 30 days | No | No |
| **Pro** | $4.99/month | Unlimited | Unlimited | Unlimited | Yes | Yes |

Upgrade from **Settings > Billing**.

## Use Cases

### Track Multi-Provider Agent Costs

```python
from costwave import CostwaveClient

client = CostwaveClient(api_key="ck_live_...")

# Track Anthropic call
client.track(
    provider="anthropic",
    model="claude-sonnet-4-5-20250929",
    input_tokens=1250,
    output_tokens=420,
    workflow_name="customer-support-agent",
)
```

### Monitor Claude Code Sessions

```bash
# Add to ~/.zshrc
export COSTWAVE_API_KEY="ck_live_..."
alias claude="/path/to/costwave/hooks/costwave-claude.sh"

# Use Claude Code normally
claude "Build a React component"
# Tracked automatically in dashboard
```

### Budget Alerts for Production

Set a $500/month budget on your production Anthropic key. Get email + push notifications at 75%, 90%, and 100%.

### Track n8n Workflow Costs

Install the Costwave n8n node, add it after LLM calls, and see costs per workflow run in the dashboard.

## Screenshots

[screenshot: dashboard with cost charts]

[screenshot: provider detail view]

[screenshot: budgets list with alerts]

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.6, Tailwind CSS v4
- **UI**: shadcn/ui, Radix UI, Recharts
- **Auth**: Better Auth (passkey, magic link, 2FA)
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Encryption**: AES-256-GCM + Argon2id
- **Payments**: Stripe Checkout + Customer Portal
- **Email**: Resend + React Email
- **Push**: Web Push API (VAPID)
- **Jobs**: pg-boss (Postgres-based queue)
- **LLM Tracking**: Langfuse v4 (self-hosted)
- **PWA**: Serwist
- **i18n**: next-intl (EN, FR, DE)

## Security

- **Zero-knowledge encryption**: API keys encrypted with vault key derived from `ENCRYPTION_PEPPER` + `userId`
- **Hashed API keys**: Costwave API keys hashed with bcrypt (10 rounds)
- **Rate limiting**: 1000 requests/minute per API key
- **Session security**: httpOnly cookies, SameSite=Lax
- **Audit logs**: All sensitive actions logged with IP, userAgent, timestamp

See [Architecture Docs](docs/architecture.md#encryption-architecture) for details.

## Contributing

Contributions welcome! See [Contributing Guide](docs/contributing.md).

Steps:
1. Fork the repo
2. Create a feature branch: `git checkout -b feature/add-cohere-provider`
3. Make changes following [CLAUDE.md](CLAUDE.md) code style
4. Add tests
5. Submit PR with clear description

## Development

```bash
# Clone repo
git clone https://github.com/[username]/costwave.git
cd costwave

# Start infrastructure
docker compose up -d postgres langfuse-web

# Install dependencies
cd app && npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with local values

# Run migrations
npx drizzle-kit push

# Start dev server
npm run dev
```

Visit http://localhost:3001

## Roadmap

- [ ] Additional providers (Cohere, Together, Replicate)
- [ ] Organization/team accounts
- [ ] Public REST API for budget management
- [ ] Webhooks for budget alerts
- [ ] Zapier/Make integrations
- [ ] Mobile apps (iOS, Android)
- [ ] Light mode
- [ ] SSO (SAML, OAuth)

See [Backlog](backlog.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/[username]/costwave/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[username]/costwave/discussions)
- **Email**: support@[domain]

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Better Auth](https://better-auth.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Stripe](https://stripe.com/)
- [Langfuse](https://langfuse.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

Made with care by [Matthieu](https://0xmatthieu.dev)
