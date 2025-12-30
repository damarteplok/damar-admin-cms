-- Drop indexes
DROP INDEX IF EXISTS blog_posts_author_id_idx;
DROP INDEX IF EXISTS blog_posts_user_id_idx;
DROP INDEX IF EXISTS blog_posts_blog_post_category_id_idx;
DROP INDEX IF EXISTS blog_posts_published_at_idx;
DROP INDEX IF EXISTS blog_posts_is_published_idx;
DROP INDEX IF EXISTS blog_posts_title_body_fulltext;

-- Drop tables
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS blog_post_categories;
