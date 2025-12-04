-- Create discount_plan junction table
CREATE TABLE IF NOT EXISTS discount_plan (
    id BIGSERIAL PRIMARY KEY,
    discount_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL,
    CONSTRAINT discount_plan_discount_id_foreign 
        FOREIGN KEY (discount_id) 
        REFERENCES discounts(id) 
        ON DELETE CASCADE,
    CONSTRAINT discount_plan_plan_id_foreign 
        FOREIGN KEY (plan_id) 
        REFERENCES plans(id) 
        ON DELETE CASCADE,
    CONSTRAINT discount_plan_unique UNIQUE (discount_id, plan_id)
);

CREATE INDEX idx_discount_plan_discount_id ON discount_plan(discount_id);
CREATE INDEX idx_discount_plan_plan_id ON discount_plan(plan_id);
