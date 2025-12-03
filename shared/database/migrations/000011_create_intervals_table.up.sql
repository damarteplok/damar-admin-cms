-- Create intervals table (for billing cycles: monthly, yearly, etc.)
CREATE TABLE IF NOT EXISTS intervals (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

-- Insert common intervals
INSERT INTO intervals (id, name, slug, created_at, updated_at) VALUES
(1, 'Monthly', 'monthly', NOW(), NOW()),
(2, 'Yearly', 'yearly', NOW(), NOW()),
(3, 'Weekly', 'weekly', NOW(), NOW()),
(4, 'Daily', 'daily', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
