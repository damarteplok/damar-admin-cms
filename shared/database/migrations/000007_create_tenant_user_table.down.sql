-- Drop tenant_user table
DROP INDEX IF EXISTS idx_tenant_user_role;
DROP INDEX IF EXISTS idx_tenant_user_is_default;
DROP INDEX IF EXISTS idx_tenant_user_tenant_id;
DROP INDEX IF EXISTS idx_tenant_user_user_id;

DROP TABLE IF EXISTS tenant_user;
