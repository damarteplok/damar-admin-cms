-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

-- Insert common currencies
INSERT INTO currencies (id, code, name, symbol, created_at, updated_at) VALUES
(1, 'USD', 'US Dollar', '$', NOW(), NOW()),
(2, 'EUR', 'Euro', '€', NOW(), NOW()),
(3, 'GBP', 'British Pound', '£', NOW(), NOW()),
(4, 'IDR', 'Indonesian Rupiah', 'Rp', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
