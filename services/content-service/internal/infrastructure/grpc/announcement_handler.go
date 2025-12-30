package grpc

import (
	"context"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/services/content-service/pkg/types"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/content"
	"github.com/damarteplok/damar-admin-cms/shared/validation"
)

type AnnouncementGRPCServer struct {
	service domain.AnnouncementService
	pb.UnimplementedContentServiceServer
}

func NewAnnouncementGRPCServer(service domain.AnnouncementService) *AnnouncementGRPCServer {
	return &AnnouncementGRPCServer{service: service}
}

func (s *AnnouncementGRPCServer) GetAnnouncementByID(ctx context.Context, req *pb.GetAnnouncementByIDRequest) (*pb.GetAnnouncementByIDResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.GetAnnouncementByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	announcement, err := s.service.GetAnnouncementByID(ctx, req.Id)
	if err != nil {
		return &pb.GetAnnouncementByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetAnnouncementByIDResponse{
		Success: true,
		Message: "Announcement retrieved successfully",
		Data:    domainAnnouncementToPb(announcement),
	}, nil
}

func (s *AnnouncementGRPCServer) GetAllAnnouncements(ctx context.Context, req *pb.GetAllAnnouncementsRequest) (*pb.GetAllAnnouncementsResponse, error) {
	if err := validation.ValidateStruct(&types.PaginationValidation{
		Page:    req.Page,
		PerPage: req.PerPage,
	}); err != nil {
		return &pb.GetAllAnnouncementsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	announcements, total, err := s.service.GetAllAnnouncements(
		ctx,
		int(req.Page),
		int(req.PerPage),
		req.Search,
		req.SortBy,
		req.SortOrder,
	)
	if err != nil {
		return &pb.GetAllAnnouncementsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbAnnouncements := make([]*pb.Announcement, len(announcements))
	for i, announcement := range announcements {
		pbAnnouncements[i] = domainAnnouncementToPb(announcement)
	}

	return &pb.GetAllAnnouncementsResponse{
		Success: true,
		Message: "Announcements retrieved successfully",
		Data: &pb.GetAllAnnouncementsData{
			Announcements: pbAnnouncements,
			Total:         int32(total),
			Page:          req.Page,
			PerPage:       req.PerPage,
		},
	}, nil
}

func (s *AnnouncementGRPCServer) CreateAnnouncement(ctx context.Context, req *pb.CreateAnnouncementRequest) (*pb.CreateAnnouncementResponse, error) {
	if err := validation.ValidateStruct(&types.CreateAnnouncementValidation{
		Title:   req.Title,
		Content: req.Content,
	}); err != nil {
		return &pb.CreateAnnouncementResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	announcement := &domain.Announcement{
		Title:               req.Title,
		Content:             req.Content,
		IsActive:            req.IsActive,
		IsDismissible:       req.IsDismissible,
		ShowForCustomers:    req.ShowForCustomers,
		ShowOnFrontend:      req.ShowOnFrontend,
		ShowOnUserDashboard: req.ShowOnUserDashboard,
	}

	// Convert timestamps
	if req.StartsAt > 0 {
		startsAt := time.Unix(req.StartsAt, 0)
		announcement.StartsAt = &startsAt
	}
	if req.EndsAt > 0 {
		endsAt := time.Unix(req.EndsAt, 0)
		announcement.EndsAt = &endsAt
	}

	created, err := s.service.CreateAnnouncement(ctx, announcement)
	if err != nil {
		return &pb.CreateAnnouncementResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreateAnnouncementResponse{
		Success: true,
		Message: "Announcement created successfully",
		Data:    domainAnnouncementToPb(created),
	}, nil
}

func (s *AnnouncementGRPCServer) UpdateAnnouncement(ctx context.Context, req *pb.UpdateAnnouncementRequest) (*pb.UpdateAnnouncementResponse, error) {
	if err := validation.ValidateStruct(&types.UpdateAnnouncementValidation{
		ID:      req.Id,
		Title:   req.Title,
		Content: req.Content,
	}); err != nil {
		return &pb.UpdateAnnouncementResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	announcement := &domain.Announcement{
		ID:                  req.Id,
		Title:               req.Title,
		Content:             req.Content,
		IsActive:            req.IsActive,
		IsDismissible:       req.IsDismissible,
		ShowForCustomers:    req.ShowForCustomers,
		ShowOnFrontend:      req.ShowOnFrontend,
		ShowOnUserDashboard: req.ShowOnUserDashboard,
	}

	// Convert timestamps
	if req.StartsAt > 0 {
		startsAt := time.Unix(req.StartsAt, 0)
		announcement.StartsAt = &startsAt
	}
	if req.EndsAt > 0 {
		endsAt := time.Unix(req.EndsAt, 0)
		announcement.EndsAt = &endsAt
	}

	updated, err := s.service.UpdateAnnouncement(ctx, announcement)
	if err != nil {
		return &pb.UpdateAnnouncementResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateAnnouncementResponse{
		Success: true,
		Message: "Announcement updated successfully",
		Data:    domainAnnouncementToPb(updated),
	}, nil
}

func (s *AnnouncementGRPCServer) DeleteAnnouncement(ctx context.Context, req *pb.DeleteAnnouncementRequest) (*pb.DeleteAnnouncementResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.DeleteAnnouncementResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	err := s.service.DeleteAnnouncement(ctx, req.Id)
	if err != nil {
		return &pb.DeleteAnnouncementResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteAnnouncementResponse{
		Success: true,
		Message: "Announcement deleted successfully",
	}, nil
}

func (s *AnnouncementGRPCServer) GetActiveAnnouncements(ctx context.Context, req *pb.GetActiveAnnouncementsRequest) (*pb.GetActiveAnnouncementsResponse, error) {
	announcements, err := s.service.GetActiveAnnouncements(
		ctx,
		req.ForCustomers,
		req.ForFrontend,
		req.ForUserDashboard,
	)
	if err != nil {
		return &pb.GetActiveAnnouncementsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbAnnouncements := make([]*pb.Announcement, len(announcements))
	for i, announcement := range announcements {
		pbAnnouncements[i] = domainAnnouncementToPb(announcement)
	}

	return &pb.GetActiveAnnouncementsResponse{
		Success: true,
		Message: "Active announcements retrieved successfully",
		Data:    pbAnnouncements,
	}, nil
}

// Helper function to convert domain announcement to protobuf
func domainAnnouncementToPb(announcement *domain.Announcement) *pb.Announcement {
	pbAnnouncement := &pb.Announcement{
		Id:                  announcement.ID,
		Title:               announcement.Title,
		Content:             announcement.Content,
		IsActive:            announcement.IsActive,
		IsDismissible:       announcement.IsDismissible,
		ShowForCustomers:    announcement.ShowForCustomers,
		ShowOnFrontend:      announcement.ShowOnFrontend,
		ShowOnUserDashboard: announcement.ShowOnUserDashboard,
	}

	if announcement.StartsAt != nil {
		pbAnnouncement.StartsAt = announcement.StartsAt.Unix()
	}
	if announcement.EndsAt != nil {
		pbAnnouncement.EndsAt = announcement.EndsAt.Unix()
	}
	if announcement.CreatedAt != nil {
		pbAnnouncement.CreatedAt = announcement.CreatedAt.Unix()
	}
	if announcement.UpdatedAt != nil {
		pbAnnouncement.UpdatedAt = announcement.UpdatedAt.Unix()
	}

	return pbAnnouncement
}
