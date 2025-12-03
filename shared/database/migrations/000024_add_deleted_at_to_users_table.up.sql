-- Add deleted_at column for soft delete
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP(0) NULL;

-- Create index on deleted_at for query performance
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Drop existing unique constraint on email
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Create partial unique index: email is unique only for non-deleted users
-- This allows deleted users to have the same email as active users
-- and allows re-registration with previously used emails
CREATE UNIQUE INDEX users_email_unique_active ON users(email) WHERE deleted_at IS NULL;
