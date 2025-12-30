package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AnnouncementRepository struct {
	db *pgxpool.Pool
}

func NewAnnouncementRepository(db *pgxpool.Pool) domain.AnnouncementRepository {
	return &AnnouncementRepository{db: db}
}

func (r *AnnouncementRepository) GetByID(ctx context.Context, id int64) (*domain.Announcement, error) {
	query := `
		SELECT id, title, content, starts_at, ends_at, is_active, 
		       is_dismissible, show_for_customers, show_on_frontend, 
		       show_on_user_dashboard, created_at, updated_at
		FROM announcements 
		WHERE id = $1
	`

	announcement := &domain.Announcement{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&announcement.ID,
		&announcement.Title,
		&announcement.Content,
		&announcement.StartsAt,
		&announcement.EndsAt,
		&announcement.IsActive,
		&announcement.IsDismissible,
		&announcement.ShowForCustomers,
		&announcement.ShowOnFrontend,
		&announcement.ShowOnUserDashboard,
		&announcement.CreatedAt,
		&announcement.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get announcement by ID: %w", err)
	}

	return announcement, nil
}

func (r *AnnouncementRepository) GetAll(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*domain.Announcement, int64, error) {
	offset := (page - 1) * perPage

	// Build WHERE clause
	whereConditions := []string{}
	args := []interface{}{}
	argIndex := 1

	if search != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("(title ILIKE $%d OR content ILIKE $%d)", argIndex, argIndex))
		args = append(args, "%"+search+"%")
		argIndex++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	// Validate and set sort parameters
	validSortColumns := map[string]bool{
		"id":         true,
		"title":      true,
		"created_at": true,
		"updated_at": true,
		"starts_at":  true,
		"ends_at":    true,
	}

	if !validSortColumns[sortBy] {
		sortBy = "created_at"
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	// Count total
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM announcements %s`, whereClause)
	var total int64
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count announcements: %w", err)
	}

	// Get announcements
	args = append(args, perPage, offset)
	query := fmt.Sprintf(`
		SELECT id, title, content, starts_at, ends_at, is_active, 
		       is_dismissible, show_for_customers, show_on_frontend, 
		       show_on_user_dashboard, created_at, updated_at
		FROM announcements
		%s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortBy, sortOrder, argIndex, argIndex+1)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get announcements: %w", err)
	}
	defer rows.Close()

	var announcements []*domain.Announcement
	for rows.Next() {
		announcement := &domain.Announcement{}
		err := rows.Scan(
			&announcement.ID,
			&announcement.Title,
			&announcement.Content,
			&announcement.StartsAt,
			&announcement.EndsAt,
			&announcement.IsActive,
			&announcement.IsDismissible,
			&announcement.ShowForCustomers,
			&announcement.ShowOnFrontend,
			&announcement.ShowOnUserDashboard,
			&announcement.CreatedAt,
			&announcement.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan announcement: %w", err)
		}
		announcements = append(announcements, announcement)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating announcements: %w", err)
	}

	return announcements, total, nil
}

func (r *AnnouncementRepository) Create(ctx context.Context, announcement *domain.Announcement) (*domain.Announcement, error) {
	query := `
		INSERT INTO announcements (
			title, content, starts_at, ends_at, is_active, 
			is_dismissible, show_for_customers, show_on_frontend, 
			show_on_user_dashboard, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, title, content, starts_at, ends_at, is_active, 
		          is_dismissible, show_for_customers, show_on_frontend, 
		          show_on_user_dashboard, created_at, updated_at
	`

	created := &domain.Announcement{}
	err := r.db.QueryRow(
		ctx,
		query,
		announcement.Title,
		announcement.Content,
		announcement.StartsAt,
		announcement.EndsAt,
		announcement.IsActive,
		announcement.IsDismissible,
		announcement.ShowForCustomers,
		announcement.ShowOnFrontend,
		announcement.ShowOnUserDashboard,
		announcement.CreatedAt,
		announcement.UpdatedAt,
	).Scan(
		&created.ID,
		&created.Title,
		&created.Content,
		&created.StartsAt,
		&created.EndsAt,
		&created.IsActive,
		&created.IsDismissible,
		&created.ShowForCustomers,
		&created.ShowOnFrontend,
		&created.ShowOnUserDashboard,
		&created.CreatedAt,
		&created.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create announcement: %w", err)
	}

	return created, nil
}

func (r *AnnouncementRepository) Update(ctx context.Context, announcement *domain.Announcement) (*domain.Announcement, error) {
	query := `
		UPDATE announcements 
		SET title = $2, content = $3, starts_at = $4, ends_at = $5, 
		    is_active = $6, is_dismissible = $7, show_for_customers = $8, 
		    show_on_frontend = $9, show_on_user_dashboard = $10, updated_at = $11
		WHERE id = $1
		RETURNING id, title, content, starts_at, ends_at, is_active, 
		          is_dismissible, show_for_customers, show_on_frontend, 
		          show_on_user_dashboard, created_at, updated_at
	`

	updated := &domain.Announcement{}
	err := r.db.QueryRow(
		ctx,
		query,
		announcement.ID,
		announcement.Title,
		announcement.Content,
		announcement.StartsAt,
		announcement.EndsAt,
		announcement.IsActive,
		announcement.IsDismissible,
		announcement.ShowForCustomers,
		announcement.ShowOnFrontend,
		announcement.ShowOnUserDashboard,
		announcement.UpdatedAt,
	).Scan(
		&updated.ID,
		&updated.Title,
		&updated.Content,
		&updated.StartsAt,
		&updated.EndsAt,
		&updated.IsActive,
		&updated.IsDismissible,
		&updated.ShowForCustomers,
		&updated.ShowOnFrontend,
		&updated.ShowOnUserDashboard,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update announcement: %w", err)
	}

	return updated, nil
}

func (r *AnnouncementRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM announcements WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete announcement: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("announcement not found")
	}

	return nil
}

func (r *AnnouncementRepository) GetActiveAnnouncements(ctx context.Context, forCustomers, forFrontend, forUserDashboard bool) ([]*domain.Announcement, error) {
	now := time.Now()

	// Build WHERE clause
	whereConditions := []string{"is_active = true"}
	whereConditions = append(whereConditions, "(starts_at IS NULL OR starts_at <= $1)")
	whereConditions = append(whereConditions, "(ends_at IS NULL OR ends_at >= $1)")

	// Add visibility filters
	visibilityConditions := []string{}
	if forCustomers {
		visibilityConditions = append(visibilityConditions, "show_for_customers = true")
	}
	if forFrontend {
		visibilityConditions = append(visibilityConditions, "show_on_frontend = true")
	}
	if forUserDashboard {
		visibilityConditions = append(visibilityConditions, "show_on_user_dashboard = true")
	}

	if len(visibilityConditions) > 0 {
		whereConditions = append(whereConditions, "("+strings.Join(visibilityConditions, " OR ")+")")
	}

	whereClause := strings.Join(whereConditions, " AND ")

	query := fmt.Sprintf(`
		SELECT id, title, content, starts_at, ends_at, is_active, 
		       is_dismissible, show_for_customers, show_on_frontend, 
		       show_on_user_dashboard, created_at, updated_at
		FROM announcements
		WHERE %s
		ORDER BY created_at DESC
	`, whereClause)

	rows, err := r.db.Query(ctx, query, now)
	if err != nil {
		return nil, fmt.Errorf("failed to get active announcements: %w", err)
	}
	defer rows.Close()

	var announcements []*domain.Announcement
	for rows.Next() {
		announcement := &domain.Announcement{}
		err := rows.Scan(
			&announcement.ID,
			&announcement.Title,
			&announcement.Content,
			&announcement.StartsAt,
			&announcement.EndsAt,
			&announcement.IsActive,
			&announcement.IsDismissible,
			&announcement.ShowForCustomers,
			&announcement.ShowOnFrontend,
			&announcement.ShowOnUserDashboard,
			&announcement.CreatedAt,
			&announcement.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan announcement: %w", err)
		}
		announcements = append(announcements, announcement)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating announcements: %w", err)
	}

	return announcements, nil
}
