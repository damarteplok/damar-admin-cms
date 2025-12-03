-- Drop subscriptions table
DROP INDEX IF EXISTS idx_subscriptions_ends_at;
DROP INDEX IF EXISTS idx_subscriptions_payment_provider_id;
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_subscriptions_tenant_id;
DROP INDEX IF EXISTS idx_subscriptions_plan_id;
DROP INDEX IF EXISTS idx_subscriptions_user_id;
DROP INDEX IF EXISTS idx_subscriptions_uuid;
DROP TABLE IF EXISTS subscriptions;
