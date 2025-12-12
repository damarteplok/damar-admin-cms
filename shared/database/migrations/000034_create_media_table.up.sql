CREATE TABLE IF NOT EXISTS media (
    id BIGSERIAL PRIMARY KEY,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT NOT NULL,
    uuid UUID NULL,
    collection_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(255) NULL,
    disk VARCHAR(255) NOT NULL,
    conversions_disk VARCHAR(255) NULL,
    size BIGINT NOT NULL,
    manipulations JSON NOT NULL DEFAULT '{}',
    custom_properties JSON NOT NULL DEFAULT '{}',
    generated_conversions JSON NOT NULL DEFAULT '{}',
    responsive_images JSON NOT NULL DEFAULT '{}',
    order_column INTEGER NULL,
    created_at TIMESTAMP(0) NULL DEFAULT NOW(),
    updated_at TIMESTAMP(0) NULL DEFAULT NOW(),
    CONSTRAINT media_uuid_unique UNIQUE (uuid)
);

CREATE INDEX IF NOT EXISTS media_model_type_model_id_index ON media USING btree (model_type, model_id);
CREATE INDEX IF NOT EXISTS media_order_column_index ON media USING btree (order_column);
