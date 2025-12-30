package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	"go.uber.org/zap"
)

type AnnouncementService struct {
	repo domain.AnnouncementRepository
}

func NewAnnouncementService(repo domain.AnnouncementRepository) domain.AnnouncementService {
	return &AnnouncementService{
		repo: repo,
	}
}

func (s *AnnouncementService) GetAnnouncementByID(ctx context.Context, id int64) (*domain.Announcement, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *AnnouncementService) GetAllAnnouncements(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*domain.Announcement, int64, error) {
	// Set defaults
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}

	return s.repo.GetAll(ctx, page, perPage, search, sortBy, sortOrder)
}

func (s *AnnouncementService) CreateAnnouncement(ctx context.Context, announcement *domain.Announcement) (*domain.Announcement, error) {
	// Validate dates
	if announcement.StartsAt != nil && announcement.EndsAt != nil {
		if announcement.EndsAt.Before(*announcement.StartsAt) {
			return nil, errors.New("end date must be after start date")
		}
	}

	// Set timestamps
	now := time.Now()
	announcement.CreatedAt = &now
	announcement.UpdatedAt = &now

	created, err := s.repo.Create(ctx, announcement)
	if err != nil {
		logger.Error("Failed to create announcement",
			zap.Error(err),
			zap.String("title", announcement.Title),
		)
		return nil, fmt.Errorf("failed to create announcement: %w", err)
	}

	logger.Info("Announcement created successfully",
		zap.Int64("id", created.ID),
		zap.String("title", created.Title),
	)

	return created, nil
}

func (s *AnnouncementService) UpdateAnnouncement(ctx context.Context, announcement *domain.Announcement) (*domain.Announcement, error) {
	// Check if announcement exists
	existing, err := s.repo.GetByID(ctx, announcement.ID)
	if err != nil {
		return nil, fmt.Errorf("announcement not found: %w", err)
	}

	// Validate dates
	if announcement.StartsAt != nil && announcement.EndsAt != nil {
		if announcement.EndsAt.Before(*announcement.StartsAt) {
			return nil, errors.New("end date must be after start date")
		}
	}

	// Update timestamp
	now := time.Now()
	announcement.UpdatedAt = &now

	// Preserve created_at
	announcement.CreatedAt = existing.CreatedAt

	updated, err := s.repo.Update(ctx, announcement)
	if err != nil {
		logger.Error("Failed to update announcement",
			zap.Error(err),
			zap.Int64("id", announcement.ID),
		)
		return nil, fmt.Errorf("failed to update announcement: %w", err)
	}

	logger.Info("Announcement updated successfully",
		zap.Int64("id", updated.ID),
		zap.String("title", updated.Title),
	)

	return updated, nil
}

func (s *AnnouncementService) DeleteAnnouncement(ctx context.Context, id int64) error {
	// Check if announcement exists
	_, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("announcement not found: %w", err)
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		logger.Error("Failed to delete announcement",
			zap.Error(err),
			zap.Int64("id", id),
		)
		return fmt.Errorf("failed to delete announcement: %w", err)
	}

	logger.Info("Announcement deleted successfully", zap.Int64("id", id))
	return nil
}

func (s *AnnouncementService) GetActiveAnnouncements(ctx context.Context, forCustomers, forFrontend, forUserDashboard bool) ([]*domain.Announcement, error) {
	return s.repo.GetActiveAnnouncements(ctx, forCustomers, forFrontend, forUserDashboard)
}
