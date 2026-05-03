# Costwave Production Deployment Guide

Complete guide for deploying Costwave to Hetzner VPS.

## Infrastructure Overview

- **VPS**: Hetzner CX33 (8 GB RAM, 4 vCPUs, 80 GB SSD)
- **IP**: 46.62.138.33
- **Domain**: costwave.app (DNS via Cloudflare DNS-only mode)
- **OS**: Ubuntu 24.04
- **User**: matthieu (sudo + docker group)
- **Access**: SSH via Tailscale only

## Architecture

```
Internet
  |
  v
DNS (Cloudflare) -> 46.62.138.33
  |
  v
Firewall (80/443 public, SSH via Tailscale only)
  |
  v
Caddy (reverse proxy + HTTPS via Let's Encrypt)
  |
  v
Next.js App (Docker container, port 3000)
  |
  +-> Postgres (Docker container, port 5432)
  +-> Redis (Docker container, port 6379)
```

## Prerequisites

### Already Completed
- [x] VPS provisioned and accessible
- [x] Docker and Docker Compose installed
- [x] DNS pointing to VPS IP
- [x] Firewall configured (80/443 public)
- [x] Resend domain verified (costwave.app)
- [x] User has sudo and docker group membership

### Required Before Deployment
- [ ] .env.production file with all secrets filled
- [ ] Git repository accessible from VPS
- [ ] Resend API key ready
- [ ] VAPID keys generated (npx web-push generate-vapid-keys)
- [ ] BETTER_AUTH_SECRET and ENCRYPTION_PEPPER already generated

## Step-by-Step Deployment

### 1. SSH to VPS

```bash
# From Mac, connect via Tailscale
ssh matthieu@100.x.x.x
```

### 2. Clone Repository

```bash
# First time deployment
git clone https://github.com/YOUR_USERNAME/costwave.git
cd costwave

# Or update existing deployment
cd costwave
git pull origin main
```

### 3. Prepare Environment File

On your Mac, prepare `.env.production`:

```bash
# Copy template
cp .env.production.template .env.production

# Edit and fill in values
# - Keep existing BETTER_AUTH_SECRET, ENCRYPTION_PEPPER, VAPID keys
# - Add RESEND_API_KEY
# - Generate POSTGRES_PASSWORD and REDIS_AUTH (see below)
# - Leave Stripe and Langfuse vars empty (disabled in V1)
```

Generate random passwords:

```bash
# Generate POSTGRES_PASSWORD
openssl rand -base64 32

# Generate REDIS_AUTH
openssl rand -base64 32
```

Update `.env.production`:
- Replace `CHANGE_ME` in `DATABASE_URL` with the generated POSTGRES_PASSWORD
- Set `POSTGRES_PASSWORD` to the same value
- Set `REDIS_AUTH` to the generated value

### 4. Copy Environment File to VPS

From your Mac:

```bash
scp .env.production matthieu@100.x.x.x:~/costwave/.env.production
```

### 5. Verify DNS Resolution

On VPS:

```bash
dig costwave.app

# Should return:
# costwave.app.  300  IN  A  46.62.138.33
```

### 6. Build and Start Services

```bash
# Build images and start all services
docker compose -f docker-compose.prod.yml up -d --build

# This will:
# - Build the Next.js app (multi-stage Dockerfile)
# - Start Postgres with costwave database
# - Start Redis with authentication
# - Start Caddy reverse proxy
# - Obtain Let's Encrypt SSL certificate automatically
```

### 7. Monitor Startup

```bash
# Watch logs in real-time
docker compose -f docker-compose.prod.yml logs -f

# Or check specific service
docker compose -f docker-compose.prod.yml logs -f costwave
docker compose -f docker-compose.prod.yml logs -f postgres
docker compose -f docker-compose.prod.yml logs -f caddy
```

Wait for:
- Postgres: "database system is ready to accept connections"
- Caddy: "certificate obtained successfully"
- Costwave: Healthcheck passing

### 8. Run Database Migrations

```bash
# Enter Costwave container
docker compose -f docker-compose.prod.yml exec costwave sh

# Inside container, apply migrations
cd app
npx drizzle-kit push

# Verify migrations applied
# Should see: "All schema changes applied successfully"

# Exit container
exit
```

### 9. Verify Health Endpoint

```bash
curl https://costwave.app/api/health

# Expected response:
# {
#   "status": "ok",
#   "db": "connected",
#   "langfuse": "disabled",
#   "timestamp": "2026-05-03T..."
# }
```

### 10. Smoke Tests

#### Test 1: Landing Page
1. Open https://costwave.app in browser
2. Should load without SSL warnings
3. Should show landing page

#### Test 2: User Signup
1. Navigate to https://costwave.app/en/signup
2. Create account with email/password
3. Verify email sent via Resend
4. Confirm account

#### Test 3: Provider Connection
1. Login to https://costwave.app/en/app
2. Navigate to Providers
3. Add a test API key (Anthropic test mode)
4. Verify encryption working (key not visible in DB)

#### Test 4: PWA Install
1. Open in Chrome/Edge
2. Install prompt should appear
3. Install as PWA
4. Launch from desktop/home screen
5. Should work offline for cached pages

#### Test 5: Billing Page
1. Navigate to /en/app/billing
2. Should show Free plan
3. Upgrade buttons should show error toast: "Payment system is not configured" (expected in V1)

## Service Management

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f costwave
docker compose -f docker-compose.prod.yml logs -f postgres
docker compose -f docker-compose.prod.yml logs -f redis
docker compose -f docker-compose.prod.yml logs -f caddy
```

### Restart Services

```bash
# Restart single service
docker compose -f docker-compose.prod.yml restart costwave

# Restart all services
docker compose -f docker-compose.prod.yml restart
```

### Stop Services

```bash
# Stop all services (data persists)
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (DANGEROUS - deletes data)
docker compose -f docker-compose.prod.yml down -v
```

### Update Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations if schema changed
docker compose -f docker-compose.prod.yml exec costwave sh -c "cd app && npx drizzle-kit push"
```

## Troubleshooting

### Issue: Caddy can't obtain SSL certificate

**Symptoms:**
- Browser shows "Not Secure" or SSL error
- Caddy logs show "acme: error: 403"

**Solution:**
```bash
# Check DNS is pointing to VPS
dig costwave.app

# Check port 80 is accessible (required for Let's Encrypt)
curl http://costwave.app

# Restart Caddy
docker compose -f docker-compose.prod.yml restart caddy

# Check Caddy logs
docker compose -f docker-compose.prod.yml logs caddy
```

### Issue: Database connection failed

**Symptoms:**
- Costwave logs: "database connection failed"
- Health endpoint returns error

**Solution:**
```bash
# Check Postgres is running
docker compose -f docker-compose.prod.yml ps postgres

# Check Postgres logs
docker compose -f docker-compose.prod.yml logs postgres

# Verify DATABASE_URL in .env.production matches POSTGRES_PASSWORD
cat .env.production | grep -E "DATABASE_URL|POSTGRES_PASSWORD"

# Test connection manually
docker compose -f docker-compose.prod.yml exec postgres psql -U costwave -d costwave -c "SELECT 1;"
```

### Issue: App won't start

**Symptoms:**
- Costwave container keeps restarting
- Healthcheck failing

**Solution:**
```bash
# Check build errors
docker compose -f docker-compose.prod.yml logs costwave

# Verify .env.production has required vars
docker compose -f docker-compose.prod.yml exec costwave printenv | grep -E "NODE_ENV|DATABASE_URL|BETTER_AUTH_SECRET"

# Rebuild from scratch
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache costwave
docker compose -f docker-compose.prod.yml up -d
```

### Issue: Emails not sending

**Symptoms:**
- No welcome email after signup
- No budget alerts

**Solution:**
```bash
# Verify RESEND_API_KEY is set
docker compose -f docker-compose.prod.yml exec costwave printenv RESEND_API_KEY

# Check Costwave logs for email errors
docker compose -f docker-compose.prod.yml logs costwave | grep -i "email\|resend"

# Test Resend API key manually
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"Costwave <noreply@costwave.app>","to":"test@example.com","subject":"Test","text":"Test"}'
```

### Issue: Out of disk space

**Symptoms:**
- Docker build fails
- Database writes fail

**Solution:**
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a

# Check volume sizes
docker system df -v
```

## Monitoring

### Resource Usage

```bash
# Overall stats
docker stats

# Specific container
docker stats costwave
```

### Database Size

```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U costwave -d costwave -c "
  SELECT
    pg_size_pretty(pg_database_size('costwave')) as db_size;
"
```

### Log Rotation

Docker logs are managed by Docker daemon. Configure in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker daemon:

```bash
sudo systemctl restart docker
docker compose -f docker-compose.prod.yml up -d
```

## Backups

### Database Backup

```bash
# Create backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U costwave costwave > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore backup
docker compose -f docker-compose.prod.yml exec -T postgres psql -U costwave -d costwave < backup-YYYYMMDD-HHMMSS.sql
```

### Full Volume Backup

```bash
# Stop services
docker compose -f docker-compose.prod.yml down

# Backup volumes
sudo tar -czf costwave-volumes-$(date +%Y%m%d).tar.gz \
  /var/lib/docker/volumes/costwave_postgres_data \
  /var/lib/docker/volumes/costwave_redis_data \
  /var/lib/docker/volumes/costwave_caddy_data

# Restart services
docker compose -f docker-compose.prod.yml up -d
```

## Security Notes

### Secrets Management
- Never commit .env.production to Git
- Rotate POSTGRES_PASSWORD and REDIS_AUTH quarterly
- Keep BETTER_AUTH_SECRET and ENCRYPTION_PEPPER stable (changing breaks user sessions and encrypted data)

### Firewall
- Only ports 80/443 exposed publicly
- SSH access via Tailscale only
- Database and Redis not exposed outside Docker network

### Updates
- Update Docker images monthly
- Monitor security advisories for Node.js, Postgres, Redis, Caddy
- Test updates in staging before production

## V2 Features (Not in This Deployment)

The following are disabled in V1 production:
- Stripe payment processing (billing page shows disabled state)
- Langfuse LLM tracking (health endpoint shows "disabled")
- ClickHouse analytics
- MinIO object storage

To enable in V2:
1. Configure Stripe live keys in .env.production
2. Deploy Langfuse stack (separate docker-compose file)
3. Update .env.production with Langfuse credentials
4. Redeploy

## Support

For issues:
1. Check troubleshooting section above
2. Review logs: `docker compose -f docker-compose.prod.yml logs`
3. Verify health endpoint: `curl https://costwave.app/api/health`
4. Check GitHub issues: https://github.com/YOUR_USERNAME/costwave/issues
