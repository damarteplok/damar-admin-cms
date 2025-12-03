-- Create tenant_settings table for tenant-specific configuration
CREATE TABLE IF NOT EXISTS tenant_settings (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    key VARCHAR(255) NOT NULL,
    value JSON NOT NULL,
    created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT tenant_settings_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Each tenant can only have one value per setting key
    CONSTRAINT tenant_settings_tenant_key_unique UNIQUE (tenant_id, key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant_id ON tenant_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_key ON tenant_settings(key);

-- Add comments
COMMENT ON TABLE tenant_settings IS 'Key-value settings storage per tenant';
COMMENT ON COLUMN tenant_settings.key IS 'Setting key (e.g., theme, features, limits)';
COMMENT ON COLUMN tenant_settings.value IS 'JSON value for flexible data structure';
