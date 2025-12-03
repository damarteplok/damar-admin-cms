-- Create plan_payment_provider_data table
CREATE TABLE IF NOT EXISTS plan_payment_provider_data (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    payment_provider_id BIGINT NOT NULL,
    payment_provider_product_id VARCHAR(255),
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT plan_payment_provider_data_unq UNIQUE (plan_id, payment_provider_id),
    CONSTRAINT plan_payment_provider_data_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES plans(id),
    CONSTRAINT plan_payment_provider_data_payment_provider_id_foreign FOREIGN KEY (payment_provider_id) REFERENCES payment_providers(id)
);

CREATE INDEX idx_plan_payment_provider_data_plan_id ON plan_payment_provider_data(plan_id);
CREATE INDEX idx_plan_payment_provider_data_payment_provider_id ON plan_payment_provider_data(payment_provider_id);
