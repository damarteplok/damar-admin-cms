-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id BIGSERIAL PRIMARY KEY,
    uuid TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_name_auto_generated BOOLEAN DEFAULT FALSE NOT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    domain VARCHAR(255) NULL,
    deleted_at TIMESTAMP(0) NULL,
    slug VARCHAR(255) NOT NULL,
    
    -- Constraints
    CONSTRAINT tenants_uuid_unique UNIQUE (uuid),
    CONSTRAINT tenants_slug_unique UNIQUE (slug),
    CONSTRAINT tenants_domain_unique UNIQUE (domain),
    CONSTRAINT tenants_created_by_foreign FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_uuid ON tenants(uuid);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_created_by ON tenants(created_by);
CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON tenants(deleted_at);

-- Add comment
COMMENT ON TABLE tenants IS 'Multi-tenant organizations table';
COMMENT ON COLUMN tenants.uuid IS 'Public-facing unique identifier for tenant';
COMMENT ON COLUMN tenants.slug IS 'URL-friendly tenant identifier';
COMMENT ON COLUMN tenants.is_name_auto_generated IS 'Flag if tenant name was auto-generated';
COMMENT ON COLUMN tenants.deleted_at IS 'Soft delete timestamp (NULL = active)';
