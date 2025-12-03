-- Drop tenant_settings table
DROP INDEX IF EXISTS idx_tenant_settings_key;
DROP INDEX IF EXISTS idx_tenant_settings_tenant_id;

DROP TABLE IF EXISTS tenant_settings;
