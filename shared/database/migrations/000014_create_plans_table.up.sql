-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    interval_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    has_trial BOOLEAN NOT NULL DEFAULT FALSE,
    trial_interval_id BIGINT,
    interval_count INTEGER NOT NULL,
    trial_interval_count INTEGER,
    description TEXT,
    type VARCHAR(255) NOT NULL DEFAULT 'flat_rate',
    max_users_per_tenant INTEGER NOT NULL DEFAULT 0,
    meter_id BIGINT,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT plans_product_id_foreign FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT plans_interval_id_foreign FOREIGN KEY (interval_id) REFERENCES intervals(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT plans_trial_interval_id_foreign FOREIGN KEY (trial_interval_id) REFERENCES intervals(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT plans_meter_id_foreign FOREIGN KEY (meter_id) REFERENCES plan_meters(id)
);

CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_product_id ON plans(product_id);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_plans_is_visible ON plans(is_visible);
CREATE INDEX idx_plans_interval_id ON plans(interval_id);
CREATE INDEX idx_plans_meter_id ON plans(meter_id);
