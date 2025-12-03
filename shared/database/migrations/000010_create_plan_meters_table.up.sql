-- Create plan_meters table
CREATE TABLE IF NOT EXISTS plan_meters (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);
