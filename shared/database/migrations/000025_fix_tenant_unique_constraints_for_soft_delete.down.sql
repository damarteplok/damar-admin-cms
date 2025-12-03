-- Drop partial unique indexes
DROP INDEX IF EXISTS tenants_uuid_unique_active;
DROP INDEX IF EXISTS tenants_domain_unique_active;
DROP INDEX IF EXISTS tenants_slug_unique_active;

-- Recreate original unique constraints on slug, domain, and uuid
ALTER TABLE tenants ADD CONSTRAINT tenants_uuid_unique UNIQUE (uuid);
ALTER TABLE tenants ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);
ALTER TABLE tenants ADD CONSTRAINT tenants_domain_unique UNIQUE (domain);
