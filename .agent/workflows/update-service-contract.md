---
description: Update service contract (proto -> gRPC -> GraphQL)
---

# Update Service Contract Workflow

Follow this sequence when adding or modifying service functionality:

## 1. Update Proto Definition

Edit `.proto` files in `/proto/{service-name}/` directory:
- Add/modify RPC methods in the service definition
- Update message structures as needed
- Keep field naming consistent with GraphQL schema

## 2. Generate Proto Code

// turbo
Navigate to project root and run:
```bash
make proto
```

This generates `.pb.go` and `_grpc.pb.go` files in `/shared/proto/{service}/`

## 3. Update Service Implementation

Follow Clean Architecture layers (refer to `services/{service-name}-service/README.md`):

### a. Domain Layer
Update interfaces in `internal/domain/`:
- Repository contracts
- Service contracts

### b. Service Layer
Implement business logic in `internal/service/`:
- Use domain interfaces
- Implement business validation

### c. Repository Layer
Implement data access in `internal/infrastructure/repository/`:
- Implement domain repository interfaces
- Handle database operations

### d. gRPC Handler
Implement RPC handlers in `internal/infrastructure/grpc/`:
- Add request validation using `pkg/types/validation.go`
- Call service layer methods
- Handle error responses

Example validation:
```go
import (
    "github.com/damarteplok/damar-admin-cms/shared/validation"
    "github.com/damarteplok/damar-admin-cms/services/user-service/pkg/types"
)

validate := &types.CreateUserValidation{
    Email:    req.Email,
    Password: req.Password,
    Name:     req.Name,
}
if err := validation.ValidateStruct(validate); err != nil {
    return nil, status.Error(codes.InvalidArgument, err.Error())
}
```

### e. Validation Structs (if needed)
Add validation structs in `pkg/types/validation.go`

## 4. Update GraphQL Schema

Edit `services/api-gateway/graph/schema.graphqls`:
- Add/modify types, queries, mutations to match proto changes
- Keep field names and types consistent with proto definitions

## 5. Generate GraphQL Resolvers

// turbo
```bash
cd services/api-gateway && go run github.com/99designs/gqlgen generate
```

This updates:
- `graph/generated.go`
- `graph/model/models_gen.go`

## 6. Implement GraphQL Resolvers

Manually implement resolver methods in `services/api-gateway/graph/schema.resolvers.go`:
- Call backend gRPC services from resolvers
- Handle error mapping and response formatting
- Pass context for tracing and cancellation

## 7. Database Migrations (if schema changes)

If your changes require database schema updates:

```bash
make migrate-create service={service_name} name={description_of_change}
make migrate-up service={service_name}
```

## Important Notes

- Always check `services/{service-name}-service/README.md` for architecture details
- Use layered validation (input validation in gRPC layer, business validation in service layer)
- Return structured errors using `contracts.APIError`
- Pass `context.Context` through all layers
- Test with `tilt up` running for live reload
