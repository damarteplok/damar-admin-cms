---
description: Generate protobuf code from .proto files
---

# Proto Generation Workflow

## Generate All Proto Files

// turbo

From project root:
```bash
make proto
```

This generates:
- `.pb.go` files (message definitions)
- `_grpc.pb.go` files (gRPC service interfaces)

Output location: `/shared/proto/{service}/`

## Proto File Structure

Proto files are located in `/proto/{service-name}/`:

```
proto/
├── auth/
│   └── auth.proto
├── user/
│   └── user.proto
├── product/
│   └── product.proto
└── ...
```

## Proto Definition Best Practices

### 1. Service Definition

```protobuf
syntax = "proto3";

package user;
option go_package = "github.com/damarteplok/damar-admin-cms/shared/proto/user";

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
}
```

### 2. Message Naming

- Use PascalCase: `GetUserRequest`, `UserResponse`
- Request messages: `{Action}{Entity}Request`
- Response messages: `{Action}{Entity}Response`
- Keep field names consistent with GraphQL schema

### 3. Field Numbering

- Never reuse field numbers (even after deletion)
- Reserve deleted field numbers:
  ```protobuf
  message User {
    reserved 2, 15, 9 to 11;
    reserved "old_field";
  }
  ```

### 4. Optional vs Required

Use `optional` for nullable fields:
```protobuf
message User {
  string id = 1;
  string email = 2;
  optional string avatar_url = 3;
}
```

### 5. Repeated Fields

For arrays/lists:
```protobuf
message GetUsersResponse {
  repeated User users = 1;
  int32 total = 2;
}
```

## Common Proto Patterns

### Pagination

```protobuf
message ListRequest {
  int32 page = 1;
  int32 per_page = 2;
}

message ListResponse {
  repeated Item items = 1;
  int32 total = 2;
  int32 page = 3;
  int32 per_page = 4;
}
```

### Timestamps

```protobuf
import "google/protobuf/timestamp.proto";

message User {
  string id = 1;
  google.protobuf.Timestamp created_at = 2;
  google.protobuf.Timestamp updated_at = 3;
}
```

### Error Handling

```protobuf
message ErrorResponse {
  string code = 1;
  string message = 2;
}
```

## After Generation

### 1. Verify Generated Files

Check `/shared/proto/{service}/` for:
- `{service}.pb.go`
- `{service}_grpc.pb.go`

### 2. Update Service Implementation

Implement generated gRPC service interface in:
`services/{service-name}-service/internal/infrastructure/grpc/`

Example:
```go
type server struct {
    pb.UnimplementedUserServiceServer
    userService domain.UserService
}

func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.GetUserResponse, error) {
    // Implementation
}
```

### 3. Update API Gateway

If service is exposed via GraphQL:
1. Update GraphQL schema to match proto
2. Regenerate GraphQL code
3. Implement resolvers to call gRPC service

## Troubleshooting

### Proto Compilation Fails

1. Check syntax in `.proto` file
2. Verify imports are correct
3. Ensure `protoc` is installed:
   ```bash
   protoc --version
   ```

### Generated Files Not Updated

1. Clean generated files:
   ```bash
   rm -rf shared/proto/*/*.pb.go
   make proto
   ```

2. Verify Makefile proto target is correct

### Import Issues in Go Code

Update Go modules:
```bash
go mod tidy
```

## Integration with Other Workflows

After proto generation, you may need to:

1. **Update Service Implementation**
   - See: `update-service-contract.md`

2. **Update GraphQL Schema**
   - See: `graphql-generation.md`

3. **Restart Development Stack**
   - Tilt auto-detects changes, or run `tilt up`

## Proto Generation Tools

The project uses:
- `protoc` - Protocol Buffer Compiler
- `protoc-gen-go` - Go code generator
- `protoc-gen-go-grpc` - gRPC Go code generator

Install/update:
```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```
