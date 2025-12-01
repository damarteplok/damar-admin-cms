# Development with Tilt

This guide explains how to run the entire `damar-admin-cms` microservices stack using [Tilt](https://tilt.dev/).

## Prerequisites

1. **Install Tilt**: Follow the [official installation guide](https://docs.tilt.dev/install.html)

   ```bash
   # macOS
   brew install tilt-dev/tap/tilt

   # Linux
   curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
   ```

2. **Install Docker**: Required for PostgreSQL and RabbitMQ containers

   - [Docker Desktop](https://www.docker.com/products/docker-desktop)

3. **Install Go**: Version 1.25.1 or higher

   ```bash
   brew install go
   ```

4. **Install golang-migrate**: For database migrations

   ```bash
   brew install golang-migrate
   ```

5. **Install protoc**: For protocol buffer compilation (if needed)

   ```bash
   brew install protobuf
   ```

6. **Install gqlgen**: For GraphQL code generation
   ```bash
   go install github.com/99designs/gqlgen@latest
   ```

## Quick Start

### 1. Start All Services

From the project root directory:

```bash
tilt up
```

This will:

- Start PostgreSQL (port 5432)
- Start RabbitMQ (ports 5672, 15672)
- Start user-service (gRPC port 50051)
- Start auth-service (gRPC port 50052)
- Start api-gateway (HTTP port 8080)

### 2. Access the UI

Tilt will automatically open the web UI at http://localhost:10350 where you can:

- View service status and logs
- Trigger manual resources
- Monitor resource health

### 3. Run Database Migrations

Migrations are manual trigger resources. In the Tilt UI or via CLI:

```bash
# Trigger migration via Tilt UI (click the trigger button)
# OR via CLI:
tilt trigger migrate-user-db
tilt trigger migrate-auth-db
```

Or run directly via make:

```bash
make migrate-up service=user

make migrate-up service=auth
```

### 4. Access Services

- **GraphQL Playground**: http://localhost:8080
- **GraphQL API Endpoint**: http://localhost:8080/query
- **RabbitMQ Management**: http://localhost:15672 (user: guest, pass: guest)

## Service Architecture

### Auto-Start Services (Essential)

These services start automatically:

| Service      | Type          | Port        | Description                 |
| ------------ | ------------- | ----------- | --------------------------- |
| postgres-db  | Database      | 5432        | PostgreSQL database         |
| rabbitmq     | Message Queue | 5672, 15672 | RabbitMQ with management UI |
| user-service | gRPC          | 50051       | User management service     |
| auth-service | gRPC          | 50052       | Authentication service      |
| api-gateway  | HTTP          | 8080        | GraphQL API Gateway         |

### Manual Services (Optional)

These services require manual start (click service name in Tilt UI to enable):

| Service              | Type | Port  | Description             |
| -------------------- | ---- | ----- | ----------------------- |
| product-service      | gRPC | 50053 | Product catalog service |
| billing-service      | gRPC | 50054 | Billing and payments    |
| notification-service | gRPC | 50055 | Notification handling   |
| media-service        | gRPC | 50056 | Media file management   |
| tenant-service       | gRPC | 50057 | Multi-tenancy support   |

To enable optional services, set `auto_init=True` in the Tiltfile or click the service in the UI.

## Development Workflow

### Making Code Changes

Tilt watches for file changes and automatically rebuilds/restarts services when:

- Go source files in `services/*/cmd/`, `services/*/internal/`, or `services/*/pkg/` change
- Proto files in `shared/proto/` change
- GraphQL schema files change

### Manual Triggers

Some operations are manual-trigger only:

```bash
# Generate protocol buffers
tilt trigger generate-proto
# OR
make proto

# Generate GraphQL code
tilt trigger generate-graphql
# OR
make graphql
```

### Viewing Logs

In the Tilt UI:

1. Click on a service name
2. View real-time logs in the right panel
3. Filter logs by severity or search

Via CLI:

```bash
# View logs for a specific service
tilt logs user-service

# Follow logs
tilt logs -f api-gateway
```

### Stopping Services

```bash
# Stop all services
tilt down

# Stop Tilt but keep services running
tilt down --delete-namespaces=false
```

## Service Dependencies

```mermaid
graph TD
    A[PostgreSQL] --> B[user-service]
    A --> C[auth-service]
    B --> C
    C --> D[api-gateway]
    B --> D
    E[RabbitMQ] --> F[billing-service]
    E --> G[notification-service]
```

- **auth-service** depends on **user-service** (makes gRPC calls)
- **api-gateway** depends on **auth-service** and **user-service**
- **billing-service** and **notification-service** depend on **RabbitMQ**

## Environment Variables

All environment variables are set in the Tiltfile `serve_cmd`. Default values:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=damar_admin_cms_{service}

# Services
USER_SERVICE_ADDR=localhost:50051
AUTH_SERVICE_ADDR=localhost:50052

# Auth
JWT_SECRET=dev-secret-key-change-in-production

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

## Troubleshooting

### Port Already in Use

If a port is already in use:

```bash
# Find and kill process using port 8080
lsof -ti:8080 | xargs kill -9
```

### Database Connection Failed

1. Check PostgreSQL is running:

   ```bash
   docker ps | grep postgres
   ```

2. Verify database exists:

   ```bash
   PGPASSWORD=postgres psql -h localhost -U postgres -l
   ```

### Service Won't Start

1. Check service logs in Tilt UI
2. Verify all dependencies are running
3. Check for compilation errors:
   ```bash
   cd services/user-service
   go build ./...
   ```

### Clear and Restart

```bash
tilt down
docker rm -f $(docker ps -aq)  # Remove all containers
tilt up
```

## Tips and Best Practices

### Filtering Resources

In the Tilt UI, use labels to filter:

- `infrastructure`: Database and message queue
- `backend`: gRPC services
- `frontend`: API Gateway
- `grpc`: All gRPC services
- `tools`: Development tools
- `migrations`: Database migrations

### Watching Specific Services

```bash
# Only start specific services
tilt up user-service auth-service api-gateway
```

### Resource Status

- 🟢 **Green**: Service is healthy
- 🟡 **Yellow**: Service is starting/updating
- 🔴 **Red**: Service has errors
- ⚪ **Gray**: Service is disabled (auto_init=False)

### Performance Tips

1. **Reduce rebuild scope**: Tilt only rebuilds services when their specific deps change
2. **Use .tiltignore**: Already configured to skip test files, docs, etc.
3. **Disable unused services**: Set `auto_init=False` for services you don't need

## Additional Commands

```bash
# Check Tilt version
tilt version

# Validate Tiltfile syntax
tilt ci

# Get help
tilt help

# List all resources
tilt get all

# Describe a resource
tilt describe user-service
```

## Next Steps

- Read [Tilt documentation](https://docs.tilt.dev/) for advanced features
- Customize `Tiltfile` for your workflow
- Add more services as needed
- Set up remote development with Tilt Cloud (optional)

## Support

For issues with Tilt setup, check:

1. Tilt UI logs (http://localhost:10350)
2. Service-specific logs in `tilt logs <service-name>`
3. Project documentation in `/docs`
