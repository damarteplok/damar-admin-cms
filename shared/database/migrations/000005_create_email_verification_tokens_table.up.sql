-- Create email_verification_tokens table for storing email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP(0) NOT NULL,
    created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id, email and token for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_email ON email_verification_tokens(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
