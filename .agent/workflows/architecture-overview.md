---
description: Project architecture and design patterns overview
---

# Project Architecture Overview

## Project Vision

**damar-admin-cms** is a **multi-tenant SaaS admin platform** - a modern, Go-based port of SaaSyKit (Laravel). It provides comprehensive tenant management, user administration, product catalogs, subscription handling, and billing operations through a unified admin interface.

## Key Objectives

- **Multi-Tenancy**: Isolate data and operations per tenant with proper authorization
- **Scalability**: Microservices architecture allowing independent scaling and deployment
- **Modularity**: Each business domain operates as an independent service
- **API Gateway Pattern**: Single entry point via GraphQL API Gateway
- **Cloud-Native**: Kubernetes-ready with Tiltfile orchestration for local development

## Technology Stack

### Backend
- **Language**: Go 1.25.1
- **Architecture**: Microservices with Clean Architecture
- **Communication**: gRPC inter-service communication
- **API Layer**: GraphQL API Gateway
- **Database**: PostgreSQL (schema mirrors SaaSyKit/Laravel)
- **Message Queue**: RabbitMQ (AMQP)

### Frontend
- **Framework**: TanStack Start
- **Architecture**: Micro-frontend
- **Location**: `web/` directory
- **Communication**: GraphQL queries to API Gateway

### Infrastructure
- **Orchestration**: Kubernetes (`infra/production/k8s/`)
- **Development**: Tiltfile for local stack
- **Containers**: Docker

## Microservices Architecture

### Service List

Each service follows Clean Architecture with domain, service, and infrastructure layers:

- **auth-service**: Authentication & authorization
- **user-service**: User management
- **product-service**: Product catalog, plans, pricing, discounts
- **subscription-service**: Subscription lifecycle management
- **billing-service**: Payment & billing
- **media-service**: File/media handling
- **notification-service**: Notifications (email, push, etc.)
- **tenant-service**: Multi-tenancy support
- **api-gateway**: GraphQL request routing & aggregation

### Service Architecture

Each service implements Clean Architecture with three layers:

```
services/{service-name}-service/
├── internal/
│   ├── domain/          # Business interfaces (contracts)
│   │   ├── repository.go
│   │   └── service.go
│   ├── service/         # Business logic implementation
│   │   └── {service}_service.go
│   └── infrastructure/  # External integrations
│       ├── repository/  # Database access
│       ├── grpc/        # gRPC handlers
│       └── events/      # AMQP publishers/consumers
```

**Important**: Each service has its own `README.md` explaining its specific architecture, layer responsibilities, and patterns. Always consult `services/{service-name}-service/README.md` for detailed information.

## Communication Patterns

### 1. Primary: gRPC (Synchronous)

- Real-time inter-service communication
- Protocol Buffers for type safety
- Implementations in `internal/infrastructure/grpc/`
- Proto definitions in `/proto/{service}/`

### 2. Secondary: AMQP/RabbitMQ (Asynchronous)

Event-driven architecture for decoupled operations:

**Event Routing Keys** (defined in `shared/contracts/amqp.go`):
- `trip.event.*`: Trip lifecycle events
- `payment.event.success`: Payment completed
- `payment.event.failed`: Payment failed
- `driver.cmd.*`: Driver commands
- `payment.cmd.*`: Payment operation commands

**Message Structure**:
```go
type AmqpMessage struct {
    OwnerID string      // Tenant/user context
    Data    interface{} // Event payload
}
```

### 3. GraphQL API Gateway

- **Single entry point** for all client requests
- GraphQL resolvers orchestrate gRPC calls to backend services
- Enforces tenant isolation and authorization
- Location: `services/api-gateway/`

### 4. HTTP API (Legacy/Internal)

Standard REST response format:
```go
type APIResponse struct {
    Data  any       `json:"data,omitempty"`
    Error *APIError `json:"error,omitempty"`
}
```

## Code Organization

### Shared Code

- `shared/contracts/`: API & AMQP message structures
- `shared/env/`: Environment variable helpers
- `shared/retry/`: Exponential backoff retry logic
- `shared/validation/`: Validation utilities
- `shared/proto/`: Generated protobuf code
- `shared/database/`: Database connection helpers
- `shared/util/`: Utility functions

### Service Structure

```
services/{service-name}-service/
├── cmd/
│   ├── main.go                    # Entry point & DI
│   └── migrate/migrations/        # Database migrations
├── internal/
│   ├── domain/                    # Interfaces only
│   ├── service/                   # Business logic
│   └── infrastructure/
│       ├── repository/            # Data access
│       ├── grpc/                  # gRPC handlers
│       └── events/                # AMQP handlers
├── pkg/types/
│   ├── validation.go              # Request validation
│   └── *.go                       # Exported types
└── README.md                      # Service architecture docs
```

## Development Patterns

### Validation Strategy

**Layered validation** with go-playground/validator:

1. **Input Validation** (gRPC Layer)
   - Validate request structure and field formats
   - Use validation structs from `pkg/types/validation.go`
   - Return early with validation errors

2. **Business Validation** (Service Layer)
   - Validate business rules (uniqueness, existence, constraints)
   - Use repository to check constraints
   - Return domain-specific errors

### Error Handling

- Use structured errors: `contracts.APIError{Code, Message}`
- Map gRPC errors to appropriate status codes
- Use retry logic for transient failures: `retry.WithBackoff()`

### Context Propagation

- Pass `context.Context` through all layers
- Enables cancellation, deadlines, and trace IDs
- Essential for multi-tenant isolation

### Multi-Tenancy

- `tenant-service` manages tenant isolation
- All services respect tenant boundaries
- `OwnerID` in AMQP messages represents tenant context
- API Gateway enforces tenant authorization

## Data Management

### Database Strategy

- PostgreSQL database mirrors SaaSyKit schema
- Each service owns its database tables
- **No cross-service direct database access** (use gRPC or events)
- Migrations managed per-service

### Repository Pattern

- Domain layer defines repository interfaces
- Infrastructure layer implements data access
- No business logic in repositories
- Mock interfaces for unit testing

## Infrastructure

### Local Development
```bash
tilt up  # Starts entire stack
```

Includes:
- All microservices with auto-reload
- PostgreSQL database
- RabbitMQ message queue
- API Gateway
- Frontend development server

### Production Deployment

- Kubernetes manifests in `infra/production/k8s/`
- Each service independently scalable
- Frontend separate build/deployment pipeline

## Design Decisions

### Why Discounts in Product Service?

Discounts are consolidated into product-service (not separate service) because:
- Tightly coupled with products and plans (junction tables)
- Reduces distributed transaction complexity
- Improves checkout performance
- Better data cohesion

### Why GraphQL API Gateway?

- Single entry point simplifies client integration
- Flexible queries reduce over-fetching
- Aggregates multiple gRPC calls efficiently
- Centralized authorization and tenant isolation

### Why Clean Architecture?

- Clear separation of concerns
- Business logic independent of frameworks
- Easy to test (mock interfaces)
- Flexible to change implementations

## Getting Started

1. **Understand the architecture**: Read this document and service READMEs
2. **Set up local environment**: Run `tilt up` (see `local-development.md`)
3. **Explore services**: Check `ls -1 services/` for all services
4. **Make changes**: Follow workflows in `.agent/workflows/`
5. **Test integration**: Use GraphQL Playground at `http://localhost:8080/`

## Key Commands

```bash
# Start development stack
tilt up

# Generate proto code
make proto

# Create new service
go run tools/create_service.go -name {service_name}

# Create migration
make migrate-create service={service} name={description}

# Run migrations
make migrate-up service={service}
```

## Additional Resources

- Individual service architecture: `services/{service-name}-service/README.md`
- Workflows: `.agent/workflows/*.md`
- Proto definitions: `/proto/{service}/`
- GraphQL schema: `services/api-gateway/graph/schema.graphqls`
