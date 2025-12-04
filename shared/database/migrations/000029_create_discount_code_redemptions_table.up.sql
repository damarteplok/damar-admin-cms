-- Create discount_code_redemptions table
CREATE TABLE IF NOT EXISTS discount_code_redemptions (
    id BIGSERIAL PRIMARY KEY,
    discount_code_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    subscription_id BIGINT NULL,
    order_id BIGINT NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT discount_code_redemptions_discount_code_id_foreign 
        FOREIGN KEY (discount_code_id) 
        REFERENCES discount_codes(id) 
        ON DELETE CASCADE,
    CONSTRAINT discount_code_redemptions_user_id_foreign 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT discount_code_redemptions_subscription_id_foreign 
        FOREIGN KEY (subscription_id) 
        REFERENCES subscriptions(id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_discount_code_redemptions_discount_code_id ON discount_code_redemptions(discount_code_id);
CREATE INDEX idx_discount_code_redemptions_user_id ON discount_code_redemptions(user_id);
CREATE INDEX idx_discount_code_redemptions_subscription_id ON discount_code_redemptions(subscription_id);
CREATE INDEX idx_discount_code_redemptions_order_id ON discount_code_redemptions(order_id);
