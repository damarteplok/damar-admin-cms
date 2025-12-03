-- Create subscription_versions table (audit trail)
CREATE TABLE IF NOT EXISTS subscription_versions (
    version_id SERIAL PRIMARY KEY,
    versionable_id VARCHAR(255) NOT NULL,
    versionable_type VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    model_data TEXT NOT NULL,
    reason VARCHAR(100),
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

CREATE INDEX idx_subscription_versions_versionable_id ON subscription_versions(versionable_id);
