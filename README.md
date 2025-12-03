# damar-admin-cms

Multi-tenant SaaS admin platform built with Go microservices architecture and GraphQL API Gateway.

## 🚀 Quick Start

### Prerequisites

- Go 1.25.1+
- PostgreSQL 16
- Tilt (for development)

### Setup

1. **Clone repository**

   ```bash
   git clone https://github.com/damarteplok/damar-admin-cms.git
   cd damar-admin-cms
   ```

2. **Create database**

   ```bash
   createdb -U damarhuda damar_admin_cms
   ```

3. **Copy environment file**

   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

4. **Run migrations**

   ```bash
   make migrate-up
   ```

5. **Start all services**

   ```bash
   tilt up
   ```

6. **Access GraphQL Playground**
   - Open http://localhost:8080/
   - Or http://localhost:8080/playground
   - Or http://localhost:8080/graphql

## 📚 Documentation

- **[GraphQL API Testing Guide](docs/GRAPHQL_TESTING.md)** - Complete guide dengan contoh queries & mutations yang bisa langsung copas
- **[Tilt Development Guide](docs/TILT.md)** - Detailed guide untuk development dengan Tilt

## 🏗️ Architecture

### Microservices

- **api-gateway** (8080) - GraphQL API Gateway
- **auth-service** (50052) - Authentication & Authorization
- **user-service** (50051) - User Management
- **product-service** (50053) - Product Catalog
- **billing-service** (50054) - Billing & Payments
- **notification-service** (50055) - Notifications
- **media-service** (50056) - Media Management
- **tenant-service** (50057) - Multi-tenancy

### Technology Stack

- **Backend**: Go 1.25.1
- **API**: GraphQL (gqlgen)
- **Communication**: gRPC, AMQP (RabbitMQ)
- **Database**: PostgreSQL
- **Development**: Tilt

## 🛠️ Development

### Available Commands

```bash
# Database migrations (centralized in shared/database/migrations)
make migrate-up                     # Run all pending migrations
make migrate-down                   # Rollback last migration
make migrate-status                 # Show current migration version
make migrate-force version=N        # Force to specific version
make migration name=description     # Create new migration

# Database management
make create-db                      # Create database
make drop-db                        # Drop database

# Code generation
make proto          # Generate all protobuf files
make proto-auth     # Generate auth proto only
make proto-user     # Generate user proto only
make graphql        # Generate GraphQL resolvers

# Development
tilt up             # Start all services
tilt down           # Stop all services
```

### Project Structure

```
.
├── services/           # Microservices
│   ├── api-gateway/   # GraphQL API Gateway
│   ├── auth-service/  # Authentication service
│   ├── user-service/  # User management service
│   └── .../           # Other services
├── shared/            # Shared code
│   ├── proto/         # Generated protobuf files
│   ├── contracts/     # API contracts
│   ├── database/      # Database utilities
│   └── .../           # Other shared utilities
├── proto/             # Proto definitions
├── docs/              # Documentation
├── Tiltfile           # Tilt configuration
└── Makefile           # Build commands
```

## 🧪 Testing GraphQL API

### 1. Register User

```graphql
mutation {
  createUser(
    input: {
      name: "John Doe"
      email: "john@example.com"
      password: "Password123!"
    }
  ) {
    success
    data {
      id
      email
    }
  }
}
```

### 2. Login

```graphql
mutation {
  login(input: { email: "john@example.com", password: "Password123!" }) {
    success
    data {
      accessToken
      refreshToken
      user {
        id
        name
        email
      }
    }
  }
}
```

### 3. Get Current User (with Auth)

Add Authorization header:

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

Query:

```graphql
query {
  me {
    success
    data {
      id
      name
      email
    }
  }
}
```

**📖 Untuk complete testing guide dengan semua queries & mutations, lihat [GraphQL Testing Guide](docs/GRAPHQL_TESTING.md)**

## 🔐 Environment Variables

Configure in `.env` file:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=damarhuda
DB_PASSWORD=password
DB_NAME=damar_admin_cms

# Services
USER_SERVICE_ADDR=localhost:50051
AUTH_SERVICE_ADDR=localhost:50052

# Auth
JWT_SECRET=your-secret-key

# RabbitMQ (optional)
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

## 📦 Service Ports

| Service              | Port  | Type | Status     |
| -------------------- | ----- | ---- | ---------- |
| api-gateway          | 8080  | HTTP | Auto-start |
| user-service         | 50051 | gRPC | Auto-start |
| auth-service         | 50052 | gRPC | Auto-start |
| product-service      | 50053 | gRPC | Manual     |
| billing-service      | 50054 | gRPC | Manual     |
| notification-service | 50055 | gRPC | Manual     |
| media-service        | 50056 | gRPC | Manual     |
| tenant-service       | 50057 | gRPC | Manual     |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙋 Support

- 📖 [Documentation](docs/)
- 🐛 [Report Bug](https://github.com/damarteplok/damar-admin-cms/issues)
- 💡 [Request Feature](https://github.com/damarteplok/damar-admin-cms/issues)
