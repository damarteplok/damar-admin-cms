CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    starts_at TIMESTAMP(0) NULL,
    ends_at TIMESTAMP(0) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_dismissible BOOLEAN NOT NULL DEFAULT TRUE,
    show_for_customers BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_frontend BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_user_dashboard BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

-- Create index for active announcements queries
CREATE INDEX idx_announcements_is_active ON announcements(is_active);

-- Create index for date range queries
CREATE INDEX idx_announcements_dates ON announcements(starts_at, ends_at) WHERE is_active = TRUE;
