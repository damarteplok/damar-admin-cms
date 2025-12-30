package domain

import (
	"context"
	"time"
)

// Announcement represents an announcement entity
type Announcement struct {
	ID                  int64
	Title               string
	Content             string
	StartsAt            *time.Time
	EndsAt              *time.Time
	IsActive            bool
	IsDismissible       bool
	ShowForCustomers    bool
	ShowOnFrontend      bool
	ShowOnUserDashboard bool
	CreatedAt           *time.Time
	UpdatedAt           *time.Time
}

// AnnouncementRepository defines the interface for announcement data access
type AnnouncementRepository interface {
	GetByID(ctx context.Context, id int64) (*Announcement, error)
	GetAll(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*Announcement, int64, error)
	Create(ctx context.Context, announcement *Announcement) (*Announcement, error)
	Update(ctx context.Context, announcement *Announcement) (*Announcement, error)
	Delete(ctx context.Context, id int64) error
	GetActiveAnnouncements(ctx context.Context, forCustomers, forFrontend, forUserDashboard bool) ([]*Announcement, error)
}

// AnnouncementService defines business logic for announcements
type AnnouncementService interface {
	GetAnnouncementByID(ctx context.Context, id int64) (*Announcement, error)
	GetAllAnnouncements(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*Announcement, int64, error)
	CreateAnnouncement(ctx context.Context, announcement *Announcement) (*Announcement, error)
	UpdateAnnouncement(ctx context.Context, announcement *Announcement) (*Announcement, error)
	DeleteAnnouncement(ctx context.Context, id int64) error
	GetActiveAnnouncements(ctx context.Context, forCustomers, forFrontend, forUserDashboard bool) ([]*Announcement, error)
}
