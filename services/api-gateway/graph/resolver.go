package graph

//go:generate go run github.com/99designs/gqlgen generate

import (
	authPb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
	tenantPb "github.com/damarteplok/damar-admin-cms/shared/proto/tenant"
	userPb "github.com/damarteplok/damar-admin-cms/shared/proto/user"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

type Resolver struct {
	AuthClient   authPb.AuthServiceClient
	UserClient   userPb.UserServiceClient
	TenantClient tenantPb.TenantServiceClient
}
