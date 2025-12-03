-- Drop subscription_discounts table
DROP INDEX IF EXISTS idx_subscription_discounts_discount_id;
DROP INDEX IF EXISTS idx_subscription_discounts_subscription_id;
DROP TABLE IF EXISTS subscription_discounts;
