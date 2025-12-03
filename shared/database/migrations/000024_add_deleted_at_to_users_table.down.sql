-- Drop partial unique index
DROP INDEX IF EXISTS users_email_unique_active;

-- Recreate original unique constraint on email
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Drop index on deleted_at
DROP INDEX IF EXISTS idx_users_deleted_at;

-- Remove deleted_at column
ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;
