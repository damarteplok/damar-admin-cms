-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    price INTEGER NOT NULL,
    currency_id BIGINT NOT NULL,
    ends_at TIMESTAMP(0) NULL,
    cancelled_at TIMESTAMP(0) NULL,
    payment_provider_subscription_id VARCHAR(255),
    payment_provider_status VARCHAR(255),
    payment_provider_id BIGINT,
    trial_ends_at TIMESTAMP(0) NULL,
    status VARCHAR(255) NOT NULL,
    interval_id BIGINT NOT NULL,
    interval_count INTEGER NOT NULL,
    is_canceled_at_end_of_cycle BOOLEAN NOT NULL DEFAULT FALSE,
    cancellation_reason VARCHAR(255),
    cancellation_additional_info TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    tenant_id BIGINT NOT NULL,
    price_type VARCHAR(255) NOT NULL DEFAULT 'flat_rate',
    price_tiers JSON,
    price_per_unit VARCHAR(255),
    extra_payment_provider_data JSON,
    type VARCHAR(255) NOT NULL DEFAULT 'payment_provider_managed',
    comments TEXT,
    metadata JSON,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT subscriptions_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT subscriptions_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES plans(id),
    CONSTRAINT subscriptions_currency_id_foreign FOREIGN KEY (currency_id) REFERENCES currencies(id),
    CONSTRAINT subscriptions_payment_provider_id_foreign FOREIGN KEY (payment_provider_id) REFERENCES payment_providers(id),
    CONSTRAINT subscriptions_interval_id_foreign FOREIGN KEY (interval_id) REFERENCES intervals(id),
    CONSTRAINT subscriptions_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_subscriptions_uuid ON subscriptions(uuid);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_payment_provider_id ON subscriptions(payment_provider_id);
CREATE INDEX idx_subscriptions_ends_at ON subscriptions(ends_at);
