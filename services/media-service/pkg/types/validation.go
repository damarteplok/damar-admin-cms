package types

// UploadFileValidation validates upload file request
type UploadFileValidation struct {
	FileName       string `validate:"required,min=1,max=255"`
	MimeType       string `validate:"required,max=255"`
	Size           int64  `validate:"required,gt=0,lte=52428800"` // Max 50MB
	ModelType      string `validate:"required,min=1,max=255"`
	ModelID        int64  `validate:"required,gt=0"`
	CollectionName string `validate:"required,min=1,max=255"`
	Disk           string `validate:"required,min=1,max=255"`
}

// IDValidation validates ID parameters
type IDValidation struct {
	ID int64 `validate:"required,gt=0"`
}

// UUIDValidation validates UUID parameters
type UUIDValidation struct {
	UUID string `validate:"required,uuid"`
}

// GetFilesByModelValidation validates get files by model request
type GetFilesByModelValidation struct {
	ModelType string `validate:"required,min=1,max=255"`
	ModelID   int64  `validate:"required,gt=0"`
}

// PaginationValidation validates pagination parameters
type PaginationValidation struct {
	Page    int32 `validate:"omitempty,gte=1"`
	PerPage int32 `validate:"omitempty,gte=1,lte=100"`
}
