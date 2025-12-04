-- Revert discounts table changes
ALTER TABLE discounts DROP COLUMN IF EXISTS is_enabled_for_all_one_time_products;
ALTER TABLE discounts DROP COLUMN IF EXISTS is_enabled_for_all_plans;
ALTER TABLE discounts DROP COLUMN IF EXISTS bonus_days;
ALTER TABLE discounts DROP COLUMN IF EXISTS redeem_type;
ALTER TABLE discounts DROP COLUMN IF EXISTS maximum_recurring_intervals;
ALTER TABLE discounts DROP COLUMN IF EXISTS duration_in_months;
ALTER TABLE discounts DROP COLUMN IF EXISTS is_recurring;
ALTER TABLE discounts DROP COLUMN IF EXISTS redemptions;
ALTER TABLE discounts DROP COLUMN IF EXISTS max_redemptions_per_user;
ALTER TABLE discounts DROP COLUMN IF EXISTS max_redemptions;
ALTER TABLE discounts DROP COLUMN IF EXISTS action_type;
ALTER TABLE discounts DROP COLUMN IF EXISTS description;

-- Restore old columns
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS code VARCHAR(255) NOT NULL UNIQUE;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS valid_from TIMESTAMP(0) NULL;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS max_uses INTEGER;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS times_used INTEGER NOT NULL DEFAULT 0;

-- Restore old index
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
