-- Drop existing unique constraints on slug, domain, and uuid
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_slug_unique;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_domain_unique;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_uuid_unique;

-- Create partial unique indexes: unique only for non-deleted tenants
-- This allows deleted tenants to have the same slug/domain/uuid as active tenants
-- and allows re-creation of tenants with previously used values

-- Slug is unique only for active tenants (deleted_at IS NULL)
CREATE UNIQUE INDEX tenants_slug_unique_active ON tenants(slug) WHERE deleted_at IS NULL;

-- Domain is unique only for active tenants (deleted_at IS NULL)
CREATE UNIQUE INDEX tenants_domain_unique_active ON tenants(domain) WHERE deleted_at IS NULL;

-- UUID is unique only for active tenants (deleted_at IS NULL)
CREATE UNIQUE INDEX tenants_uuid_unique_active ON tenants(uuid) WHERE deleted_at IS NULL;
