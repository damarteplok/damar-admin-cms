-- Create blog_post_categories table
CREATE TABLE IF NOT EXISTS blog_post_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    body TEXT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    published_at TIMESTAMP(0) NULL,
    user_id BIGINT NOT NULL,
    author_id BIGINT NULL,
    blog_post_category_id BIGINT NULL,
    description TEXT NULL,
    created_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT blog_posts_blog_post_category_id_foreign 
        FOREIGN KEY (blog_post_category_id) 
        REFERENCES blog_post_categories(id) 
        ON DELETE SET NULL
);

-- Create full-text search index
CREATE INDEX blog_posts_title_body_fulltext 
ON blog_posts 
USING gin (
    (
        to_tsvector('english'::regconfig, title) || 
        to_tsvector('english'::regconfig, body)
    )
);

-- Create indexes for common queries
CREATE INDEX blog_posts_is_published_idx ON blog_posts(is_published);
CREATE INDEX blog_posts_published_at_idx ON blog_posts(published_at);
CREATE INDEX blog_posts_blog_post_category_id_idx ON blog_posts(blog_post_category_id);
CREATE INDEX blog_posts_user_id_idx ON blog_posts(user_id);
CREATE INDEX blog_posts_author_id_idx ON blog_posts(author_id);
