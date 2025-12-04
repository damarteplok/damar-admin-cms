-- Drop discount_code_redemptions table
DROP INDEX IF EXISTS idx_discount_code_redemptions_order_id;
DROP INDEX IF EXISTS idx_discount_code_redemptions_subscription_id;
DROP INDEX IF EXISTS idx_discount_code_redemptions_user_id;
DROP INDEX IF EXISTS idx_discount_code_redemptions_discount_code_id;
DROP TABLE IF EXISTS discount_code_redemptions;
