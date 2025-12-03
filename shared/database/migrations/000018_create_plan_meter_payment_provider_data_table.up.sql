-- Create plan_meter_payment_provider_data table
CREATE TABLE IF NOT EXISTS plan_meter_payment_provider_data (
    id BIGSERIAL PRIMARY KEY,
    plan_meter_id BIGINT NOT NULL,
    payment_provider_id BIGINT NOT NULL,
    payment_provider_plan_meter_id VARCHAR(255),
    data JSON,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT plan_meter_payment_provider_data_plan_meter_id_foreign FOREIGN KEY (plan_meter_id) REFERENCES plan_meters(id),
    CONSTRAINT plan_meter_payment_provider_data_payment_provider_id_foreign FOREIGN KEY (payment_provider_id) REFERENCES payment_providers(id)
);

CREATE INDEX idx_plan_meter_payment_provider_data_plan_meter_id ON plan_meter_payment_provider_data(plan_meter_id);
CREATE INDEX idx_plan_meter_payment_provider_data_payment_provider_id ON plan_meter_payment_provider_data(payment_provider_id);
