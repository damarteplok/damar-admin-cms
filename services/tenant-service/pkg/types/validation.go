package types

type CreateTenantValidation struct {
	Name      string `validate:"required,min=2,max=255"`
	Slug      string `validate:"omitempty,min=2,max=255,alphanum_hyphen"`
	Domain    string `validate:"omitempty,max=255,fqdn"`
	CreatedBy int64  `validate:"omitempty,gt=0"`
}

type UpdateTenantValidation struct {
	ID     int64  `validate:"required,gt=0"`
	Name   string `validate:"required,min=2,max=255"`
	Domain string `validate:"omitempty,max=255,fqdn"`
}

type TenantIDValidation struct {
	ID int64 `validate:"required,gt=0"`
}

type TenantUUIDValidation struct {
	UUID string `validate:"required,uuid"`
}

type TenantSlugValidation struct {
	Slug string `validate:"required,min=2,max=255"`
}

type AddUserToTenantValidation struct {
	UserID   int64  `validate:"required,gt=0"`
	TenantID int64  `validate:"required,gt=0"`
	Role     string `validate:"required,oneof=owner admin member guest"`
	Email    string `validate:"omitempty,email"`
}

type UpdateUserRoleValidation struct {
	UserID   int64  `validate:"required,gt=0"`
	TenantID int64  `validate:"required,gt=0"`
	Role     string `validate:"required,oneof=owner admin member guest"`
}

type TenantSettingValidation struct {
	TenantID int64  `validate:"required,gt=0"`
	Key      string `validate:"required,min=1,max=255"`
	Value    string `validate:"required"`
}
