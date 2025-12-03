-- Create subscription_discounts table
CREATE TABLE IF NOT EXISTS subscription_discounts (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    discount_id BIGINT NOT NULL,
    type VARCHAR(255) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    valid_until TIMESTAMP(0) NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT subscription_discounts_subscription_id_foreign FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT subscription_discounts_discount_id_foreign FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_subscription_discounts_subscription_id ON subscription_discounts(subscription_id);
CREATE INDEX idx_subscription_discounts_discount_id ON subscription_discounts(discount_id);
