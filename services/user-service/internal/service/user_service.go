package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/user-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/shared/amqp"
	"github.com/damarteplok/damar-admin-cms/shared/contracts"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo      domain.UserRepository
	publisher *amqp.Publisher
}

func NewUserService(repo domain.UserRepository, publisher *amqp.Publisher) domain.UserService {
	return &UserService{
		repo:      repo,
		publisher: publisher,
	}
}

func (s *UserService) GetUserByID(ctx context.Context, id int64) (*domain.User, error) {
	// Input validation is handled at gRPC layer
	return s.repo.GetByID(ctx, id)
}

func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	// Input validation is handled at gRPC layer
	return s.repo.GetByEmail(ctx, email)
}

func (s *UserService) CreateUser(ctx context.Context, user *domain.User) (*domain.User, error) {
	// Input validation is handled at gRPC layer

	// Business validation: Check if email already exists
	existing, _ := s.repo.GetByEmail(ctx, user.Email)
	if existing != nil {
		return nil, errors.New("email already registered")
	}

	// Business logic: Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}
	user.PasswordHash = string(hashedPassword)

	// Create user in database
	createdUser, err := s.repo.Create(ctx, user)
	if err != nil {
		return nil, err
	}

	// Publish user.registered event to RabbitMQ
	if s.publisher != nil {
		eventData := map[string]interface{}{
			"user_id": createdUser.ID,
			"name":    createdUser.Name,
			"email":   createdUser.Email,
		}
		dataBytes, _ := json.Marshal(eventData)
		message := contracts.AmqpMessage{
			OwnerID: fmt.Sprintf("%d", createdUser.ID),
			Data:    dataBytes,
		}

		if err := s.publisher.Publish(ctx, contracts.UserEventRegistered, message); err != nil {
			// Log error but don't fail the user creation
			logger.Error("Failed to publish user.registered event",
				zap.Int64("user_id", createdUser.ID),
				zap.Error(err))
		} else {
			logger.Info("Published user.registered event",
				zap.Int64("user_id", createdUser.ID),
				zap.String("email", createdUser.Email))
		}
	}

	return createdUser, nil
}

func (s *UserService) UpdateUser(ctx context.Context, user *domain.User) (*domain.User, error) {
	// Input validation is handled at gRPC layer

	// Business validation: Check if user exists
	existing, err := s.repo.GetByID(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	if existing == nil {
		return nil, errors.New("user not found")
	}

	return s.repo.Update(ctx, user)
}

func (s *UserService) GetAllUsers(ctx context.Context, page, perPage int) ([]*domain.User, int64, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}
	return s.repo.GetAll(ctx, page, perPage)
}

func (s *UserService) DeleteUser(ctx context.Context, id int64) error {
	// Input validation is handled at gRPC layer

	// Business validation: Check if user exists before deleting
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}
	if existing == nil {
		return errors.New("user not found")
	}

	return s.repo.Delete(ctx, id)
}

func (s *UserService) SearchUsers(ctx context.Context, query string, page, perPage int) ([]*domain.User, int64, error) {
	// Input validation is handled at gRPC layer

	// Normalize pagination
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}

	return s.repo.Search(ctx, query, page, perPage)
}

func (s *UserService) BulkDeleteUsers(ctx context.Context, ids []int64) (int32, error) {
	// Input validation is handled at gRPC layer
	return s.repo.BulkDelete(ctx, ids)
}

func (s *UserService) BulkBlockUsers(ctx context.Context, ids []int64, isBlocked bool) (int32, error) {
	// Input validation is handled at gRPC layer
	return s.repo.BulkUpdateBlockStatus(ctx, ids, isBlocked)
}

func (s *UserService) UpdateEmailVerification(ctx context.Context, userID int64, verified bool) error {
	// Input validation is handled at gRPC layer

	// Business validation: Check if user exists
	existing, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}
	if existing == nil {
		return errors.New("user not found")
	}

	return s.repo.UpdateEmailVerification(ctx, userID, verified)
}

func (s *UserService) UpdatePassword(ctx context.Context, userID int64, passwordHash string) error {
	// Input validation is handled at gRPC layer

	// Business validation: Check if user exists
	existing, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}
	if existing == nil {
		return errors.New("user not found")
	}

	// Validate password hash is not empty
	if passwordHash == "" {
		return errors.New("password hash cannot be empty")
	}

	return s.repo.UpdatePasswordHash(ctx, userID, passwordHash)
}
