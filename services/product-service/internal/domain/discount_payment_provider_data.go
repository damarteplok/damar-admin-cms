package domain

import (
	"context"
	"time"
)

type DiscountPaymentProviderData struct {
	ID                        int64     `json:"id"`
	DiscountID                int64     `json:"discount_id"`
	PaymentProviderID         int64     `json:"payment_provider_id"`
	PaymentProviderDiscountID string    `json:"payment_provider_discount_id"`
	CreatedAt                 time.Time `json:"created_at"`
	UpdatedAt                 time.Time `json:"updated_at"`
}

type DiscountPaymentProviderDataRepository interface {
	GetByID(ctx context.Context, id int64) (*DiscountPaymentProviderData, error)
	GetByDiscount(ctx context.Context, discountID int64) ([]*DiscountPaymentProviderData, error)
	GetByDiscountAndProvider(ctx context.Context, discountID, paymentProviderID int64) (*DiscountPaymentProviderData, error)
	Create(ctx context.Context, data *DiscountPaymentProviderData) error
	Update(ctx context.Context, data *DiscountPaymentProviderData) error
	Delete(ctx context.Context, id int64) error
}

type DiscountPaymentProviderDataService interface {
	GetByID(ctx context.Context, id int64) (*DiscountPaymentProviderData, error)
	GetByDiscount(ctx context.Context, discountID int64) ([]*DiscountPaymentProviderData, error)
	GetByDiscountAndProvider(ctx context.Context, discountID, paymentProviderID int64) (*DiscountPaymentProviderData, error)
	Create(ctx context.Context, data *DiscountPaymentProviderData) error
	Update(ctx context.Context, data *DiscountPaymentProviderData) error
	Delete(ctx context.Context, id int64) error
}
