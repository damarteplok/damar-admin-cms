-- Create model_has_roles pivot table (user/model <-> role relationship)
-- model_type allows polymorphic relationship (e.g., 'users', 'admins')
CREATE TABLE IF NOT EXISTS model_has_roles (
    role_id BIGINT NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT NOT NULL,
    CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type),
    CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Index for faster lookups by model_id and model_type
CREATE INDEX IF NOT EXISTS model_has_roles_model_id_model_type_index ON model_has_roles USING btree (model_id, model_type);
