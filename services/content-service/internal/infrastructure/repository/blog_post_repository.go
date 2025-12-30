package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BlogPostRepository struct {
	db *pgxpool.Pool
}

func NewBlogPostRepository(db *pgxpool.Pool) domain.BlogPostRepository {
	return &BlogPostRepository{db: db}
}

func (r *BlogPostRepository) GetByID(ctx context.Context, id int64) (*domain.BlogPost, error) {
	query := `
		SELECT id, title, slug, body, is_published, published_at, user_id, 
		       author_id, blog_post_category_id, description, created_at, updated_at
		FROM blog_posts 
		WHERE id = $1
	`

	post := &domain.BlogPost{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&post.ID,
		&post.Title,
		&post.Slug,
		&post.Body,
		&post.IsPublished,
		&post.PublishedAt,
		&post.UserID,
		&post.AuthorID,
		&post.BlogPostCategoryID,
		&post.Description,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get blog post by ID: %w", err)
	}

	return post, nil
}

func (r *BlogPostRepository) GetBySlug(ctx context.Context, slug string) (*domain.BlogPost, error) {
	query := `
		SELECT id, title, slug, body, is_published, published_at, user_id, 
		       author_id, blog_post_category_id, description, created_at, updated_at
		FROM blog_posts 
		WHERE slug = $1
	`

	post := &domain.BlogPost{}
	err := r.db.QueryRow(ctx, query, slug).Scan(
		&post.ID,
		&post.Title,
		&post.Slug,
		&post.Body,
		&post.IsPublished,
		&post.PublishedAt,
		&post.UserID,
		&post.AuthorID,
		&post.BlogPostCategoryID,
		&post.Description,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get blog post by slug: %w", err)
	}

	return post, nil
}

func (r *BlogPostRepository) GetAll(ctx context.Context, page, perPage int, search string, publishedOnly bool, categoryID *int64, sortBy, sortOrder string) ([]*domain.BlogPost, int64, error) {
	// Build WHERE clause
	whereClauses := []string{}
	args := []interface{}{}
	argCount := 1

	// Add search filter
	if search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("(title ILIKE $%d OR body ILIKE $%d OR description ILIKE $%d)", argCount, argCount, argCount))
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern)
		argCount++
	}

	if publishedOnly {
		whereClauses = append(whereClauses, fmt.Sprintf("is_published = $%d", argCount))
		args = append(args, true)
		argCount++
	}

	if categoryID != nil {
		whereClauses = append(whereClauses, fmt.Sprintf("blog_post_category_id = $%d", argCount))
		args = append(args, *categoryID)
		argCount++
	}

	whereClause := ""
	if len(whereClauses) > 0 {
		whereClause = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM blog_posts %s", whereClause)
	var total int64
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count blog posts: %w", err)
	}

	// Validate sort parameters
	validSortColumns := map[string]bool{
		"id":           true,
		"title":        true,
		"created_at":   true,
		"updated_at":   true,
		"published_at": true,
	}
	if sortBy == "" || !validSortColumns[sortBy] {
		sortBy = "created_at"
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	// Calculate offset
	offset := (page - 1) * perPage

	// Get paginated results
	query := fmt.Sprintf(`
		SELECT id, title, slug, body, is_published, published_at, user_id, 
		       author_id, blog_post_category_id, description, created_at, updated_at
		FROM blog_posts
		%s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortBy, sortOrder, argCount, argCount+1)

	args = append(args, perPage, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get blog posts: %w", err)
	}
	defer rows.Close()

	posts := []*domain.BlogPost{}
	for rows.Next() {
		post := &domain.BlogPost{}
		err := rows.Scan(
			&post.ID,
			&post.Title,
			&post.Slug,
			&post.Body,
			&post.IsPublished,
			&post.PublishedAt,
			&post.UserID,
			&post.AuthorID,
			&post.BlogPostCategoryID,
			&post.Description,
			&post.CreatedAt,
			&post.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan blog post: %w", err)
		}
		posts = append(posts, post)
	}

	return posts, total, nil
}

func (r *BlogPostRepository) Create(ctx context.Context, post *domain.BlogPost) (*domain.BlogPost, error) {
	query := `
		INSERT INTO blog_posts (title, slug, body, description, user_id, author_id, blog_post_category_id, is_published, published_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
		RETURNING id, is_published, published_at, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		post.Title,
		post.Slug,
		post.Body,
		post.Description,
		post.UserID,
		post.AuthorID,
		post.BlogPostCategoryID,
		post.IsPublished,
		post.PublishedAt,
	).Scan(&post.ID, &post.IsPublished, &post.PublishedAt, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create blog post: %w", err)
	}

	return post, nil
}

func (r *BlogPostRepository) Update(ctx context.Context, post *domain.BlogPost) (*domain.BlogPost, error) {
	query := `
		UPDATE blog_posts 
		SET title = $1, slug = $2, body = $3, description = $4, 
		    author_id = $5, blog_post_category_id = $6, updated_at = NOW()
		WHERE id = $7
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		post.Title,
		post.Slug,
		post.Body,
		post.Description,
		post.AuthorID,
		post.BlogPostCategoryID,
		post.ID,
	).Scan(&post.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update blog post: %w", err)
	}

	return post, nil
}

func (r *BlogPostRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM blog_posts WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete blog post: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("blog post not found")
	}

	return nil
}

func (r *BlogPostRepository) Publish(ctx context.Context, id int64, publishedAt time.Time) (*domain.BlogPost, error) {
	query := `
		UPDATE blog_posts 
		SET is_published = TRUE, published_at = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING id, title, slug, body, is_published, published_at, user_id, 
		          author_id, blog_post_category_id, description, created_at, updated_at
	`

	post := &domain.BlogPost{}
	err := r.db.QueryRow(ctx, query, publishedAt, id).Scan(
		&post.ID,
		&post.Title,
		&post.Slug,
		&post.Body,
		&post.IsPublished,
		&post.PublishedAt,
		&post.UserID,
		&post.AuthorID,
		&post.BlogPostCategoryID,
		&post.Description,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to publish blog post: %w", err)
	}

	return post, nil
}

func (r *BlogPostRepository) Unpublish(ctx context.Context, id int64) (*domain.BlogPost, error) {
	query := `
		UPDATE blog_posts 
		SET is_published = FALSE, updated_at = NOW()
		WHERE id = $1
		RETURNING id, title, slug, body, is_published, published_at, user_id, 
		          author_id, blog_post_category_id, description, created_at, updated_at
	`

	post := &domain.BlogPost{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&post.ID,
		&post.Title,
		&post.Slug,
		&post.Body,
		&post.IsPublished,
		&post.PublishedAt,
		&post.UserID,
		&post.AuthorID,
		&post.BlogPostCategoryID,
		&post.Description,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to unpublish blog post: %w", err)
	}

	return post, nil
}

func (r *BlogPostRepository) Search(ctx context.Context, query string, page, perPage int, publishedOnly bool) ([]*domain.BlogPost, int64, error) {
	// Build WHERE clause with full-text search
	whereClauses := []string{
		"(to_tsvector('english', title) || to_tsvector('english', body)) @@ plainto_tsquery('english', $1)",
	}
	args := []interface{}{query}
	argCount := 2

	if publishedOnly {
		whereClauses = append(whereClauses, fmt.Sprintf("is_published = $%d", argCount))
		args = append(args, true)
		argCount++
	}

	whereClause := "WHERE " + strings.Join(whereClauses, " AND ")

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM blog_posts %s", whereClause)
	var total int64
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count search results: %w", err)
	}

	// Calculate offset
	offset := (page - 1) * perPage

	// Get paginated results with ranking
	searchQuery := fmt.Sprintf(`
		SELECT id, title, slug, body, is_published, published_at, user_id, 
		       author_id, blog_post_category_id, description, created_at, updated_at
		FROM blog_posts
		%s
		ORDER BY ts_rank(
			(to_tsvector('english', title) || to_tsvector('english', body)),
			plainto_tsquery('english', $1)
		) DESC, created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argCount, argCount+1)

	args = append(args, perPage, offset)

	rows, err := r.db.Query(ctx, searchQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search blog posts: %w", err)
	}
	defer rows.Close()

	posts := []*domain.BlogPost{}
	for rows.Next() {
		post := &domain.BlogPost{}
		err := rows.Scan(
			&post.ID,
			&post.Title,
			&post.Slug,
			&post.Body,
			&post.IsPublished,
			&post.PublishedAt,
			&post.UserID,
			&post.AuthorID,
			&post.BlogPostCategoryID,
			&post.Description,
			&post.CreatedAt,
			&post.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan search result: %w", err)
		}
		posts = append(posts, post)
	}

	return posts, total, nil
}

func (r *BlogPostRepository) SlugExists(ctx context.Context, slug string, excludeID *int64) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM blog_posts WHERE slug = $1`
	args := []interface{}{slug}

	if excludeID != nil {
		query += ` AND id != $2`
		args = append(args, *excludeID)
	}

	query += `)`

	var exists bool
	err := r.db.QueryRow(ctx, query, args...).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check slug existence: %w", err)
	}

	return exists, nil
}
