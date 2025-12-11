---
description: Generate GraphQL resolvers and models
---

# GraphQL Generation Workflow

## Generate GraphQL Code

// turbo

Navigate to API Gateway and generate:
```bash
cd services/api-gateway
go run github.com/99designs/gqlgen generate
```

This generates/updates:
- `graph/generated.go` - GraphQL execution runtime
- `graph/model/models_gen.go` - Type definitions
- Updates resolver signatures in `graph/schema.resolvers.go`

## GraphQL Schema Location

Schema file: `services/api-gateway/graph/schema.graphqls`

## Schema Definition Best Practices

### 1. Type Definitions

Keep field names consistent with proto definitions:

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  avatarUrl: String
  createdAt: Time!
  updatedAt: Time!
}
```

### 2. Queries

```graphql
type Query {
  user(id: ID!): User
  users(page: Int, perPage: Int): UserConnection!
}

type UserConnection {
  users: [User!]!
  total: Int!
  page: Int!
  perPage: Int!
}
```

### 3. Mutations

```graphql
type Mutation {
  createUser(input: CreateUserInput!): UserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UserPayload!
  deleteUser(id: ID!): DeletePayload!
}

input CreateUserInput {
  email: String!
  name: String!
  password: String!
}

type UserPayload {
  user: User
  errors: [Error!]
}
```

### 4. Custom Scalars

```graphql
scalar Time
scalar UUID
```

Configure in `gqlgen.yml`:
```yaml
models:
  Time:
    model: time.Time
  UUID:
    model: github.com/google/uuid.UUID
```

### 5. Error Handling

```graphql
type Error {
  code: String!
  message: String!
  field: String
}
```

## gqlgen Configuration

Configuration file: `services/api-gateway/gqlgen.yml`

Key settings:
```yaml
schema:
  - graph/schema.graphqls

exec:
  filename: graph/generated.go

model:
  filename: graph/model/models_gen.go

resolver:
  filename: graph/schema.resolvers.go
  type: Resolver
```

## Implement Resolvers

After generation, implement resolvers in `graph/schema.resolvers.go`:

### Query Resolver Example

```go
func (r *queryResolver) User(ctx context.Context, id string) (*model.User, error) {
    // Call gRPC backend service
    resp, err := r.userClient.GetUser(ctx, &pb.GetUserRequest{
        Id: id,
    })
    if err != nil {
        return nil, err
    }

    // Map proto response to GraphQL model
    return &model.User{
        ID:        resp.User.Id,
        Email:     resp.User.Email,
        Name:      resp.User.Name,
        AvatarURL: resp.User.AvatarUrl,
        CreatedAt: resp.User.CreatedAt.AsTime(),
        UpdatedAt: resp.User.UpdatedAt.AsTime(),
    }, nil
}
```

### Mutation Resolver Example

```go
func (r *mutationResolver) CreateUser(ctx context.Context, input model.CreateUserInput) (*model.UserPayload, error) {
    // Call gRPC backend service
    resp, err := r.userClient.CreateUser(ctx, &pb.CreateUserRequest{
        Email:    input.Email,
        Name:     input.Name,
        Password: input.Password,
    })
    if err != nil {
        // Map gRPC error to GraphQL error
        return &model.UserPayload{
            Errors: []*model.Error{
                {
                    Code:    "CREATION_FAILED",
                    Message: err.Error(),
                },
            },
        }, nil
    }

    // Map proto response to GraphQL model
    return &model.UserPayload{
        User: &model.User{
            ID:        resp.User.Id,
            Email:     resp.User.Email,
            Name:      resp.User.Name,
            CreatedAt: resp.User.CreatedAt.AsTime(),
            UpdatedAt: resp.User.UpdatedAt.AsTime(),
        },
    }, nil
}
```

## Testing GraphQL API

### 1. Start Development Stack

// turbo
```bash
tilt up
```

### 2. Access GraphQL Playground

Open browser: `http://localhost:8080/`

### 3. Example Query

```graphql
query GetUser {
  user(id: "123") {
    id
    email
    name
    createdAt
  }
}
```

### 4. Example Mutation

```graphql
mutation CreateUser {
  createUser(input: {
    email: "test@example.com"
    name: "Test User"
    password: "securepassword"
  }) {
    user {
      id
      email
      name
    }
    errors {
      code
      message
    }
  }
}
```

## Resolver Best Practices

### 1. Context Propagation

Always pass context to gRPC calls:
```go
resp, err := r.userClient.GetUser(ctx, req)
```

### 2. Error Mapping

Map gRPC errors to GraphQL errors:
```go
import "google.golang.org/grpc/codes"
import "google.golang.org/grpc/status"

if err != nil {
    st, ok := status.FromError(err)
    if ok {
        switch st.Code() {
        case codes.NotFound:
            return nil, fmt.Errorf("user not found")
        case codes.InvalidArgument:
            return nil, fmt.Errorf("invalid input: %s", st.Message())
        default:
            return nil, fmt.Errorf("internal error")
        }
    }
    return nil, err
}
```

### 3. Tenant Isolation

API Gateway enforces tenant isolation:
```go
// Extract tenant context from auth token
tenantID := getTenantFromContext(ctx)

// Pass to backend service
resp, err := r.userClient.GetUser(ctx, &pb.GetUserRequest{
    Id:       id,
    TenantId: tenantID,
})
```

### 4. Batching and DataLoader

For N+1 query problems, use dataloaders (future optimization)

## Troubleshooting

### Generation Fails

1. Check `schema.graphqls` syntax
2. Verify `gqlgen.yml` configuration
3. Run with verbose output:
   ```bash
   go run github.com/99designs/gqlgen generate --verbose
   ```

### Resolver Not Updated

- gqlgen only adds new resolvers, never removes old ones
- Manually delete unused resolvers from `schema.resolvers.go`

### Type Mismatch Errors

Ensure GraphQL types match proto message structures:
- Field names should be consistent (camelCase in GraphQL, snake_case in proto)
- Data types should be compatible

## Integration with Other Workflows

After GraphQL generation:

1. **Test Changes**
   - Development stack auto-reloads
   - Test in GraphQL Playground

2. **Update Frontend**
   - Update GraphQL queries in `web/` directory
   - Frontend uses generated types for type safety

## GraphQL Tools Used

- **gqlgen**: GraphQL server library and code generator
- **GraphQL Playground**: Interactive query tool (built-in)
