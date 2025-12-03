-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    metadata JSON,
    features JSON,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_popular ON products(is_popular);
CREATE INDEX idx_products_is_default ON products(is_default);
