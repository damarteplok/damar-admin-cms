package graph

//go:generate go run github.com/99designs/gqlgen generate

import (
	"github.com/damarteplok/damar-admin-cms/services/api-gateway/internal/cache"
	authPb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
	mediaPb "github.com/damarteplok/damar-admin-cms/shared/proto/media"
	productPb "github.com/damarteplok/damar-admin-cms/shared/proto/product"
	tenantPb "github.com/damarteplok/damar-admin-cms/shared/proto/tenant"
	userPb "github.com/damarteplok/damar-admin-cms/shared/proto/user"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

type Resolver struct {
	AuthClient    authPb.AuthServiceClient
	UserClient    userPb.UserServiceClient
	TenantClient  tenantPb.TenantServiceClient
	ProductClient productPb.ProductServiceClient
	MediaClient   mediaPb.MediaServiceClient
	MediaCache    *cache.MediaCacheService
	MinIOEndpoint string
	MinIOBucket   string
	MinIOUseSSL   bool
}
