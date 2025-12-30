package domain

import (
	"context"
	"time"
)

// BlogPost represents a blog post entity
type BlogPost struct {
	ID                 int64
	Title              string
	Slug               string
	Body               string
	IsPublished        bool
	PublishedAt        *time.Time
	UserID             int64
	AuthorID           *int64
	BlogPostCategoryID *int64
	Description        *string
	CreatedAt          *time.Time
	UpdatedAt          *time.Time
}

// BlogPostRepository defines the interface for blog post data access
type BlogPostRepository interface {
	GetByID(ctx context.Context, id int64) (*BlogPost, error)
	GetBySlug(ctx context.Context, slug string) (*BlogPost, error)
	GetAll(ctx context.Context, page, perPage int, search string, publishedOnly bool, categoryID *int64, sortBy, sortOrder string) ([]*BlogPost, int64, error)
	Create(ctx context.Context, post *BlogPost) (*BlogPost, error)
	Update(ctx context.Context, post *BlogPost) (*BlogPost, error)
	Delete(ctx context.Context, id int64) error
	Publish(ctx context.Context, id int64, publishedAt time.Time) (*BlogPost, error)
	Unpublish(ctx context.Context, id int64) (*BlogPost, error)
	Search(ctx context.Context, query string, page, perPage int, publishedOnly bool) ([]*BlogPost, int64, error)
	SlugExists(ctx context.Context, slug string, excludeID *int64) (bool, error)
}

// BlogPostService defines business logic for blog posts
type BlogPostService interface {
	GetBlogPostByID(ctx context.Context, id int64) (*BlogPost, error)
	GetBlogPostBySlug(ctx context.Context, slug string) (*BlogPost, error)
	GetAllBlogPosts(ctx context.Context, page, perPage int, search string, publishedOnly bool, categoryID *int64, sortBy, sortOrder string) ([]*BlogPost, int64, error)
	CreateBlogPost(ctx context.Context, post *BlogPost) (*BlogPost, error)
	UpdateBlogPost(ctx context.Context, post *BlogPost) (*BlogPost, error)
	DeleteBlogPost(ctx context.Context, id int64) error
	PublishBlogPost(ctx context.Context, id int64) (*BlogPost, error)
	UnpublishBlogPost(ctx context.Context, id int64) (*BlogPost, error)
	SearchBlogPosts(ctx context.Context, query string, page, perPage int, publishedOnly bool) ([]*BlogPost, int64, error)
}
