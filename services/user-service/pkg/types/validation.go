package types

type CreateUserValidation struct {
	Name        string `validate:"required,min=2,max=100"`
	Email       string `validate:"required,email"`
	Password    string `validate:"required,min=8,max=100"`
	PublicName  string `validate:"omitempty,max=100"`
	PhoneNumber string `validate:"omitempty,max=20"`
	Position    string `validate:"omitempty,max=100"`
}

type UpdateUserValidation struct {
	ID          int64  `validate:"required,gt=0"`
	Name        string `validate:"required,min=2,max=100"`
	Email       string `validate:"omitempty,email"`
	PublicName  string `validate:"omitempty,max=100"`
	PhoneNumber string `validate:"omitempty,max=20"`
	Position    string `validate:"omitempty,max=100"`
}

type SearchUsersValidation struct {
	Query string `validate:"required,min=1"`
}

type EmailValidation struct {
	Email string `validate:"required,email"`
}

type IDValidation struct {
	ID int64 `validate:"required,gt=0"`
}

type IDsValidation struct {
	IDs []int64 `validate:"required,min=1,dive,gt=0"`
}
