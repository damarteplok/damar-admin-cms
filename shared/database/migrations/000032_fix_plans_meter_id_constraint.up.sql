-- Drop the existing foreign key constraint
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_meter_id_foreign;

-- Re-add the constraint with ON DELETE SET NULL to allow null values
ALTER TABLE plans ADD CONSTRAINT plans_meter_id_foreign 
    FOREIGN KEY (meter_id) 
    REFERENCES plan_meters(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;
