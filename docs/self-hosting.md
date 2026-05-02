# Self-Hosting Costwave

Run Costwave on your own infrastructure for full data control and customization.

## Prerequisites

- **Docker** 24.0+ with Compose v2
- **PostgreSQL** 16+ (or use Docker Compose stack)
- **8 GB RAM** minimum (16 GB recommended)
- **20 GB disk space** for database and logs
- **Linux/macOS** host (tested on Ubuntu 22.04, macOS 14+)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/[username]/costwave.git
cd costwave
```

### 2. Configure Environment

Copy example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

### 3. Start Services

```bash
docker compose up -d
```

Services started:
- **postgres**: Database
- **clickhouse**: Analytics (Langfuse dependency)
- **redis**: Caching (Langfuse dependency)
- **minio**: Object storage (Langfuse dependency)
- **langfuse-web**: Langfuse UI (port 3000)
- **langfuse-worker**: Background job processor
- **app**: Costwave Next.js app (port 3001)

### 4. Run Database Migrations

```bash
cd app
npm install
npx drizzle-kit push
```

### 5. Access Application

- **Costwave**: http://localhost:3001
- **Langfuse**: http://localhost:3000 (optional, for LLM tracing)

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Postgres connection string | `postgres://app:password@postgres:5432/costwave` |
| `BETTER_AUTH_SECRET` | Session encryption key (32+ chars) | Generate with `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Public URL of your deployment | `https://costwave.yourdomain.com` |
| `ENCRYPTION_PEPPER` | Vault key derivation salt (32+ chars) | Generate with `openssl rand -hex 32` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe API key (if using paywall) | None (paywall disabled) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | None |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | None |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro plan monthly price ID | None |
| `STRIPE_PRICE_PRO_YEARLY` | Pro plan yearly price ID | None |
| `RESEND_API_KEY` | Email service API key | None (email disabled) |
| `EMAIL_FROM` | Sender email address | `Costwave <noreply@yourdomain.com>` |
| `VAPID_PUBLIC_KEY` | Web Push public key | Generate with `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Web Push private key | Generate with `npx web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | Web Push contact email | `mailto:admin@yourdomain.com` |

### Langfuse Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LANGFUSE_PUBLIC_KEY` | Langfuse project public key | From Langfuse dashboard |
| `LANGFUSE_SECRET_KEY` | Langfuse project secret key | From Langfuse dashboard |
| `LANGFUSE_HOST` | Langfuse URL | `http://langfuse-web:3000` |
| `LANGFUSE_SALT` | Langfuse encryption salt | Generate with `openssl rand -hex 32` |
| `NEXTAUTH_SECRET` | NextAuth session key (Langfuse) | Generate with `openssl rand -hex 32` |

### Example `.env`

```bash
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://costwave.yourdomain.com
SELF_HOSTED=true

# Database
DATABASE_URL=postgres://app:SecurePassword123@postgres:5432/costwave
POSTGRES_PASSWORD=SecurePassword123

# Better Auth
BETTER_AUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
BETTER_AUTH_URL=https://costwave.yourdomain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://costwave.yourdomain.com

# Langfuse (obtain from Langfuse UI after first setup)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=http://langfuse-web:3000
LANGFUSE_SALT=q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6
NEXTAUTH_SECRET=z1x2c3v4b5n6m7a8s9d0f1g2h3j4k5l6
CLICKHOUSE_PASSWORD=ClickhouseSecure456
MINIO_ROOT_PASSWORD=MinioSecure789

# Stripe (optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# Email (optional)
RESEND_API_KEY=re_...
EMAIL_FROM=Costwave <noreply@yourdomain.com>

# Web Push (optional)
VAPID_PUBLIC_KEY=BF4...
VAPID_PRIVATE_KEY=5G2...
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Internal
ENCRYPTION_PEPPER=p1o2i3u4y5t6r7e8w9q0
```

## Docker Compose Stack

### Services Overview

```
postgres:5432       - PostgreSQL database (Costwave + Langfuse)
clickhouse:8123     - ClickHouse (Langfuse analytics)
redis:6379          - Redis (Langfuse cache)
minio:9000          - MinIO (Langfuse object storage)
langfuse-web:3000   - Langfuse web UI
langfuse-worker     - Langfuse background jobs
app:3001            - Costwave Next.js app
```

### Health Checks

All services include health checks with automatic restart on failure.

Verify all services are healthy:

```bash
docker compose ps
```

Expected output: All services with `(healthy)` status.

### Logs

View logs for a specific service:

```bash
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f langfuse-web
```

## Database Setup

### Initial Migration

After first start, apply Drizzle schema:

```bash
cd app
npx drizzle-kit push
```

This creates 13 tables:
- `user`, `account`, `session`, `verification`, `two_factor`, `passkey` (auth)
- `api_key`, `provider_credential`, `provider_usage_snapshot` (providers)
- `subscription` (billing)
- `budget`, `budget_alert_sent` (budgets)
- `workflow`, `event` (tracking)
- `push_subscription`, `audit_log` (notifications, audit)

### Database Isolation

Costwave uses database `costwave`. Langfuse uses database `postgres` (default).

To create separate databases (recommended for production):

```sql
-- Connect to postgres as superuser
psql -U postgres -h localhost

CREATE DATABASE costwave;
CREATE DATABASE langfuse;

GRANT ALL PRIVILEGES ON DATABASE costwave TO app;
GRANT ALL PRIVILEGES ON DATABASE langfuse TO app;
```

Update `DATABASE_URL` and Langfuse connection strings accordingly.

## First User Signup

1. Navigate to http://localhost:3001 (or your public URL)
2. Click **Sign Up**
3. Create account with email/password
4. Verify email (check Resend dashboard if email enabled, or check logs for magic link)

The first user has no special admin privileges by default. All users are equal in self-hosted mode.

## Backups

### Database Backup

Use `pg_dump` for regular backups:

```bash
# Manual backup
docker compose exec postgres pg_dump -U app costwave > backup-$(date +%Y%m%d).sql

# Automated daily backup (cron)
0 2 * * * cd /path/to/costwave && docker compose exec -T postgres pg_dump -U app costwave | gzip > /backups/costwave-$(date +\%Y\%m\%d).sql.gz
```

### Restore from Backup

```bash
# Stop app to prevent writes
docker compose stop app

# Restore
cat backup-20260430.sql | docker compose exec -T postgres psql -U app costwave

# Restart app
docker compose start app
```

### Volume Backups

Backup Docker volumes (Langfuse data):

```bash
docker run --rm \
  -v costwave_langfuse_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/langfuse-data-$(date +%Y%m%d).tar.gz /data
```

## Updates

### Update Costwave Code

```bash
cd /path/to/costwave
git pull origin main
cd app
npm install
npx drizzle-kit push  # Apply new migrations
docker compose restart app
```

### Update Docker Images

```bash
docker compose pull
docker compose up -d
```

## Reverse Proxy Setup

Use Caddy, Nginx, or Traefik to expose Costwave publicly with HTTPS.

### Caddy Example

`Caddyfile`:

```
costwave.yourdomain.com {
  reverse_proxy localhost:3001
  encode gzip
  log {
    output file /var/log/caddy/costwave.log
  }
}
```

Start Caddy:

```bash
caddy run --config Caddyfile
```

### Nginx Example

`/etc/nginx/sites-available/costwave`:

```nginx
server {
  listen 80;
  server_name costwave.yourdomain.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name costwave.yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/costwave.yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/costwave.yourdomain.com/privkey.pem;

  location / {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/costwave /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Cloudflare Tunnel

For zero-config HTTPS without exposing ports:

1. Install `cloudflared`
2. Create tunnel: `cloudflared tunnel create costwave`
3. Configure `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: <tunnel-id>
   credentials-file: /home/user/.cloudflared/<tunnel-id>.json
   ingress:
     - hostname: costwave.yourdomain.com
       service: http://localhost:3001
     - service: http_status:404
   ```
4. Start tunnel: `cloudflared tunnel run costwave`

See [Cloudflare Tunnel docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) for details.

## Monitoring

### Health Endpoint

```bash
curl http://localhost:3001/api/health
```

Response:

```json
{
  "status": "ok",
  "db": "connected",
  "langfuse": "connected",
  "timestamp": "2026-04-30T12:00:00.000Z"
}
```

Use for uptime monitoring (UptimeRobot, Pingdom, etc.).

### Logs

Structured JSON logs (production) or pretty logs (development):

```bash
docker compose logs -f app | jq .
```

### Metrics (Optional)

Integrate with Prometheus/Grafana:

1. Expose metrics from Next.js (add `@opentelemetry/api`)
2. Scrape `/metrics` endpoint
3. Visualize in Grafana

## Troubleshooting

### App Won't Start

- **Check logs**: `docker compose logs app`
- **Verify DATABASE_URL**: `docker compose exec app env | grep DATABASE_URL`
- **Test DB connection**:
  ```bash
  docker compose exec postgres psql -U app -d costwave -c "SELECT 1;"
  ```

### Langfuse UI Shows 500 Error

- **Check ClickHouse**: `docker compose logs clickhouse`
- **Check MinIO**: `docker compose logs minio`
- **Verify Langfuse env vars**: `docker compose exec langfuse-web env | grep LANGFUSE`

### Out of Disk Space

Check disk usage:

```bash
docker system df
```

Prune old images/volumes:

```bash
docker system prune -a --volumes
```

### Migration Fails

- **Issue**: `drizzle-kit push` errors
- **Fix**:
  1. Drop all tables: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
  2. Re-run migration: `npx drizzle-kit push`
  3. Restore data from backup if needed

## Security Hardening

1. **Change default passwords**: Postgres, ClickHouse, MinIO
2. **Use strong secrets**: `BETTER_AUTH_SECRET`, `ENCRYPTION_PEPPER` (32+ chars)
3. **Enable firewall**: Block ports 5432, 8123, 9000, 6379 (only allow from app)
4. **HTTPS only**: Use reverse proxy with valid SSL cert
5. **Regular updates**: Run `git pull && docker compose up -d` weekly
6. **Backup encryption**: Encrypt backups with `gpg` before offsite storage
7. **Audit logs**: Monitor `audit_log` table for suspicious activity

## Next Steps

- **[Getting Started](./getting-started.md)** - Set up your first provider and budget
- **[API Reference](./api-reference.md)** - Integrate with your apps
- **[Contributing](./contributing.md)** - Contribute improvements back
