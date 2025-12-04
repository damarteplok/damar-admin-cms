-- Create discount_one_time_product junction table
CREATE TABLE IF NOT EXISTS discount_one_time_product (
    id BIGSERIAL PRIMARY KEY,
    discount_id BIGINT NOT NULL,
    one_time_product_id BIGINT NOT NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT discount_one_time_product_discount_id_foreign 
        FOREIGN KEY (discount_id) 
        REFERENCES discounts(id) 
        ON DELETE CASCADE,
    CONSTRAINT discount_one_time_product_unique UNIQUE (discount_id, one_time_product_id)
);

CREATE INDEX idx_discount_one_time_product_discount_id ON discount_one_time_product(discount_id);
CREATE INDEX idx_discount_one_time_product_one_time_product_id ON discount_one_time_product(one_time_product_id);
