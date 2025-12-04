package types

// Product validation
type CreateProductValidation struct {
	Name        string `validate:"required,min=3,max=255"`
	Slug        string `validate:"required,alphanum_hyphen,min=3,max=255"`
	Description string `validate:"max=1000"`
}

type UpdateProductValidation struct {
	ID          int64  `validate:"required,min=1"`
	Name        string `validate:"required,min=3,max=255"`
	Slug        string `validate:"required,alphanum_hyphen,min=3,max=255"`
	Description string `validate:"max=1000"`
}

// Plan validation
type CreatePlanValidation struct {
	Name       string `validate:"required,min=3,max=255"`
	Slug       string `validate:"required,alphanum_hyphen,min=3,max=255"`
	ProductID  int64  `validate:"required,min=1"`
	IntervalID int64  `validate:"required,min=1"`
}

type UpdatePlanValidation struct {
	ID         int64  `validate:"required,min=1"`
	Name       string `validate:"required,min=3,max=255"`
	Slug       string `validate:"required,alphanum_hyphen,min=3,max=255"`
	IntervalID int64  `validate:"required,min=1"`
}

// Plan Price validation
type CreatePlanPriceValidation struct {
	PlanID     int64 `validate:"required,min=1"`
	CurrencyID int64 `validate:"required,min=1"`
	Price      int32 `validate:"min=0"`
}

type UpdatePlanPriceValidation struct {
	ID    int64 `validate:"required,min=1"`
	Price int32 `validate:"min=0"`
}

// Plan Meter validation
type CreatePlanMeterValidation struct {
	Name string `validate:"required,min=3,max=255"`
}

type UpdatePlanMeterValidation struct {
	ID   int64  `validate:"required,min=1"`
	Name string `validate:"required,min=3,max=255"`
}
