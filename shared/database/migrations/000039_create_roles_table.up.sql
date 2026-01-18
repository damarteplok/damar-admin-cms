-- Create roles table for RBAC (Laravel Spatie Permission style)
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
    created_at TIMESTAMP(0),
    updated_at TIMESTAMP(0),
    CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name)
);

-- Index for faster lookups by name
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
