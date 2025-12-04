-- Create discounts table (simple version)
CREATE TABLE IF NOT EXISTS discounts (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from TIMESTAMP(0) NULL,
    valid_until TIMESTAMP(0) NULL,
    max_uses INTEGER,
    times_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_is_active ON discounts(is_active);
