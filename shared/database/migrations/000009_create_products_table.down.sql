-- Drop products table
DROP INDEX IF EXISTS idx_products_is_default;
DROP INDEX IF EXISTS idx_products_is_popular;
DROP INDEX IF EXISTS idx_products_slug;
DROP TABLE IF EXISTS products;
