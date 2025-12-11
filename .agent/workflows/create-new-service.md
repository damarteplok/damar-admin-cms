---
description: Create a new microservice in the platform
---

# Create New Service Workflow

## 1. Generate Service Scaffold

// turbo
Run the service generator from project root:
```bash
go run tools/create_service.go -name {service_name}
```

This scaffolds the full Clean Architecture directory structure:
```
services/{service-name}-service/
├── cmd/
│   ├── main.go                     # Entry point & dependency injection
│   └── migrate/                    # Database migrations
│       └── migrations/
├── internal/
│   ├── domain/                     # Interfaces only
│   ├── service/                    # Business logic
│   └── infrastructure/
│       ├── repository/             # Data access
│       ├── events/                 # AMQP publishers/consumers
│       └── grpc/                   # gRPC server handlers
├── pkg/
│   └── types/
│       ├── validation.go           # Request validation structs
│       └── *.go                    # Other exported types
└── README.md                       # Architecture documentation
```

## 2. Define Proto Contract

Create proto file in `/proto/{service-name}/{service-name}.proto`:
- Define service interface with RPC methods
- Define request/response messages
- Follow naming conventions (PascalCase for messages)

## 3. Generate Proto Code

// turbo
```bash
make proto
```

## 4. Implement Clean Architecture Layers

### a. Domain Layer (`internal/domain/`)
Define interfaces:
- Repository interface for data access
- Service interface for business operations

### b. Service Layer (`internal/service/`)
Implement business logic:
- Implement domain service interface
- Use repository interface for data access
- Add business validation logic

### c. Repository Layer (`internal/infrastructure/repository/`)
Implement data access:
- Implement domain repository interface
- Handle database operations
- Use proper error handling

### d. gRPC Handler (`internal/infrastructure/grpc/`)
Implement gRPC server:
- Implement proto-generated service interface
- Add request validation
- Call service layer methods
- Map errors to gRPC status codes

## 5. Create Database Migrations

If service needs database:
```bash
make migrate-create service={service_name} name=initial_schema
```

Edit migration files in `cmd/migrate/migrations/`:
- `*.up.sql`: Schema creation
- `*.down.sql`: Rollback logic

## 6. Update API Gateway (if needed)

If service should be exposed via GraphQL:

### a. Update GraphQL Schema
Edit `services/api-gateway/graph/schema.graphqls`

### b. Generate Resolvers
```bash
cd services/api-gateway && go run github.com/99designs/gqlgen generate
```

### c. Implement Resolvers
Edit `services/api-gateway/graph/schema.resolvers.go`

## 7. Configure Deployment

### a. Add to Tiltfile
Edit `Tiltfile` in project root to include new service

### b. Add Kubernetes Manifests (if production-ready)
Create manifests in `infra/production/k8s/{service-name}-service/`

## 8. Add Environment Variables

Document required env vars in service README and configure:
- Use `shared/env/` helpers for config
- Add to `.env` files for local development
- Update Kubernetes ConfigMaps/Secrets for production

## 9. Test Service

// turbo
Start the stack:
```bash
tilt up
```

Test service endpoints and integration with other services.

## Architecture Guidelines

- **Domain Layer**: Business interfaces and contracts (no implementations)
- **Service Layer**: Business logic implementation
- **Infrastructure Layer**: External integrations (gRPC, AMQP, databases)
- **Public Types**: Shareable models in `pkg/types/`

## Communication Patterns

- **gRPC**: For synchronous inter-service communication
- **AMQP/RabbitMQ**: For asynchronous events
  - Define routing keys in `shared/contracts/amqp.go`
  - Use `AmqpMessage` structure with `OwnerID` and `Data`

## Best Practices

- Consult generated `README.md` in service directory for architecture details
- Use layered validation strategy
- Return structured errors using `contracts.APIError`
- Implement retry logic for transient failures using `shared/retry/`
- Pass context through all layers
- Mock domain interfaces for unit tests
