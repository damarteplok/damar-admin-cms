package grpc

// Discount RPC handlers implementation
// This file contains all discount-related RPC methods

import (
	"context"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/product"
)

// GetDiscountByID retrieves a discount by ID
func (h *ProductHandler) GetDiscountByID(ctx context.Context, req *pb.GetDiscountByIDRequest) (*pb.GetDiscountByIDResponse, error) {
	discount, err := h.discountService.GetByID(ctx, req.Id)
	if err != nil {
		return &pb.GetDiscountByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetDiscountByIDResponse{
		Success: true,
		Message: "Discount retrieved successfully",
		Data:    domainDiscountToPb(discount),
	}, nil
}

// GetDiscountByCode retrieves a discount by code
func (h *ProductHandler) GetDiscountByCode(ctx context.Context, req *pb.GetDiscountByCodeRequest) (*pb.GetDiscountByCodeResponse, error) {
	code, err := h.discountCodeService.GetByCode(ctx, req.Code)
	if err != nil {
		return &pb.GetDiscountByCodeResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	discount, err := h.discountService.GetByID(ctx, code.DiscountID)
	if err != nil {
		return &pb.GetDiscountByCodeResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetDiscountByCodeResponse{
		Success: true,
		Message: "Discount retrieved successfully",
		Data:    domainDiscountToPb(discount),
	}, nil
}

// CreateDiscount creates a new discount
func (h *ProductHandler) CreateDiscount(ctx context.Context, req *pb.CreateDiscountRequest) (*pb.CreateDiscountResponse, error) {
	// Set default redeem_type if not provided (database constraint: NOT NULL DEFAULT 1)
	redeemType := req.RedeemType
	if redeemType == nil {
		defaultRedeemType := int32(1)
		redeemType = &defaultRedeemType
	}

	discount := &domain.Discount{
		Name:                           req.Name,
		Description:                    req.Description,
		Type:                           req.Type,
		Amount:                         req.Amount,
		IsActive:                       req.IsActive,
		ActionType:                     req.ActionType,
		ValidUntil:                     nil,
		MaxRedemptions:                 req.MaxRedemptions,
		MaxRedemptionsPerUser:          req.MaxRedemptionsPerUser,
		Redemptions:                    0,
		IsRecurring:                    req.IsRecurring,
		DurationInMonths:               req.DurationInMonths,
		MaximumRecurringIntervals:      req.MaximumRecurringIntervals,
		RedeemType:                     redeemType,
		BonusDays:                      req.BonusDays,
		IsEnabledForAllPlans:           req.IsEnabledForAllPlans,
		IsEnabledForAllOneTimeProducts: req.IsEnabledForAllOneTimeProducts,
	}

	if req.ValidUntil != nil {
		validUntil := time.Unix(*req.ValidUntil, 0)
		discount.ValidUntil = &validUntil
	}

	err := h.discountService.Create(ctx, discount)
	if err != nil {
		return &pb.CreateDiscountResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreateDiscountResponse{
		Success: true,
		Message: "Discount created successfully",
		Data:    domainDiscountToPb(discount),
	}, nil
}

// UpdateDiscount updates an existing discount
func (h *ProductHandler) UpdateDiscount(ctx context.Context, req *pb.UpdateDiscountRequest) (*pb.UpdateDiscountResponse, error) {
	// Set default redeem_type if not provided (database constraint: NOT NULL DEFAULT 1)
	redeemType := req.RedeemType
	if redeemType == nil {
		defaultRedeemType := int32(1)
		redeemType = &defaultRedeemType
	}

	discount := &domain.Discount{
		ID:                             req.Id,
		Name:                           req.Name,
		Description:                    req.Description,
		Type:                           req.Type,
		Amount:                         req.Amount,
		IsActive:                       req.IsActive,
		ActionType:                     req.ActionType,
		ValidUntil:                     nil,
		MaxRedemptions:                 req.MaxRedemptions,
		MaxRedemptionsPerUser:          req.MaxRedemptionsPerUser,
		IsRecurring:                    req.IsRecurring,
		DurationInMonths:               req.DurationInMonths,
		MaximumRecurringIntervals:      req.MaximumRecurringIntervals,
		RedeemType:                     redeemType,
		BonusDays:                      req.BonusDays,
		IsEnabledForAllPlans:           req.IsEnabledForAllPlans,
		IsEnabledForAllOneTimeProducts: req.IsEnabledForAllOneTimeProducts,
	}

	if req.ValidUntil != nil {
		validUntil := time.Unix(*req.ValidUntil, 0)
		discount.ValidUntil = &validUntil
	}

	err := h.discountService.Update(ctx, discount)
	if err != nil {
		return &pb.UpdateDiscountResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateDiscountResponse{
		Success: true,
		Message: "Discount updated successfully",
		Data:    domainDiscountToPb(discount),
	}, nil
}

// DeleteDiscount deletes a discount
func (h *ProductHandler) DeleteDiscount(ctx context.Context, req *pb.DeleteDiscountRequest) (*pb.DeleteDiscountResponse, error) {
	err := h.discountService.Delete(ctx, req.Id)
	if err != nil {
		return &pb.DeleteDiscountResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteDiscountResponse{
		Success: true,
		Message: "Discount deleted successfully",
	}, nil
}

// GetAllDiscounts retrieves all discounts with pagination
func (h *ProductHandler) GetAllDiscounts(ctx context.Context, req *pb.GetAllDiscountsRequest) (*pb.GetAllDiscountsResponse, error) {
	discounts, total, err := h.discountService.GetAll(ctx, int(req.Page), int(req.PerPage), req.ActiveOnly, req.Search, req.SortBy, req.SortOrder)
	if err != nil {
		return &pb.GetAllDiscountsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbDiscounts := make([]*pb.Discount, len(discounts))
	for i, discount := range discounts {
		pbDiscounts[i] = domainDiscountToPb(discount)
	}

	return &pb.GetAllDiscountsResponse{
		Success: true,
		Message: "Discounts retrieved successfully",
		Data: &pb.GetAllDiscountsData{
			Discounts: pbDiscounts,
			Total:     int32(total),
			Page:      req.Page,
			PerPage:   req.PerPage,
		},
	}, nil
}

// Discount Code operations

// GetDiscountCodeByID retrieves a discount code by ID
func (h *ProductHandler) GetDiscountCodeByID(ctx context.Context, req *pb.GetDiscountCodeByIDRequest) (*pb.GetDiscountCodeByIDResponse, error) {
	code, err := h.discountCodeService.GetByID(ctx, req.Id)
	if err != nil {
		return &pb.GetDiscountCodeByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetDiscountCodeByIDResponse{
		Success: true,
		Message: "Discount code retrieved successfully",
		Data:    domainDiscountCodeToPb(code),
	}, nil
}

// GetDiscountCodeByCode retrieves and validates a discount code
func (h *ProductHandler) GetDiscountCodeByCode(ctx context.Context, req *pb.GetDiscountCodeByCodeRequest) (*pb.GetDiscountCodeByCodeResponse, error) {
	code, err := h.discountCodeService.GetByCode(ctx, req.Code)
	if err != nil {
		return &pb.GetDiscountCodeByCodeResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	// Validate code
	valid, msg, err := h.discountCodeService.ValidateCode(ctx, code.Code)
	if err != nil {
		return &pb.GetDiscountCodeByCodeResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	if !valid {
		return &pb.GetDiscountCodeByCodeResponse{
			Success: false,
			Message: msg,
		}, nil
	}

	return &pb.GetDiscountCodeByCodeResponse{
		Success: true,
		Message: "Valid discount code",
		Data:    domainDiscountCodeToPb(code),
	}, nil
}

// GetDiscountCodesByDiscount retrieves all codes for a discount
func (h *ProductHandler) GetDiscountCodesByDiscount(ctx context.Context, req *pb.GetDiscountCodesByDiscountRequest) (*pb.GetDiscountCodesByDiscountResponse, error) {
	codes, err := h.discountCodeService.GetByDiscount(ctx, req.DiscountId)
	if err != nil {
		return &pb.GetDiscountCodesByDiscountResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbCodes := make([]*pb.DiscountCode, len(codes))
	for i, code := range codes {
		pbCodes[i] = domainDiscountCodeToPb(code)
	}

	return &pb.GetDiscountCodesByDiscountResponse{
		Success: true,
		Message: "Discount codes retrieved successfully",
		Data:    pbCodes,
	}, nil
}

// CreateDiscountCode creates a new discount code
func (h *ProductHandler) CreateDiscountCode(ctx context.Context, req *pb.CreateDiscountCodeRequest) (*pb.CreateDiscountCodeResponse, error) {
	code := &domain.DiscountCode{
		DiscountID: req.DiscountId,
		Code:       req.Code,
		ValidFrom:  nil,
		ValidUntil: nil,
		MaxUses:    nil,
		TimesUsed:  0,
		IsActive:   true,
	}

	err := h.discountCodeService.Create(ctx, code)
	if err != nil {
		return &pb.CreateDiscountCodeResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreateDiscountCodeResponse{
		Success: true,
		Message: "Discount code created successfully",
		Data:    domainDiscountCodeToPb(code),
	}, nil
}

// DeleteDiscountCode deletes a discount code
func (h *ProductHandler) DeleteDiscountCode(ctx context.Context, req *pb.DeleteDiscountCodeRequest) (*pb.DeleteDiscountCodeResponse, error) {
	err := h.discountCodeService.Delete(ctx, req.Id)
	if err != nil {
		return &pb.DeleteDiscountCodeResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteDiscountCodeResponse{
		Success: true,
		Message: "Discount code deleted successfully",
	}, nil
}

// Discount Plan operations

// AddPlanToDiscount adds a plan to a discount
func (h *ProductHandler) AddPlanToDiscount(ctx context.Context, req *pb.AddPlanToDiscountRequest) (*pb.AddPlanToDiscountResponse, error) {
	err := h.discountPlanService.AddPlanToDiscount(ctx, req.DiscountId, req.PlanId)
	if err != nil {
		return &pb.AddPlanToDiscountResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.AddPlanToDiscountResponse{
		Success: true,
		Message: "Plan added to discount successfully",
	}, nil
}

// RemovePlanFromDiscount removes a plan from a discount
func (h *ProductHandler) RemovePlanFromDiscount(ctx context.Context, req *pb.RemovePlanFromDiscountRequest) (*pb.RemovePlanFromDiscountResponse, error) {
	err := h.discountPlanService.RemovePlanFromDiscount(ctx, req.DiscountId, req.PlanId)
	if err != nil {
		return &pb.RemovePlanFromDiscountResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RemovePlanFromDiscountResponse{
		Success: true,
		Message: "Plan removed from discount successfully",
	}, nil
}

// GetPlansByDiscount retrieves all plans for a discount
func (h *ProductHandler) GetPlansByDiscount(ctx context.Context, req *pb.GetPlansByDiscountRequest) (*pb.GetPlansByDiscountResponse, error) {
	discountPlans, err := h.discountPlanService.GetByDiscount(ctx, req.DiscountId)
	if err != nil {
		return &pb.GetPlansByDiscountResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	planIDs := make([]int64, len(discountPlans))
	for i, dp := range discountPlans {
		planIDs[i] = dp.PlanID
	}

	return &pb.GetPlansByDiscountResponse{
		Success: true,
		Message: "Plans retrieved successfully",
		PlanIds: planIDs,
	}, nil
}

// Discount One Time Product operations

// AddOneTimeProductToDiscount adds a product to a discount
func (h *ProductHandler) AddOneTimeProductToDiscount(ctx context.Context, req *pb.AddOneTimeProductToDiscountRequest) (*pb.AddOneTimeProductToDiscountResponse, error) {
	err := h.discountOneTimeProductService.AddProductToDiscount(ctx, req.DiscountId, req.OneTimeProductId)
	if err != nil {
		return &pb.AddOneTimeProductToDiscountResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.AddOneTimeProductToDiscountResponse{
		Success: true,
		Message: "Product added to discount successfully",
	}, nil
}

// RemoveOneTimeProductFromDiscount removes a product from a discount
func (h *ProductHandler) RemoveOneTimeProductFromDiscount(ctx context.Context, req *pb.RemoveOneTimeProductFromDiscountRequest) (*pb.RemoveOneTimeProductFromDiscountResponse, error) {
	err := h.discountOneTimeProductService.RemoveProductFromDiscount(ctx, req.DiscountId, req.OneTimeProductId)
	if err != nil {
		return &pb.RemoveOneTimeProductFromDiscountResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RemoveOneTimeProductFromDiscountResponse{
		Success: true,
		Message: "Product removed from discount successfully",
	}, nil
}

// GetOneTimeProductsByDiscount retrieves all products for a discount
func (h *ProductHandler) GetOneTimeProductsByDiscount(ctx context.Context, req *pb.GetOneTimeProductsByDiscountRequest) (*pb.GetOneTimeProductsByDiscountResponse, error) {
	discountProducts, err := h.discountOneTimeProductService.GetByDiscount(ctx, req.DiscountId)
	if err != nil {
		return &pb.GetOneTimeProductsByDiscountResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	productIDs := make([]int64, len(discountProducts))
	for i, dp := range discountProducts {
		productIDs[i] = dp.ProductID
	}

	return &pb.GetOneTimeProductsByDiscountResponse{
		Success:           true,
		Message:           "Products retrieved successfully",
		OneTimeProductIds: productIDs,
	}, nil
}

// Discount Payment Provider Data operations
// Note: Proto uses different field names than domain (payment_provider_id vs Provider)
// We'll need to map these appropriately or update proto/domain to match

// GetDiscountPaymentProviderData retrieves payment provider data
func (h *ProductHandler) GetDiscountPaymentProviderData(ctx context.Context, req *pb.GetDiscountPaymentProviderDataRequest) (*pb.GetDiscountPaymentProviderDataResponse, error) {
	data, err := h.discountPaymentProviderDataService.GetByDiscountAndProvider(ctx, req.DiscountId, req.PaymentProviderId)
	if err != nil {
		return &pb.GetDiscountPaymentProviderDataResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetDiscountPaymentProviderDataResponse{
		Success: true,
		Message: "Payment provider data retrieved successfully",
		Data:    domainDiscountPaymentProviderDataToPb(data),
	}, nil
}

func (h *ProductHandler) CreateDiscountPaymentProviderData(ctx context.Context, req *pb.CreateDiscountPaymentProviderDataRequest) (*pb.CreateDiscountPaymentProviderDataResponse, error) {
	data := &domain.DiscountPaymentProviderData{
		DiscountID:                req.DiscountId,
		PaymentProviderID:         req.PaymentProviderId,
		PaymentProviderDiscountID: req.PaymentProviderDiscountId,
	}

	err := h.discountPaymentProviderDataService.Create(ctx, data)
	if err != nil {
		return &pb.CreateDiscountPaymentProviderDataResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreateDiscountPaymentProviderDataResponse{
		Success: true,
		Message: "Payment provider data created successfully",
		Data:    domainDiscountPaymentProviderDataToPb(data),
	}, nil
}

// UpdateDiscountPaymentProviderData updates payment provider data
func (h *ProductHandler) UpdateDiscountPaymentProviderData(ctx context.Context, req *pb.UpdateDiscountPaymentProviderDataRequest) (*pb.UpdateDiscountPaymentProviderDataResponse, error) {
	data, err := h.discountPaymentProviderDataService.GetByID(ctx, req.Id)
	if err != nil {
		return &pb.UpdateDiscountPaymentProviderDataResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	// Only update payment_provider_discount_id (coupon ID in external system)
	data.PaymentProviderDiscountID = req.PaymentProviderDiscountId

	err = h.discountPaymentProviderDataService.Update(ctx, data)
	if err != nil {
		return &pb.UpdateDiscountPaymentProviderDataResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateDiscountPaymentProviderDataResponse{
		Success: true,
		Message: "Payment provider data updated successfully",
		Data:    domainDiscountPaymentProviderDataToPb(data),
	}, nil
}

// DeleteDiscountPaymentProviderData deletes payment provider data
func (h *ProductHandler) DeleteDiscountPaymentProviderData(ctx context.Context, req *pb.DeleteDiscountPaymentProviderDataRequest) (*pb.DeleteDiscountPaymentProviderDataResponse, error) {
	err := h.discountPaymentProviderDataService.Delete(ctx, req.Id)
	if err != nil {
		return &pb.DeleteDiscountPaymentProviderDataResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteDiscountPaymentProviderDataResponse{
		Success: true,
		Message: "Payment provider data deleted successfully",
	}, nil
}

// Helper functions for discount conversions

func domainDiscountToPb(discount *domain.Discount) *pb.Discount {
	pbDiscount := &pb.Discount{
		Id:                             discount.ID,
		Name:                           discount.Name,
		Description:                    discount.Description,
		Type:                           discount.Type,
		Amount:                         discount.Amount,
		ValidUntil:                     nil,
		IsActive:                       discount.IsActive,
		ActionType:                     discount.ActionType,
		MaxRedemptions:                 discount.MaxRedemptions,
		MaxRedemptionsPerUser:          discount.MaxRedemptionsPerUser,
		Redemptions:                    discount.Redemptions,
		IsRecurring:                    discount.IsRecurring,
		DurationInMonths:               discount.DurationInMonths,
		MaximumRecurringIntervals:      discount.MaximumRecurringIntervals,
		RedeemType:                     discount.RedeemType,
		BonusDays:                      discount.BonusDays,
		IsEnabledForAllPlans:           discount.IsEnabledForAllPlans,
		IsEnabledForAllOneTimeProducts: discount.IsEnabledForAllOneTimeProducts,
		CreatedAt:                      discount.CreatedAt.Unix(),
		UpdatedAt:                      discount.UpdatedAt.Unix(),
	}

	if discount.ValidUntil != nil {
		validUntil := discount.ValidUntil.Unix()
		pbDiscount.ValidUntil = &validUntil
	}

	return pbDiscount
}

func domainDiscountCodeToPb(code *domain.DiscountCode) *pb.DiscountCode {
	return &pb.DiscountCode{
		Id:         code.ID,
		Code:       code.Code,
		DiscountId: code.DiscountID,
		CreatedAt:  code.CreatedAt.Unix(),
		UpdatedAt:  code.UpdatedAt.Unix(),
	}
}

func domainDiscountPaymentProviderDataToPb(data *domain.DiscountPaymentProviderData) *pb.DiscountPaymentProviderData {
	return &pb.DiscountPaymentProviderData{
		Id:                        data.ID,
		DiscountId:                data.DiscountID,
		PaymentProviderId:         data.PaymentProviderID,
		PaymentProviderDiscountId: data.PaymentProviderDiscountID,
		CreatedAt:                 data.CreatedAt.Unix(),
		UpdatedAt:                 data.UpdatedAt.Unix(),
	}
}
