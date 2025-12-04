package grpc

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/product"
)

type ProductHandler struct {
	pb.UnimplementedProductServiceServer
	productService                     domain.ProductService
	planService                        domain.PlanService
	planPriceService                   domain.PlanPriceService
	planMeterService                   domain.PlanMeterService
	discountService                    domain.DiscountService
	discountCodeService                domain.DiscountCodeService
	discountCodeRedemptionService      domain.DiscountCodeRedemptionService
	discountPlanService                domain.DiscountPlanService
	discountOneTimeProductService      domain.DiscountOneTimeProductService
	discountPaymentProviderDataService domain.DiscountPaymentProviderDataService
}

func NewProductHandler(
	productService domain.ProductService,
	planService domain.PlanService,
	planPriceService domain.PlanPriceService,
	planMeterService domain.PlanMeterService,
	discountService domain.DiscountService,
	discountCodeService domain.DiscountCodeService,
	discountCodeRedemptionService domain.DiscountCodeRedemptionService,
	discountPlanService domain.DiscountPlanService,
	discountOneTimeProductService domain.DiscountOneTimeProductService,
	discountPaymentProviderDataService domain.DiscountPaymentProviderDataService,
) *ProductHandler {
	return &ProductHandler{
		productService:                     productService,
		planService:                        planService,
		planPriceService:                   planPriceService,
		planMeterService:                   planMeterService,
		discountService:                    discountService,
		discountCodeService:                discountCodeService,
		discountCodeRedemptionService:      discountCodeRedemptionService,
		discountPlanService:                discountPlanService,
		discountOneTimeProductService:      discountOneTimeProductService,
		discountPaymentProviderDataService: discountPaymentProviderDataService,
	}
}

// Product operations

func (h *ProductHandler) GetProductByID(ctx context.Context, req *pb.GetProductByIDRequest) (*pb.GetProductByIDResponse, error) {
	product, err := h.productService.GetByID(ctx, req.Id)
	if err != nil {
		return &pb.GetProductByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetProductByIDResponse{
		Success: true,
		Message: "Product retrieved successfully",
		Data:    domainProductToPb(product),
	}, nil
}

func (h *ProductHandler) GetProductBySlug(ctx context.Context, req *pb.GetProductBySlugRequest) (*pb.GetProductBySlugResponse, error) {
	product, err := h.productService.GetBySlug(ctx, req.Slug)
	if err != nil {
		return &pb.GetProductBySlugResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetProductBySlugResponse{
		Success: true,
		Message: "Product retrieved successfully",
		Data:    domainProductToPb(product),
	}, nil
}

func (h *ProductHandler) CreateProduct(ctx context.Context, req *pb.CreateProductRequest) (*pb.CreateProductResponse, error) {
	metadata := make(map[string]interface{})
	if req.Metadata != "" {
		json.Unmarshal([]byte(req.Metadata), &metadata)
	}

	features := make(map[string]interface{})
	if req.Features != "" {
		json.Unmarshal([]byte(req.Features), &features)
	}

	product := &domain.Product{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		Metadata:    metadata,
		Features:    features,
		IsPopular:   req.IsPopular,
		IsDefault:   req.IsDefault,
	}

	err := h.productService.Create(ctx, product)
	if err != nil {
		return &pb.CreateProductResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreateProductResponse{
		Success: true,
		Message: "Product created successfully",
		Data:    domainProductToPb(product),
	}, nil
}

func (h *ProductHandler) UpdateProduct(ctx context.Context, req *pb.UpdateProductRequest) (*pb.UpdateProductResponse, error) {
	metadata := make(map[string]interface{})
	if req.Metadata != "" {
		json.Unmarshal([]byte(req.Metadata), &metadata)
	}

	features := make(map[string]interface{})
	if req.Features != "" {
		json.Unmarshal([]byte(req.Features), &features)
	}

	product := &domain.Product{
		ID:          req.Id,
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		Metadata:    metadata,
		Features:    features,
		IsPopular:   req.IsPopular,
		IsDefault:   req.IsDefault,
	}

	err := h.productService.Update(ctx, product)
	if err != nil {
		return &pb.UpdateProductResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateProductResponse{
		Success: true,
		Message: "Product updated successfully",
		Data:    domainProductToPb(product),
	}, nil
}

func (h *ProductHandler) DeleteProduct(ctx context.Context, req *pb.DeleteProductRequest) (*pb.DeleteProductResponse, error) {
	err := h.productService.Delete(ctx, req.Id)
	if err != nil {
		return &pb.DeleteProductResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteProductResponse{
		Success: true,
		Message: "Product deleted successfully",
	}, nil
}

func (h *ProductHandler) GetAllProducts(ctx context.Context, req *pb.GetAllProductsRequest) (*pb.GetAllProductsResponse, error) {
	page := int(req.Page)
	perPage := int(req.PerPage)
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}

	products, total, err := h.productService.GetAll(ctx, page, perPage)
	if err != nil {
		return &pb.GetAllProductsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbProducts := make([]*pb.Product, len(products))
	for i, product := range products {
		pbProducts[i] = domainProductToPb(product)
	}

	return &pb.GetAllProductsResponse{
		Success: true,
		Message: "Products retrieved successfully",
		Data: &pb.GetAllProductsData{
			Products: pbProducts,
			Total:    int32(total),
			Page:     int32(page),
			PerPage:  int32(perPage),
		},
	}, nil
}

// Plan operations

func (h *ProductHandler) GetPlanByID(ctx context.Context, req *pb.GetPlanByIDRequest) (*pb.GetPlanByIDResponse, error) {
	plan, err := h.planService.GetByID(ctx, req.Id)
	if err != nil {
		return &pb.GetPlanByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetPlanByIDResponse{
		Success: true,
		Message: "Plan retrieved successfully",
		Data:    domainPlanToPb(plan),
	}, nil
}

func (h *ProductHandler) GetPlanBySlug(ctx context.Context, req *pb.GetPlanBySlugRequest) (*pb.GetPlanBySlugResponse, error) {
	plan, err := h.planService.GetBySlug(ctx, req.Slug)
	if err != nil {
		return &pb.GetPlanBySlugResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetPlanBySlugResponse{
		Success: true,
		Message: "Plan retrieved successfully",
		Data:    domainPlanToPb(plan),
	}, nil
}

func (h *ProductHandler) GetPlansByProduct(ctx context.Context, req *pb.GetPlansByProductRequest) (*pb.GetPlansByProductResponse, error) {
	plans, err := h.planService.GetByProduct(ctx, req.ProductId)
	if err != nil {
		return &pb.GetPlansByProductResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbPlans := make([]*pb.Plan, len(plans))
	for i, plan := range plans {
		pbPlans[i] = domainPlanToPb(plan)
	}

	return &pb.GetPlansByProductResponse{
		Success: true,
		Message: "Plans retrieved successfully",
		Data:    pbPlans,
	}, nil
}

func (h *ProductHandler) CreatePlan(ctx context.Context, req *pb.CreatePlanRequest) (*pb.CreatePlanResponse, error) {
	plan := &domain.Plan{
		Name:               req.Name,
		Slug:               req.Slug,
		IntervalID:         req.IntervalId,
		ProductID:          req.ProductId,
		IsActive:           req.IsActive,
		HasTrial:           req.HasTrial,
		TrialIntervalID:    req.TrialIntervalId,
		IntervalCount:      req.IntervalCount,
		TrialIntervalCount: req.TrialIntervalCount,
		Description:        req.Description,
		Type:               req.Type,
		MaxUsersPerTenant:  req.MaxUsersPerTenant,
		MeterID:            req.MeterId, // now *int64 from proto
		IsVisible:          req.IsVisible,
	}

	err := h.planService.Create(ctx, plan)
	if err != nil {
		return &pb.CreatePlanResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreatePlanResponse{
		Success: true,
		Message: "Plan created successfully",
		Data:    domainPlanToPb(plan),
	}, nil
}

func (h *ProductHandler) UpdatePlan(ctx context.Context, req *pb.UpdatePlanRequest) (*pb.UpdatePlanResponse, error) {
	// First, fetch existing plan to preserve product_id and other fields
	existingPlan, err := h.planService.GetByID(ctx, req.Id)
	if err != nil {
		return &pb.UpdatePlanResponse{
			Success: false,
			Message: fmt.Sprintf("Plan not found: %v", err),
		}, nil
	}

	// Update only the fields provided in the request
	plan := &domain.Plan{
		ID:                 req.Id,
		Name:               req.Name,
		Slug:               req.Slug,
		IntervalID:         req.IntervalId,
		ProductID:          existingPlan.ProductID, // Keep existing product_id
		IsActive:           req.IsActive,
		HasTrial:           req.HasTrial,
		TrialIntervalID:    req.TrialIntervalId,
		IntervalCount:      req.IntervalCount,
		TrialIntervalCount: req.TrialIntervalCount,
		Description:        req.Description,
		Type:               req.Type,
		MaxUsersPerTenant:  req.MaxUsersPerTenant,
		MeterID:            req.MeterId, // now *int64 from proto
		IsVisible:          req.IsVisible,
	}

	err = h.planService.Update(ctx, plan)
	if err != nil {
		return &pb.UpdatePlanResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdatePlanResponse{
		Success: true,
		Message: "Plan updated successfully",
		Data:    domainPlanToPb(plan),
	}, nil
}

func (h *ProductHandler) DeletePlan(ctx context.Context, req *pb.DeletePlanRequest) (*pb.DeletePlanResponse, error) {
	err := h.planService.Delete(ctx, req.Id)
	if err != nil {
		return &pb.DeletePlanResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeletePlanResponse{
		Success: true,
		Message: "Plan deleted successfully",
	}, nil
}

func (h *ProductHandler) GetAllPlans(ctx context.Context, req *pb.GetAllPlansRequest) (*pb.GetAllPlansResponse, error) {
	page := int(req.Page)
	perPage := int(req.PerPage)
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}

	plans, total, err := h.planService.GetAll(ctx, page, perPage, req.ActiveOnly, req.VisibleOnly)
	if err != nil {
		return &pb.GetAllPlansResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbPlans := make([]*pb.Plan, len(plans))
	for i, plan := range plans {
		pbPlans[i] = domainPlanToPb(plan)
	}

	return &pb.GetAllPlansResponse{
		Success: true,
		Message: "Plans retrieved successfully",
		Data: &pb.GetAllPlansData{
			Plans:   pbPlans,
			Total:   int32(total),
			Page:    int32(page),
			PerPage: int32(perPage),
		},
	}, nil
}

// Plan Price operations

func (h *ProductHandler) GetPlanPrice(ctx context.Context, req *pb.GetPlanPriceRequest) (*pb.GetPlanPriceResponse, error) {
	planPrice, err := h.planPriceService.GetByID(ctx, req.Id)
	if err != nil {
		return &pb.GetPlanPriceResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetPlanPriceResponse{
		Success: true,
		Message: "Plan price retrieved successfully",
		Data:    domainPlanPriceToPb(planPrice),
	}, nil
}

func (h *ProductHandler) GetPlanPricesByPlan(ctx context.Context, req *pb.GetPlanPricesByPlanRequest) (*pb.GetPlanPricesByPlanResponse, error) {
	planPrices, err := h.planPriceService.GetByPlan(ctx, req.PlanId)
	if err != nil {
		return &pb.GetPlanPricesByPlanResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbPlanPrices := make([]*pb.PlanPrice, len(planPrices))
	for i, planPrice := range planPrices {
		pbPlanPrices[i] = domainPlanPriceToPb(planPrice)
	}

	return &pb.GetPlanPricesByPlanResponse{
		Success: true,
		Message: "Plan prices retrieved successfully",
		Data:    pbPlanPrices,
	}, nil
}

func (h *ProductHandler) CreatePlanPrice(ctx context.Context, req *pb.CreatePlanPriceRequest) (*pb.CreatePlanPriceResponse, error) {
	tiers := make(map[string]interface{})
	if req.Tiers != "" {
		json.Unmarshal([]byte(req.Tiers), &tiers)
	}

	planPrice := &domain.PlanPrice{
		PlanID:       req.PlanId,
		CurrencyID:   req.CurrencyId,
		Price:        req.Price,
		PricePerUnit: req.PricePerUnit,
		Type:         req.Type,
		Tiers:        tiers,
	}

	err := h.planPriceService.Create(ctx, planPrice)
	if err != nil {
		return &pb.CreatePlanPriceResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreatePlanPriceResponse{
		Success: true,
		Message: "Plan price created successfully",
		Data:    domainPlanPriceToPb(planPrice),
	}, nil
}

func (h *ProductHandler) UpdatePlanPrice(ctx context.Context, req *pb.UpdatePlanPriceRequest) (*pb.UpdatePlanPriceResponse, error) {
	tiers := make(map[string]interface{})
	if req.Tiers != "" {
		json.Unmarshal([]byte(req.Tiers), &tiers)
	}

	planPrice := &domain.PlanPrice{
		ID:           req.Id,
		Price:        req.Price,
		PricePerUnit: req.PricePerUnit,
		Type:         req.Type,
		Tiers:        tiers,
	}

	err := h.planPriceService.Update(ctx, planPrice)
	if err != nil {
		return &pb.UpdatePlanPriceResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdatePlanPriceResponse{
		Success: true,
		Message: "Plan price updated successfully",
		Data:    domainPlanPriceToPb(planPrice),
	}, nil
}

func (h *ProductHandler) DeletePlanPrice(ctx context.Context, req *pb.DeletePlanPriceRequest) (*pb.DeletePlanPriceResponse, error) {
	err := h.planPriceService.Delete(ctx, req.Id)
	if err != nil {
		return &pb.DeletePlanPriceResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeletePlanPriceResponse{
		Success: true,
		Message: "Plan price deleted successfully",
	}, nil
}

// Plan Meter operations

func (h *ProductHandler) GetPlanMeterByID(ctx context.Context, req *pb.GetPlanMeterByIDRequest) (*pb.GetPlanMeterByIDResponse, error) {
	planMeter, err := h.planMeterService.GetByID(ctx, req.Id)
	if err != nil {
		return &pb.GetPlanMeterByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetPlanMeterByIDResponse{
		Success: true,
		Message: "Plan meter retrieved successfully",
		Data:    domainPlanMeterToPb(planMeter),
	}, nil
}

func (h *ProductHandler) GetAllPlanMeters(ctx context.Context, req *pb.GetAllPlanMetersRequest) (*pb.GetAllPlanMetersResponse, error) {
	page := int(req.Page)
	perPage := int(req.PerPage)
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}

	meters, total, err := h.planMeterService.GetAll(ctx, page, perPage)
	if err != nil {
		return &pb.GetAllPlanMetersResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbMeters := make([]*pb.PlanMeter, len(meters))
	for i, meter := range meters {
		pbMeters[i] = domainPlanMeterToPb(meter)
	}

	return &pb.GetAllPlanMetersResponse{
		Success: true,
		Message: "Plan meters retrieved successfully",
		Data: &pb.GetAllPlanMetersData{
			Meters:  pbMeters,
			Total:   int32(total),
			Page:    int32(page),
			PerPage: int32(perPage),
		},
	}, nil
}

func (h *ProductHandler) CreatePlanMeter(ctx context.Context, req *pb.CreatePlanMeterRequest) (*pb.CreatePlanMeterResponse, error) {
	planMeter := &domain.PlanMeter{
		Name: req.Name,
	}

	err := h.planMeterService.Create(ctx, planMeter)
	if err != nil {
		return &pb.CreatePlanMeterResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreatePlanMeterResponse{
		Success: true,
		Message: "Plan meter created successfully",
		Data:    domainPlanMeterToPb(planMeter),
	}, nil
}

func (h *ProductHandler) UpdatePlanMeter(ctx context.Context, req *pb.UpdatePlanMeterRequest) (*pb.UpdatePlanMeterResponse, error) {
	planMeter := &domain.PlanMeter{
		ID:   req.Id,
		Name: req.Name,
	}

	err := h.planMeterService.Update(ctx, planMeter)
	if err != nil {
		return &pb.UpdatePlanMeterResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdatePlanMeterResponse{
		Success: true,
		Message: "Plan meter updated successfully",
		Data:    domainPlanMeterToPb(planMeter),
	}, nil
}

func (h *ProductHandler) DeletePlanMeter(ctx context.Context, req *pb.DeletePlanMeterRequest) (*pb.DeletePlanMeterResponse, error) {
	err := h.planMeterService.Delete(ctx, req.Id)
	if err != nil {
		return &pb.DeletePlanMeterResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeletePlanMeterResponse{
		Success: true,
		Message: "Plan meter deleted successfully",
	}, nil
}

// Helper functions to convert domain to proto

func domainProductToPb(product *domain.Product) *pb.Product {
	metadataJSON, _ := json.Marshal(product.Metadata)
	featuresJSON, _ := json.Marshal(product.Features)

	return &pb.Product{
		Id:          product.ID,
		Name:        product.Name,
		Slug:        product.Slug,
		Description: product.Description,
		Metadata:    string(metadataJSON),
		Features:    string(featuresJSON),
		IsPopular:   product.IsPopular,
		IsDefault:   product.IsDefault,
		CreatedAt:   product.CreatedAt.Unix(),
		UpdatedAt:   product.UpdatedAt.Unix(),
	}
}

func domainPlanToPb(plan *domain.Plan) *pb.Plan {
	return &pb.Plan{
		Id:                 plan.ID,
		Name:               plan.Name,
		Slug:               plan.Slug,
		IntervalId:         plan.IntervalID,
		ProductId:          plan.ProductID,
		IsActive:           plan.IsActive,
		HasTrial:           plan.HasTrial,
		TrialIntervalId:    plan.TrialIntervalID,
		IntervalCount:      plan.IntervalCount,
		TrialIntervalCount: plan.TrialIntervalCount,
		Description:        plan.Description,
		Type:               plan.Type,
		MaxUsersPerTenant:  plan.MaxUsersPerTenant,
		MeterId:            plan.MeterID, // now *int64, proto handles it correctly
		IsVisible:          plan.IsVisible,
		CreatedAt:          plan.CreatedAt.Unix(),
		UpdatedAt:          plan.UpdatedAt.Unix(),
	}
}

func domainPlanPriceToPb(planPrice *domain.PlanPrice) *pb.PlanPrice {
	tiersJSON, _ := json.Marshal(planPrice.Tiers)

	return &pb.PlanPrice{
		Id:           planPrice.ID,
		PlanId:       planPrice.PlanID,
		CurrencyId:   planPrice.CurrencyID,
		Price:        planPrice.Price,
		PricePerUnit: planPrice.PricePerUnit,
		Type:         planPrice.Type,
		Tiers:        string(tiersJSON),
		CreatedAt:    planPrice.CreatedAt.Unix(),
		UpdatedAt:    planPrice.UpdatedAt.Unix(),
	}
}

func domainPlanMeterToPb(planMeter *domain.PlanMeter) *pb.PlanMeter {
	return &pb.PlanMeter{
		Id:        planMeter.ID,
		Name:      planMeter.Name,
		CreatedAt: planMeter.CreatedAt.Unix(),
		UpdatedAt: planMeter.UpdatedAt.Unix(),
	}
}
