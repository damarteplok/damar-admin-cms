package repository

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProductRepository struct {
	db *pgxpool.Pool
}

func NewProductRepository(db *pgxpool.Pool) domain.ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) GetByID(ctx context.Context, id int64) (*domain.Product, error) {
	query := `
		SELECT id, name, slug, description, metadata, features, is_popular, is_default, created_at, updated_at
		FROM products 
		WHERE id = $1
	`

	product := &domain.Product{}
	var metadataJSON, featuresJSON []byte

	err := r.db.QueryRow(ctx, query, id).Scan(
		&product.ID,
		&product.Name,
		&product.Slug,
		&product.Description,
		&metadataJSON,
		&featuresJSON,
		&product.IsPopular,
		&product.IsDefault,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get product by ID: %w", err)
	}

	// Parse JSON fields
	if len(metadataJSON) > 0 {
		if err := json.Unmarshal(metadataJSON, &product.Metadata); err != nil {
			return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
		}
	}
	if len(featuresJSON) > 0 {
		if err := json.Unmarshal(featuresJSON, &product.Features); err != nil {
			return nil, fmt.Errorf("failed to unmarshal features: %w", err)
		}
	}

	return product, nil
}

func (r *ProductRepository) GetBySlug(ctx context.Context, slug string) (*domain.Product, error) {
	query := `
		SELECT id, name, slug, description, metadata, features, is_popular, is_default, created_at, updated_at
		FROM products 
		WHERE slug = $1
	`

	product := &domain.Product{}
	var metadataJSON, featuresJSON []byte

	err := r.db.QueryRow(ctx, query, slug).Scan(
		&product.ID,
		&product.Name,
		&product.Slug,
		&product.Description,
		&metadataJSON,
		&featuresJSON,
		&product.IsPopular,
		&product.IsDefault,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get product by slug: %w", err)
	}

	// Parse JSON fields
	if len(metadataJSON) > 0 {
		if err := json.Unmarshal(metadataJSON, &product.Metadata); err != nil {
			return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
		}
	}
	if len(featuresJSON) > 0 {
		if err := json.Unmarshal(featuresJSON, &product.Features); err != nil {
			return nil, fmt.Errorf("failed to unmarshal features: %w", err)
		}
	}

	return product, nil
}

func (r *ProductRepository) Create(ctx context.Context, product *domain.Product) error {
	metadataJSON, err := json.Marshal(product.Metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	featuresJSON, err := json.Marshal(product.Features)
	if err != nil {
		return fmt.Errorf("failed to marshal features: %w", err)
	}

	query := `
		INSERT INTO products (name, slug, description, metadata, features, is_popular, is_default, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err = r.db.QueryRow(
		ctx,
		query,
		product.Name,
		product.Slug,
		product.Description,
		metadataJSON,
		featuresJSON,
		product.IsPopular,
		product.IsDefault,
	).Scan(&product.ID, &product.CreatedAt, &product.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create product: %w", err)
	}

	return nil
}

func (r *ProductRepository) Update(ctx context.Context, product *domain.Product) error {
	metadataJSON, err := json.Marshal(product.Metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	featuresJSON, err := json.Marshal(product.Features)
	if err != nil {
		return fmt.Errorf("failed to marshal features: %w", err)
	}

	query := `
		UPDATE products 
		SET name = $1, slug = $2, description = $3, metadata = $4, features = $5, 
		    is_popular = $6, is_default = $7, updated_at = NOW()
		WHERE id = $8
		RETURNING updated_at
	`

	err = r.db.QueryRow(
		ctx,
		query,
		product.Name,
		product.Slug,
		product.Description,
		metadataJSON,
		featuresJSON,
		product.IsPopular,
		product.IsDefault,
		product.ID,
	).Scan(&product.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update product: %w", err)
	}

	return nil
}

func (r *ProductRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM products WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("product not found")
	}

	return nil
}

func (r *ProductRepository) GetAll(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*domain.Product, int, error) {
	offset := (page - 1) * perPage

	// Build where clause for search
	whereClause := ""
	args := []interface{}{}
	argIndex := 1

	if search != "" {
		whereClause = fmt.Sprintf(" WHERE name ILIKE $%d OR slug ILIKE $%d OR description ILIKE $%d", argIndex, argIndex, argIndex)
		args = append(args, "%"+search+"%")
		argIndex++
	}

	// Get total count
	var total int
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM products%s`, whereClause)
	var err error
	if len(args) > 0 {
		err = r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count products: %w", err)
	}

	// Build order by clause
	orderClause := "ORDER BY created_at DESC"
	if sortBy != "" {
		// Validate sortBy to prevent SQL injection
		validSortFields := map[string]bool{
			"name":       true,
			"slug":       true,
			"created_at": true,
			"updated_at": true,
		}
		if validSortFields[sortBy] {
			direction := "DESC"
			if sortOrder == "asc" || sortOrder == "ASC" {
				direction = "ASC"
			}
			orderClause = fmt.Sprintf("ORDER BY %s %s", sortBy, direction)
		}
	}

	// Get products
	query := fmt.Sprintf(`
		SELECT id, name, slug, description, metadata, features, is_popular, is_default, created_at, updated_at
		FROM products%s
		%s
		LIMIT $%d OFFSET $%d
	`, whereClause, orderClause, argIndex, argIndex+1)

	args = append(args, perPage, offset)
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get products: %w", err)
	}
	defer rows.Close()

	products := make([]*domain.Product, 0)
	for rows.Next() {
		product := &domain.Product{}
		var metadataJSON, featuresJSON []byte

		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Slug,
			&product.Description,
			&metadataJSON,
			&featuresJSON,
			&product.IsPopular,
			&product.IsDefault,
			&product.CreatedAt,
			&product.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan product: %w", err)
		}

		// Parse JSON fields
		if len(metadataJSON) > 0 {
			if err := json.Unmarshal(metadataJSON, &product.Metadata); err != nil {
				return nil, 0, fmt.Errorf("failed to unmarshal metadata: %w", err)
			}
		}
		if len(featuresJSON) > 0 {
			if err := json.Unmarshal(featuresJSON, &product.Features); err != nil {
				return nil, 0, fmt.Errorf("failed to unmarshal features: %w", err)
			}
		}

		products = append(products, product)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating products: %w", err)
	}

	return products, total, nil
}
