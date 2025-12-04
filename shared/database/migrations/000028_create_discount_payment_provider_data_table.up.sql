-- Create discount_payment_provider_data table
CREATE TABLE IF NOT EXISTS discount_payment_provider_data (
    id BIGSERIAL PRIMARY KEY,
    discount_id BIGINT NOT NULL,
    payment_provider_id BIGINT NOT NULL,
    payment_provider_discount_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT discount_payment_provider_data_discount_id_foreign 
        FOREIGN KEY (discount_id) 
        REFERENCES discounts(id) 
        ON DELETE CASCADE,
    CONSTRAINT discount_payment_provider_data_payment_provider_id_foreign 
        FOREIGN KEY (payment_provider_id) 
        REFERENCES payment_providers(id) 
        ON DELETE CASCADE,
    CONSTRAINT discount_payment_provider_unique UNIQUE (discount_id, payment_provider_id)
);

CREATE INDEX idx_discount_payment_provider_discount_id ON discount_payment_provider_data(discount_id);
CREATE INDEX idx_discount_payment_provider_payment_provider_id ON discount_payment_provider_data(payment_provider_id);
