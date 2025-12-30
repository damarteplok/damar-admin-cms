package types

// IDValidation is used to validate ID fields
type IDValidation struct {
	ID int64 `validate:"required,gt=0"`
}

// SlugValidation is used to validate slug fields
type SlugValidation struct {
	Slug string `validate:"required,min=1,max=255"`
}

// CreateBlogPostValidation validates blog post creation
type CreateBlogPostValidation struct {
	Title       string `validate:"required,min=1,max=500"`
	Slug        string `validate:"omitempty,min=1,max=255"`
	Body        string `validate:"required,min=1"`
	Description string `validate:"omitempty,max=1000"`
	UserID      int64  `validate:"required,gt=0"`
}

// UpdateBlogPostValidation validates blog post updates
type UpdateBlogPostValidation struct {
	ID          int64  `validate:"required,gt=0"`
	Title       string `validate:"required,min=1,max=500"`
	Slug        string `validate:"required,min=1,max=255"`
	Body        string `validate:"required,min=1"`
	Description string `validate:"omitempty,max=1000"`
}

// CreateCategoryValidation validates category creation
type CreateCategoryValidation struct {
	Name string `validate:"required,min=1,max=255"`
	Slug string `validate:"omitempty,min=1,max=255"`
}

// UpdateCategoryValidation validates category updates
type UpdateCategoryValidation struct {
	ID   int64  `validate:"required,gt=0"`
	Name string `validate:"required,min=1,max=255"`
	Slug string `validate:"required,min=1,max=255"`
}

// CreateAnnouncementValidation validates announcement creation
type CreateAnnouncementValidation struct {
	Title   string `validate:"required,min=1,max=255"`
	Content string `validate:"required,min=1"`
}

// UpdateAnnouncementValidation validates announcement updates
type UpdateAnnouncementValidation struct {
	ID      int64  `validate:"required,gt=0"`
	Title   string `validate:"required,min=1,max=255"`
	Content string `validate:"required,min=1"`
}

// PaginationValidation validates pagination parameters
type PaginationValidation struct {
	Page    int32 `validate:"omitempty,gte=1"`
	PerPage int32 `validate:"omitempty,gte=1,lte=100"`
}
