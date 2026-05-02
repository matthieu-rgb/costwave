# Architecture

Deep dive into Costwave's technical architecture, data flow, and design decisions.

## Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5.6 | Server and client components, routing |
| **UI** | Tailwind CSS v4, shadcn/ui, Radix UI | Design system, accessible components |
| **Charts** | Recharts 2.15 | Cost visualizations |
| **State** | TanStack Query v5 | Server state caching, revalidation |
| **Auth** | Better Auth | Email, magic link, passkey, 2FA |
| **Database** | PostgreSQL 16 (Drizzle ORM) | Relational data, JSONB for metadata |
| **Encryption** | Node.js crypto (AES-256-GCM, Argon2id) | API key vault, zero-knowledge |
| **Payments** | Stripe Checkout + Customer Portal | Subscription billing (Free, Pro) |
| **Email** | Resend + React Email | Transactional emails, budget alerts |
| **Push** | Web Push API (VAPID) | Push notifications (Pro) |
| **Jobs** | pg-boss | Background tasks (budget checks, usage sync) |
| **LLM Tracking** | Langfuse v4 (self-hosted) | LLM observability (optional) |
| **PWA** | Serwist (Next.js plugin) | Offline support, installable |
| **i18n** | next-intl | Multi-language (EN, FR, DE) |
| **Deployment** | Docker Compose, Caddy, Cloudflare Tunnel | Self-hosted or VPS |

## Data Flow

### Provider Usage Tracking

```
1. User adds provider credential (Anthropic API key)
2. Key encrypted with AES-256-GCM (vault key derived from ENCRYPTION_PEPPER + userId)
3. Stored in provider_credential table
4. Background job (poll-usage) runs every 6 hours
5. Fetches usage from provider Admin API (if available)
6. Stores in provider_usage_snapshot table
7. Dashboard aggregates snapshots for charts
```

**Limitations**: Not all providers expose Admin API. Anthropic, OpenAI require organization-level keys. For others, use API ingestion.

### API Ingestion (Real-Time Tracking)

```
1. External workflow (Python SDK, Claude Code hook, n8n) calls POST /api/v1/events/ingest
2. API key validated (bcrypt hash comparison)
3. Rate limit checked (1000 req/min per key, in-memory)
4. Event validated (Zod schema)
5. Cost calculated server-side (token count * pricing)
6. Event inserted into event table
7. Dashboard updated via SSE stream
8. Optionally sent to Langfuse for LLM tracing
```

**Advantages**: Works for any LLM provider, no Admin API required, real-time.

### Budget Alerts

```
1. Background job (check-budgets) runs every 15 minutes
2. Fetches all active budgets
3. For each budget:
   a. Aggregate events for current period (day/week/month)
   b. Calculate total cost
   c. Compare to thresholds (50%, 75%, 90%, 100%)
   d. If threshold crossed and not already alerted:
      - Send email via Resend
      - Send push notification (if Pro + subscribed)
      - Insert into budget_alert_sent (deduplication)
4. Repeat
```

**Deduplication**: `(budgetId, threshold, periodStart)` unique constraint prevents duplicate alerts.

## Database Schema

### Authentication Tables

Managed by Better Auth (Drizzle adapter):

- `user`: Core identity, locale, theme preferences
- `account`: OAuth providers (future)
- `session`: Active sessions with device info (IP, userAgent)
- `verification`: Email verification tokens
- `two_factor`: TOTP secrets, backup codes
- `passkey`: WebAuthn credentials

### Provider Credentials

```sql
provider_credential (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES user(id) ON DELETE CASCADE,
  provider_type TEXT CHECK (provider_type IN ('anthropic', 'openai', 'groq', 'mistral', 'google')),
  label TEXT,  -- User-friendly name
  encrypted_api_key TEXT,  -- Format: v1:pv1:iv:tag:ciphertext
  scope TEXT,  -- Permission scope (future)
  last_sync TIMESTAMP,  -- Last usage fetch
  created_at TIMESTAMP DEFAULT NOW()
)
```

**Encryption format**: `v1:pv1:iv:tag:ciphertext`
- `v1`: Schema version (supports algorithm migration)
- `pv1`: Pepper version (supports key rotation)
- `iv`: 12-byte random IV (hex-encoded)
- `tag`: 16-byte GCM authentication tag (hex-encoded)
- `ciphertext`: AES-256-GCM encrypted key (hex-encoded)

### Usage Snapshots

```sql
provider_usage_snapshot (
  id UUID PRIMARY KEY,
  credential_id UUID REFERENCES provider_credential(id),
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  model TEXT,  -- LLM model identifier
  requests INT,  -- Total API requests
  input_tokens BIGINT,
  output_tokens BIGINT,
  cached_tokens BIGINT,
  cost_usd NUMERIC(12, 8),  -- 8 decimal precision
  raw JSONB,  -- Original API response
  created_at TIMESTAMP DEFAULT NOW()
)
```

**Indexes**: `(credential_id, period_start)`, `(period_start, period_end)`, `(created_at DESC)`

### Events

```sql
event (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES user(id),
  workflow_id UUID REFERENCES workflow(id),
  run_id UUID,  -- Execution run identifier
  parent_run_id UUID,  -- Nested workflows
  type TEXT,  -- Event type (llm_generation, tool_call, etc.)
  status TEXT CHECK (status IN ('started', 'success', 'error')),
  started_at TIMESTAMP,
  duration_ms INT,
  tokens_in INT,
  tokens_out INT,
  cost_usd NUMERIC(12, 8),
  langfuse_trace_id TEXT,  -- Integration with Langfuse
  metadata JSONB,  -- Custom fields
  created_at TIMESTAMP DEFAULT NOW()
)
```

**Indexes**: `(user_id, workflow_id, started_at DESC)`, `(run_id)`, `(langfuse_trace_id)`, `(run_id, parent_run_id)`

### Budgets

```sql
budget (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES user(id),
  scope TEXT CHECK (scope IN ('global', 'provider', 'workflow')),
  target_id UUID,  -- provider_credential.id or workflow.id (NULL for global)
  period TEXT CHECK (period IN ('day', 'week', 'month')),
  amount_usd NUMERIC(10, 2),
  alert_thresholds INT[],  -- e.g., [50, 75, 90, 100]
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (
    (scope = 'global' AND target_id IS NULL) OR
    (scope != 'global' AND target_id IS NOT NULL)
  )
)

budget_alert_sent (
  id UUID PRIMARY KEY,
  budget_id UUID REFERENCES budget(id),
  threshold INT,  -- Percentage (50, 75, etc.)
  period_start TIMESTAMP,  -- Start of billing period
  sent_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (budget_id, threshold, period_start)  -- Deduplication
)
```

### API Keys

```sql
api_key (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES user(id),
  name TEXT,  -- User-provided label
  key_prefix TEXT,  -- First 16 chars (e.g., "ck_live_abc12345")
  key_hash TEXT,  -- bcrypt hash of full key
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP  -- Soft delete
)
```

**Format**: `ck_[env]_[secret]`
- `ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (48 chars total)
- Prefix (16 chars) is indexed for fast lookups
- Full key hashed with bcrypt (10 rounds)

## Encryption Architecture

### Zero-Knowledge Vault

User API keys are encrypted such that:
1. Server never sees plaintext (encrypted client-side or immediately after receipt)
2. Vault key derived from `ENCRYPTION_PEPPER` + `userId`
3. Vault key re-derived on each decryption (not stored)
4. If `ENCRYPTION_PEPPER` is lost, all encrypted keys are unrecoverable

**Threat model**: Protects against database leaks, but not against compromised `ENCRYPTION_PEPPER` or server-side memory dump.

### Vault Key Derivation

```typescript
import { hash } from '@node-rs/argon2';
import crypto from 'crypto';

// Salt: SHA-256(userId:pepper)
const salt = crypto
  .createHash('sha256')
  .update(`${userId}:${process.env.ENCRYPTION_PEPPER}`)
  .digest('hex')
  .substring(0, 32);  // 16 bytes (32 hex chars)

// Derive 32-byte key
const vaultKey = await hash(process.env.ENCRYPTION_PEPPER, {
  algorithm: argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,  // Iterations
  parallelism: 4,  // Threads
  hashLength: 32,  // Bytes (256 bits for AES-256)
  salt: Buffer.from(salt, 'hex'),
  outputType: 'binary',
});
```

**Properties**:
- **Per-user isolation**: Salt includes `userId`
- **Memory-hard**: 64 MB prevents GPU attacks
- **Slow**: 3 iterations + high memory = ~100ms on server CPU
- **Deterministic**: Same inputs = same key

### Encryption/Decryption

```typescript
import crypto from 'crypto';

function encrypt(plaintext: string, vaultKey: Buffer): string {
  const iv = crypto.randomBytes(12);  // 12 bytes for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', vaultKey, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();  // 16 bytes

  return `v1:pv1:${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext.toString('hex')}`;
}

function decrypt(encrypted: string, vaultKey: Buffer): string {
  const [version, pepperVersion, ivHex, tagHex, ciphertextHex] = encrypted.split(':');

  if (version !== 'v1') throw new Error('Unsupported version');
  if (pepperVersion !== 'pv1') throw new Error('Pepper rotation required');

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    vaultKey,
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}
```

**Security properties**:
- **Authenticated encryption**: GCM tag prevents tampering
- **Unique IVs**: Random IV per encryption prevents pattern analysis
- **Forward compatibility**: Version prefix supports algorithm upgrades

## Pricing Engine

### Token-Based Costing

All costs are calculated server-side using static pricing tables.

**Formula**:
```
cost_usd = (input_tokens / 1M * input_price) + (output_tokens / 1M * output_price) + (cached_tokens / 1M * cached_price)
```

**Precision**: `NUMERIC(12, 8)` = 8 decimal places (supports costs as low as $0.00000001).

**Pricing Table** (excerpt):

```typescript
const PRICING = {
  anthropic: {
    'claude-opus-4-5-20251101': { input: 15.0, output: 75.0, cached: 1.5 },
    'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0, cached: 0.3 },
  },
  openai: {
    'gpt-4o-2024-11-20': { input: 2.5, output: 10.0, cached: 1.25 },
  },
  // ... (per 1M tokens)
};
```

**Fallback**: Unknown models default to $0.00 (prevents errors, but user should verify).

## Stripe Integration

### Subscription Flow

```
1. User clicks "Upgrade to Pro"
2. Client calls server action createCheckoutSession()
3. Server creates Stripe Checkout session with price ID
4. User redirected to Stripe (hosted page)
5. User completes payment
6. Stripe webhook fires: customer.subscription.created
7. Webhook handler inserts/updates subscription table
8. User redirected back to dashboard (now Pro)
```

### Webhook Events

Handled in `/api/webhooks/stripe`:

| Event | Action |
|-------|--------|
| `customer.subscription.created` | Insert subscription record, set plan=pro |
| `customer.subscription.updated` | Update status (active, canceled, past_due) |
| `customer.subscription.deleted` | Mark as canceled |
| `invoice.payment_succeeded` | Confirm subscription active |
| `invoice.payment_failed` | Mark as past_due, email user |

**Security**: Signature verification with `STRIPE_WEBHOOK_SECRET` (HMAC-SHA256).

## Background Jobs (pg-boss)

### Job Queue

pg-boss uses Postgres as the job queue (no Redis required).

**Tables**: `pgboss.*` schema (auto-created).

**Jobs**:

| Name | Schedule | Handler | Purpose |
|------|----------|---------|---------|
| `poll-usage` | `0 */6 * * *` (every 6h) | `lib/jobs/poll-usage.ts` | Sync provider usage snapshots |
| `check-budgets` | `*/15 * * * *` (every 15min) | `lib/jobs/check-budgets.ts` | Compare spend to budgets, send alerts |

**Worker**: Started in `instrumentation.ts` (Next.js instrumentation hook).

**Idempotency**: Jobs use `singletonKey` to prevent duplicate runs.

## Real-Time Updates (SSE)

### Server-Sent Events Endpoint

`GET /api/stream/[userId]`

**Flow**:

```
1. Client connects with session cookie
2. Server validates session, checks userId matches
3. Server sends initial batch (last 50 events)
4. Server polls database every 2 seconds for new events
5. Server sends new events as SSE messages
6. Client listens and updates UI
7. Heartbeat every 30 seconds to keep connection alive
```

**Message format**:

```
event: init
data: {"events": [...]}

event: event
data: {"id": "...", "type": "...", "cost_usd": "..."}
```

**Security**: Session-based auth, user can only see their own events.

## PWA (Progressive Web App)

### Service Worker (Serwist)

**Features**:
- Offline fallback pages
- Asset caching (icons, fonts, locales)
- API route caching (NetworkFirst strategy)
- Background sync (future)

**Manifest**: `/app/manifest.ts` generates `manifest.webmanifest` dynamically.

**Install prompt**: Custom UI (toast) after 30 seconds, uses `beforeinstallprompt` event.

## Observability

### Health Endpoint

`GET /api/health`:

```json
{
  "status": "ok",
  "db": "connected",
  "langfuse": "connected",
  "timestamp": "2026-04-30T12:00:00.000Z"
}
```

Pings:
- Postgres: `SELECT 1`
- Langfuse: `GET /api/public/health` (3s timeout)

### Audit Logs

All sensitive actions logged to `audit_log`:

| Action | Resource | Metadata |
|--------|----------|----------|
| `api_key.created` | API key ID | `{name, keyPrefix}` |
| `api_key.revoked` | API key ID | `{revokedAt}` |
| `provider.added` | Credential ID | `{providerType, label}` |
| `provider.removed` | Credential ID | `{providerType}` |
| `subscription.upgraded` | Subscription ID | `{plan, stripeCustomerId}` |
| `subscription.canceled` | Subscription ID | `{canceledAt}` |

**Context**: IP, userAgent, timestamp, userId.

## Security Considerations

1. **API Keys**: Hashed with bcrypt (10 rounds), never logged in plaintext
2. **Provider Credentials**: Encrypted with AES-256-GCM, vault key never persisted
3. **Sessions**: 30-day expiry, httpOnly cookies, SameSite=Lax
4. **CSRF**: Better Auth built-in protection
5. **Rate Limiting**: 1000 req/min on ingest API, 5 req/15min on auth
6. **Input Validation**: Zod schemas on all user inputs
7. **SQL Injection**: Drizzle ORM parameterized queries
8. **XSS**: React auto-escaping, CSP headers (future)

## Performance

### Database Indexes

Critical indexes for query performance:

- `event(user_id, workflow_id, started_at DESC)` - Dashboard queries
- `event(run_id)` - Workflow detail queries
- `provider_usage_snapshot(credential_id, period_start)` - Provider charts
- `api_key(key_prefix)` - API key lookups
- `budget_alert_sent(budget_id, threshold, period_start)` - Deduplication

### Caching

- **TanStack Query**: 5-minute stale time for dashboard data
- **Server Components**: Cached until revalidation (Next.js default)
- **Serwist**: Static assets cached for 1 year

## Deployment Architecture

```
Cloudflare Tunnel / Reverse Proxy (Caddy/Nginx)
  |
  v
Next.js App (Docker container, port 3001)
  |
  +-- PostgreSQL (Docker container, port 5432)
  +-- Langfuse Stack (optional)
      +-- ClickHouse (analytics)
      +-- Redis (cache)
      +-- MinIO (object storage)
```

**Scaling**: Single-node sufficient for < 10k users. For > 10k, add:
- Read replicas (Postgres)
- Redis for session store
- Horizontal scaling (Next.js app instances behind load balancer)

## Future Enhancements

- **Webhooks**: Send budget alerts to external services (Slack, PagerDuty)
- **Public API**: REST API for budget management, usage queries
- **GraphQL**: Alternative to REST for complex queries
- **Multi-tenancy**: Organization-level accounts with role-based access
- **SSO**: SAML, OAuth (Google, GitHub)
- **Exports**: CSV, JSON exports of usage data
- **Light mode**: Currently dark mode only

## Next Steps

- **[Self-Hosting](./self-hosting.md)** - Deploy your own instance
- **[Contributing](./contributing.md)** - Contribute improvements
- **[API Reference](./api-reference.md)** - Build integrations
