-- Create users table migration
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP(0),
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100),
    public_name VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP(0),
    updated_at TIMESTAMP(0),
    notes TEXT,
    phone_number VARCHAR(255),
    phone_number_verified_at TIMESTAMP(0),
    last_seen_at TIMESTAMP(0),
    position VARCHAR(255)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);
