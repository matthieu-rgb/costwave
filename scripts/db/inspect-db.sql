-- Costwave DB Inspection Script
-- Run this to check where Costwave tables are located
-- Safe to run - this only reads, doesn't modify anything

-- Check if costwave schema exists
SELECT schema_name FROM information_schema.schemata
WHERE schema_name = 'costwave';

-- List all Costwave-related tables and their schemas
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name IN (
  'user', 'account', 'session', 'verification', 'passkey',
  'subscription', 'provider_credential', 'provider_usage_snapshot',
  'workflow', 'event', 'budget', 'budget_alert_sent',
  'push_subscription', 'api_key', 'audit_log'
)
ORDER BY table_schema, table_name;

-- Count rows per table to see which ones have data
SELECT
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE tablename IN (
  'user', 'account', 'session', 'verification', 'passkey',
  'subscription', 'provider_credential', 'provider_usage_snapshot',
  'workflow', 'event', 'budget', 'budget_alert_sent',
  'push_subscription', 'api_key', 'audit_log'
)
ORDER BY schemaname, tablename;
