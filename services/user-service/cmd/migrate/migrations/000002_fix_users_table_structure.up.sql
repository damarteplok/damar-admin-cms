-- Fix users table structure to match GraphQL schema and Proto definitions

-- 1. Rename password to password_hash (more accurate naming)
ALTER TABLE users RENAME COLUMN password TO password_hash;

-- 2. Rename last_seen_at to last_login_at (match GraphQL/Proto naming)
ALTER TABLE users RENAME COLUMN last_seen_at TO last_login_at;

-- 3. Add email_verified column (boolean flag)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE NOT NULL;

-- 4. Update email_verified based on email_verified_at
UPDATE users SET email_verified = TRUE WHERE email_verified_at IS NOT NULL;

-- 5. Drop columns that are not in GraphQL/Proto schema
ALTER TABLE users DROP COLUMN IF EXISTS remember_token;
ALTER TABLE users DROP COLUMN IF EXISTS notes;
ALTER TABLE users DROP COLUMN IF EXISTS phone_number_verified_at;

-- 6. Create index on email_verified for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
