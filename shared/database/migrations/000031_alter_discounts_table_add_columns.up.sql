-- Add new columns to discounts table to support advanced discount features
-- Drop the old code column since codes will be in separate table
ALTER TABLE discounts DROP COLUMN IF EXISTS code;
ALTER TABLE discounts DROP COLUMN IF EXISTS valid_from;
ALTER TABLE discounts DROP COLUMN IF EXISTS max_uses;
ALTER TABLE discounts DROP COLUMN IF EXISTS times_used;

-- Add new columns
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS description VARCHAR(255) NULL;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS action_type VARCHAR(255) NULL;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS max_redemptions INTEGER NULL;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS max_redemptions_per_user INTEGER NULL;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS redemptions INTEGER NOT NULL DEFAULT 0;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS duration_in_months INTEGER NULL;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS maximum_recurring_intervals INTEGER NULL;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS redeem_type SMALLINT NOT NULL DEFAULT 1;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS bonus_days INTEGER NULL;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS is_enabled_for_all_plans BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS is_enabled_for_all_one_time_products BOOLEAN NOT NULL DEFAULT FALSE;

-- Drop the old index on code (since column is dropped)
DROP INDEX IF EXISTS idx_discounts_code;
