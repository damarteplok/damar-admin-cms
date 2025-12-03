-- Rollback fix_users_table_structure migration

-- 1. Drop email_verified index
DROP INDEX IF EXISTS idx_users_email_verified;

-- 2. Re-add dropped columns
ALTER TABLE users ADD COLUMN remember_token VARCHAR(100);
ALTER TABLE users ADD COLUMN notes TEXT;
ALTER TABLE users ADD COLUMN phone_number_verified_at TIMESTAMP(0);

-- 3. Drop email_verified column
ALTER TABLE users DROP COLUMN IF EXISTS email_verified;

-- 4. Rename last_login_at back to last_seen_at
ALTER TABLE users RENAME COLUMN last_login_at TO last_seen_at;

-- 5. Rename password_hash back to password
ALTER TABLE users RENAME COLUMN password_hash TO password;
