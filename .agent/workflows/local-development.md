---
description: Start and manage local development environment
---

# Local Development Workflow

## Start Development Stack

// turbo-all

### 1. Start All Services

From project root:
```bash
tilt up
```

This starts:
- All Go microservices (auto-reload on code changes)
- PostgreSQL database
- RabbitMQ message queue
- API Gateway
- Frontend (TanStack Start)

### 2. Access Tilt Dashboard

Open browser to: `http://localhost:10350`

The dashboard shows:
- Service status and logs
- Build progress
- Resource health checks

## View Logs

### All Services
Use Tilt UI at `http://localhost:10350`

### Specific Service
In Tilt UI, click on service name to view its logs

### CLI Log Viewing
```bash
tilt logs {service-name}
```

## Stop Development Stack

### Graceful Shutdown
Press `Ctrl+C` in terminal running `tilt up`

Or:
```bash
tilt down
```

### Force Stop and Clean
```bash
tilt down --delete-namespaces
```

## Access Services

### API Gateway (GraphQL)
- URL: `http://localhost:8080/graphql`
- GraphQL Playground: `http://localhost:8080/`

### Frontend
- URL: `http://localhost:3000`

### RabbitMQ Management UI
- URL: `http://localhost:15672`
- Default credentials: guest/guest

### PostgreSQL
- Host: localhost
- Port: 5432
- Credentials: Check `.env` or Tiltfile

## Development Best Practices

### 1. Auto-Reload on Changes

Tilt watches for file changes and automatically:
- Rebuilds Go services
- Restarts containers
- Hot-reloads frontend

### 2. Debugging

Add debug logging:
```go
import "log"

log.Printf("Debug: %+v", yourVariable)
```

Check logs in Tilt UI

### 3. Proto Changes

When you modify `.proto` files:

// turbo
```bash
make proto
```

Tilt will detect generated file changes and rebuild affected services

### 4. GraphQL Changes

When you modify `schema.graphqls`:

```bash
cd services/api-gateway
go run github.com/99designs/gqlgen generate
```

Tilt will rebuild API Gateway

### 5. Database Migrations

Apply migrations while Tilt is running:

```bash
make migrate-up service={service_name}
```

No need to restart services

## Troubleshooting

### Services Won't Start

1. Check Tilt UI for error messages
2. Ensure ports are not already in use:
   ```bash
   lsof -i :8080  # API Gateway
   lsof -i :5432  # PostgreSQL
   lsof -i :5672  # RabbitMQ
   ```
3. Clean and restart:
   ```bash
   tilt down
   tilt up
   ```

### Database Connection Issues

Check environment variables in service:
```go
dbHost := env.GetString("DB_HOST", "localhost")
```

Verify PostgreSQL is running in Tilt UI

### Message Queue Issues

Check RabbitMQ Management UI: `http://localhost:15672`
- Verify queues are created
- Check for dead letter messages

### Build Failures

1. Check Tilt UI for build logs
2. Verify Go modules:
   ```bash
   go mod tidy
   ```
3. Clear build cache:
   ```bash
   tilt down
   docker system prune -f
   tilt up
   ```

## Environment Configuration

### Local Environment Variables

Edit `.env` files or use `shared/env/` helpers:

```go
import "github.com/damarteplok/damar-admin-cms/shared/env"

dbHost := env.GetString("DB_HOST", "localhost")
port := env.GetInt("PORT", 8080)
debug := env.GetBool("DEBUG", false)
```

### Override Defaults

Create `.env.local` (gitignored) for local overrides

## Testing Inter-Service Communication

### gRPC Testing

Services communicate via gRPC. Test with:
- API Gateway GraphQL queries
- Direct gRPC clients (for debugging)

### Event Testing

Test AMQP events:
1. Trigger event in one service
2. Check RabbitMQ UI for message routing
3. Verify consumer services process events

Routing keys defined in: `shared/contracts/amqp.go`

## Performance Monitoring

- Monitor service resource usage in Tilt UI
- Check for memory leaks or CPU spikes
- Verify database query performance

## Multi-Tenancy Testing

Test tenant isolation:
1. Create multiple tenant contexts
2. Verify data separation
3. Check authorization boundaries

Use `OwnerID` in AMQP messages for tenant context
