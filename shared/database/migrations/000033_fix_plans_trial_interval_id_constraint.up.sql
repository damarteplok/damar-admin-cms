-- Fix trial_interval_id constraint to properly handle NULL values
-- Drop the existing foreign key constraint
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_trial_interval_id_foreign;

-- Re-add the constraint with explicit NULL handling
ALTER TABLE plans ADD CONSTRAINT plans_trial_interval_id_foreign 
    FOREIGN KEY (trial_interval_id) 
    REFERENCES intervals(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;
