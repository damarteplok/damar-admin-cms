-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    discount_id BIGINT NOT NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT discount_codes_discount_id_foreign 
        FOREIGN KEY (discount_id) 
        REFERENCES discounts(id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_discount_id ON discount_codes(discount_id);
