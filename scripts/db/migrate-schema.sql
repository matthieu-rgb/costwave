-- WARNING: Run inspect-db.sql FIRST to verify tables exist in wrong schema
-- This script moves Costwave tables from 'public' schema to 'costwave' schema
-- DO NOT run this blindly - inspect results first and uncomment only if needed

-- Step 1: Create costwave schema (safe, won't fail if exists)
-- CREATE SCHEMA IF NOT EXISTS costwave;

-- Step 2: Move tables (ONLY uncomment if inspection confirmed they're in 'public')
-- WARNING: This will break any connections pointing to public.table_name
-- Make sure to update DATABASE_URL to include search_path=costwave after migration

-- Auth tables
-- ALTER TABLE IF EXISTS public.user SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.account SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.session SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.verification SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.passkey SET SCHEMA costwave;

-- Business tables
-- ALTER TABLE IF EXISTS public.subscription SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.provider_credential SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.provider_usage_snapshot SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.workflow SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.event SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.budget SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.budget_alert_sent SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.push_subscription SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.api_key SET SCHEMA costwave;
-- ALTER TABLE IF EXISTS public.audit_log SET SCHEMA costwave;

-- Step 3: Verify migration (run after uncommenting above)
-- SELECT table_schema, table_name
-- FROM information_schema.tables
-- WHERE table_name IN (
--   'user', 'account', 'session', 'verification', 'passkey',
--   'subscription', 'provider_credential', 'provider_usage_snapshot',
--   'workflow', 'event', 'budget', 'budget_alert_sent',
--   'push_subscription', 'api_key', 'audit_log'
-- )
-- ORDER BY table_schema, table_name;

-- Step 4: Update DATABASE_URL environment variable
-- DATABASE_URL should include: ?schema=costwave
-- Or set search_path in connection: SET search_path TO costwave, public;
