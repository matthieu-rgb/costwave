# Changelog

All notable changes to Costwave will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-XX-XX

### Added

- **Core Dashboard**: Real-time cost tracking across all providers and workflows
- **5 LLM Providers**: Anthropic (Claude), OpenAI (GPT), Groq (Llama/Mixtral), Mistral, Google (Gemini)
- **Budget Management**: Create budgets with customizable alert thresholds (50%, 75%, 90%, 100%)
- **Email Alerts**: Automatic notifications when budget thresholds are crossed
- **Push Notifications**: Web Push API support for real-time alerts (Pro plan)
- **API Ingestion Endpoint**: POST /api/v1/events/ingest for custom workflow tracking
- **Python SDK**: `costwave-sdk` package for tracking agent costs from Python
- **Claude Code Hooks**: Shell wrapper for automatic Claude Code session tracking
- **n8n Custom Node**: No-code integration for n8n workflows
- **PWA Support**: Installable progressive web app for iOS, Android, Mac, Windows
- **Multi-Language**: Full support for English, French, and German
- **Self-Hosted Deployment**: Docker Compose stack for on-premise deployment
- **Stripe Integration**: Subscription billing with Free and Pro plans
- **Zero-Knowledge Encryption**: AES-256-GCM encryption for API keys with Argon2id key derivation
- **Better Auth**: Email/password, magic link, passkey (WebAuthn), and 2FA (TOTP) authentication
- **Real-Time Event Stream**: Server-Sent Events (SSE) for live dashboard updates
- **Background Jobs**: pg-boss for automated budget checking and usage polling
- **Audit Logs**: Complete audit trail for security-sensitive actions
- **Langfuse Integration**: Optional LLM tracing with self-hosted Langfuse v4

### Technical Details

- **Frontend**: Next.js 15 App Router, React 19, TypeScript 5.6
- **UI**: Tailwind CSS v4, shadcn/ui, Radix UI
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Charts**: Recharts 2.15 for cost visualizations
- **State Management**: TanStack Query v5 for server state
- **Payments**: Stripe Checkout + Customer Portal
- **Email**: Resend + React Email
- **PWA**: Serwist (next-pwa successor)
- **i18n**: next-intl for multi-language support
- **Deployment**: Docker Compose, Caddy, Cloudflare Tunnel

### Security

- API keys hashed with bcrypt (10 rounds)
- Provider credentials encrypted with AES-256-GCM
- Vault key derived from ENCRYPTION_PEPPER + userId using Argon2id
- Rate limiting: 1000 requests/minute per API key
- Session security: httpOnly cookies, SameSite=Lax
- CSRF protection via Better Auth
- Input validation via Zod schemas

### Pricing

| Plan | Price | Providers | Budgets | History | Push | Radar |
|------|-------|-----------|---------|---------|------|-------|
| Free | $0 | 1 | 1 | 30 days | No | No |
| Pro | $4.99/month | Unlimited | Unlimited | Unlimited | Yes | Yes |

[Unreleased]: https://github.com/[username]/costwave/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/[username]/costwave/releases/tag/v1.0.0
