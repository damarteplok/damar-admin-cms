-- Revert back to original constraint
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_meter_id_foreign;

-- Re-add the original constraint (without ON DELETE SET NULL)
ALTER TABLE plans ADD CONSTRAINT plans_meter_id_foreign 
    FOREIGN KEY (meter_id) 
    REFERENCES plan_meters(id);
