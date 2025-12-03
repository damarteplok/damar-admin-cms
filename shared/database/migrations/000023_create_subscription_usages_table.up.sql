-- Create subscription_usages table
CREATE TABLE IF NOT EXISTS subscription_usages (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    unit_count INTEGER NOT NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT subscription_usages_subscription_id_foreign FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE INDEX idx_subscription_usages_subscription_id ON subscription_usages(subscription_id);
