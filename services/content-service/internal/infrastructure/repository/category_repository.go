package repository

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CategoryRepository struct {
	db *pgxpool.Pool
}

func NewCategoryRepository(db *pgxpool.Pool) domain.CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) GetByID(ctx context.Context, id int64) (*domain.Category, error) {
	query := `
		SELECT id, name, slug, created_at, updated_at
		FROM blog_post_categories 
		WHERE id = $1
	`

	category := &domain.Category{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&category.ID,
		&category.Name,
		&category.Slug,
		&category.CreatedAt,
		&category.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get category by ID: %w", err)
	}

	return category, nil
}

func (r *CategoryRepository) GetBySlug(ctx context.Context, slug string) (*domain.Category, error) {
	query := `
		SELECT id, name, slug, created_at, updated_at
		FROM blog_post_categories 
		WHERE slug = $1
	`

	category := &domain.Category{}
	err := r.db.QueryRow(ctx, query, slug).Scan(
		&category.ID,
		&category.Name,
		&category.Slug,
		&category.CreatedAt,
		&category.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get category by slug: %w", err)
	}

	return category, nil
}

func (r *CategoryRepository) GetAll(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*domain.Category, int64, error) {
	// Build WHERE clause
	whereClause := ""
	args := []interface{}{}
	argCount := 1

	if search != "" {
		whereClause = fmt.Sprintf("WHERE name ILIKE $%d", argCount)
		args = append(args, "%"+search+"%")
		argCount++
	}

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM blog_post_categories %s", whereClause)
	var total int64
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count categories: %w", err)
	}

	// Validate sort parameters
	validSortColumns := map[string]bool{
		"id":         true,
		"name":       true,
		"created_at": true,
		"updated_at": true,
	}
	if sortBy == "" || !validSortColumns[sortBy] {
		sortBy = "name"
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "asc"
	}

	// Calculate offset
	offset := (page - 1) * perPage

	// Get paginated results
	query := fmt.Sprintf(`
		SELECT id, name, slug, created_at, updated_at
		FROM blog_post_categories
		%s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortBy, sortOrder, argCount, argCount+1)

	args = append(args, perPage, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get categories: %w", err)
	}
	defer rows.Close()

	categories := []*domain.Category{}
	for rows.Next() {
		category := &domain.Category{}
		err := rows.Scan(
			&category.ID,
			&category.Name,
			&category.Slug,
			&category.CreatedAt,
			&category.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan category: %w", err)
		}
		categories = append(categories, category)
	}

	return categories, total, nil
}

func (r *CategoryRepository) Create(ctx context.Context, category *domain.Category) (*domain.Category, error) {
	query := `
		INSERT INTO blog_post_categories (name, slug, created_at, updated_at)
		VALUES ($1, $2, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		category.Name,
		category.Slug,
	).Scan(&category.ID, &category.CreatedAt, &category.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	return category, nil
}

func (r *CategoryRepository) Update(ctx context.Context, category *domain.Category) (*domain.Category, error) {
	query := `
		UPDATE blog_post_categories 
		SET name = $1, slug = $2, updated_at = NOW()
		WHERE id = $3
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		category.Name,
		category.Slug,
		category.ID,
	).Scan(&category.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update category: %w", err)
	}

	return category, nil
}

func (r *CategoryRepository) Delete(ctx context.Context, id int64) error {
	// First, check if any blog posts use this category
	checkQuery := `SELECT EXISTS(SELECT 1 FROM blog_posts WHERE blog_post_category_id = $1)`
	var hasRelations bool
	err := r.db.QueryRow(ctx, checkQuery, id).Scan(&hasRelations)
	if err != nil {
		return fmt.Errorf("failed to check category relations: %w", err)
	}

	if hasRelations {
		return fmt.Errorf("cannot delete category: blog posts are using this category")
	}

	query := `DELETE FROM blog_post_categories WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("category not found")
	}

	return nil
}

func (r *CategoryRepository) SlugExists(ctx context.Context, slug string, excludeID *int64) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM blog_post_categories WHERE slug = $1`
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
