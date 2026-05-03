#!/bin/bash

# Costwave Production Deployment Guide
# This script documents the manual deployment steps
# DO NOT execute this script automatically - follow steps manually

set -e

echo "============================================"
echo "Costwave Production Deployment Guide"
echo "VPS: Hetzner CX33 (46.62.138.33)"
echo "Domain: costwave.app"
echo "============================================"
echo ""

echo "STEP 1: SSH to VPS via Tailscale"
echo "  ssh matthieu@100.x.x.x"
echo ""

echo "STEP 2: Clone or update repository"
echo "  # First time:"
echo "  git clone https://github.com/YOUR_USERNAME/costwave.git"
echo "  cd costwave"
echo ""
echo "  # Or update existing:"
echo "  cd costwave"
echo "  git pull origin main"
echo ""

echo "STEP 3: Copy production environment file from Mac"
echo "  # On Mac, run:"
echo "  scp .env.production matthieu@100.x.x.x:~/costwave/.env.production"
echo ""

echo "STEP 4: Generate random passwords (on VPS)"
echo "  # Generate POSTGRES_PASSWORD:"
echo "  openssl rand -base64 32"
echo ""
echo "  # Generate REDIS_AUTH:"
echo "  openssl rand -base64 32"
echo ""
echo "  # Edit .env.production and replace CHANGE_ME values"
echo "  nano .env.production"
echo ""

echo "STEP 5: Verify DNS is pointing to VPS"
echo "  dig costwave.app"
echo "  # Should resolve to 46.62.138.33"
echo ""

echo "STEP 6: Start services with Docker Compose"
echo "  docker compose -f docker-compose.prod.yml up -d --build"
echo ""

echo "STEP 7: Check logs for errors"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""

echo "STEP 8: Run database migrations"
echo "  # Enter the Costwave container:"
echo "  docker compose -f docker-compose.prod.yml exec costwave sh"
echo ""
echo "  # Inside container, run migrations:"
echo "  npx drizzle-kit push"
echo ""
echo "  # Exit container:"
echo "  exit"
echo ""

echo "STEP 9: Verify health endpoint"
echo "  curl https://costwave.app/api/health"
echo "  # Should return: {\"status\":\"ok\",\"db\":\"connected\",\"langfuse\":\"disabled\"}"
echo ""

echo "STEP 10: Test in browser"
echo "  # Open: https://costwave.app"
echo "  # Try signup, login, PWA install"
echo ""

echo "============================================"
echo "Deployment complete!"
echo "============================================"
echo ""
echo "TROUBLESHOOTING:"
echo "  - Check logs: docker compose -f docker-compose.prod.yml logs [service]"
echo "  - Check health: curl https://costwave.app/api/health"
echo "  - Restart service: docker compose -f docker-compose.prod.yml restart [service]"
echo "  - Full restart: docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d"
echo ""
