-- Create payment_providers table
CREATE TABLE IF NOT EXISTS payment_providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

-- Insert common payment providers
INSERT INTO payment_providers (id, name, slug, is_active, created_at, updated_at) VALUES
(1, 'Stripe', 'stripe', TRUE, NOW(), NOW()),
(2, 'Paddle', 'paddle', TRUE, NOW(), NOW()),
(3, 'PayPal', 'paypal', TRUE, NOW(), NOW()),
(4, 'Manual', 'manual', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
