-- Drop plans table
DROP INDEX IF EXISTS idx_plans_meter_id;
DROP INDEX IF EXISTS idx_plans_interval_id;
DROP INDEX IF EXISTS idx_plans_is_visible;
DROP INDEX IF EXISTS idx_plans_is_active;
DROP INDEX IF EXISTS idx_plans_product_id;
DROP INDEX IF EXISTS idx_plans_slug;
DROP TABLE IF EXISTS plans;
