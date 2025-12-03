-- Create tenant_user pivot table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS tenant_user (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL,
    tenant_id BIGINT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    email TEXT NULL,
    role TEXT NULL,
    created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT tenant_user_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT tenant_user_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Ensure a user can only have one role per tenant
    CONSTRAINT tenant_user_user_tenant_unique UNIQUE (user_id, tenant_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_user_user_id ON tenant_user(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_user_tenant_id ON tenant_user(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_user_is_default ON tenant_user(is_default);
CREATE INDEX IF NOT EXISTS idx_tenant_user_role ON tenant_user(role);

-- Add comments
COMMENT ON TABLE tenant_user IS 'Pivot table linking users to tenants with roles';
COMMENT ON COLUMN tenant_user.is_default IS 'Flag if this is the user''s default tenant';
COMMENT ON COLUMN tenant_user.email IS 'Invitation email if user not yet registered';
COMMENT ON COLUMN tenant_user.role IS 'User role within this tenant (owner, admin, member, guest)';
