-- Revert back to original constraint
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_trial_interval_id_foreign;

-- Re-add the original constraint
ALTER TABLE plans ADD CONSTRAINT plans_trial_interval_id_foreign 
    FOREIGN KEY (trial_interval_id) 
    REFERENCES intervals(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;
