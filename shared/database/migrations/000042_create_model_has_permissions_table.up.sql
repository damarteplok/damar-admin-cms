-- Create model_has_permissions pivot table (user/model <-> permission direct relationship)
-- Allows assigning permissions directly to users without going through roles
CREATE TABLE IF NOT EXISTS model_has_permissions (
    permission_id BIGINT NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT NOT NULL,
    CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type),
    CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Index for faster lookups by model_id and model_type
CREATE INDEX IF NOT EXISTS model_has_permissions_model_id_model_type_index ON model_has_permissions USING btree (model_id, model_type);
