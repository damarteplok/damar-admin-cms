-- Create plan_prices table
CREATE TABLE IF NOT EXISTS plan_prices (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    currency_id BIGINT NOT NULL,
    price INTEGER NOT NULL,
    price_per_unit INTEGER,
    type VARCHAR(255) NOT NULL DEFAULT 'flat_rate',
    tiers JSON,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT plan_prices_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT plan_prices_currency_id_foreign FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_plan_prices_plan_id ON plan_prices(plan_id);
CREATE INDEX idx_plan_prices_currency_id ON plan_prices(currency_id);
