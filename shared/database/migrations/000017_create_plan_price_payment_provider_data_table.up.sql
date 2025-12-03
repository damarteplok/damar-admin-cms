-- Create plan_price_payment_provider_data table
CREATE TABLE IF NOT EXISTS plan_price_payment_provider_data (
    id BIGSERIAL PRIMARY KEY,
    plan_price_id BIGINT NOT NULL,
    payment_provider_id BIGINT NOT NULL,
    payment_provider_price_id VARCHAR(255),
    type VARCHAR(255) NOT NULL DEFAULT 'main_price',
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT plan_price_payment_provider_type_data_unq UNIQUE (plan_price_id, payment_provider_id, type),
    CONSTRAINT plan_price_payment_provider_data_plan_price_id_foreign FOREIGN KEY (plan_price_id) REFERENCES plan_prices(id),
    CONSTRAINT plan_price_payment_provider_data_payment_provider_id_foreign FOREIGN KEY (payment_provider_id) REFERENCES payment_providers(id)
);

CREATE INDEX idx_plan_price_payment_provider_data_plan_price_id ON plan_price_payment_provider_data(plan_price_id);
CREATE INDEX idx_plan_price_payment_provider_data_payment_provider_id ON plan_price_payment_provider_data(payment_provider_id);
