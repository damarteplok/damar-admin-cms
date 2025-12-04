# Tiltfile for damar-admin-cms microservices
# This runs all services using local_resource (no Docker/Kubernetes)

# Load extensions
load('ext://dotenv', 'dotenv')

# Load .env file
dotenv(fn='.env')

print("""
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          🚀 damar-admin-cms Microservices Stack 🚀            ║
║                                                               ║
║  Starting all services in development mode...                 ║
║                                                               ║
║  Note: Make sure PostgreSQL and RabbitMQ are running!        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
""")

#############################################
# 1. User Service (gRPC - Port 50051)
#############################################

local_resource(
    'user-service',
    serve_cmd='cd services/user-service && go run cmd/main.go',
    serve_dir='.',
    env={'GRPC_PORT': '50051'},
    deps=[
        'services/user-service/cmd',
        'services/user-service/internal',
        'services/user-service/pkg',
        'shared/proto/user',
    ],
    readiness_probe=probe(
        period_secs=3,
        tcp_socket=tcp_socket_action(50051)
    ),
    labels=['backend', 'grpc', 'core'],
    links=[
        link('http://localhost:50051', 'gRPC Endpoint'),
    ],
)

#############################################
# 2. Auth Service (gRPC - Port 50052)
#############################################

local_resource(
    'auth-service',
    serve_cmd='cd services/auth-service && go run cmd/main.go',
    serve_dir='.',
    env={'GRPC_PORT': '50052'},
    deps=[
        'services/auth-service/cmd',
        'services/auth-service/internal',
        'services/auth-service/pkg',
        'shared/proto/auth',
    ],
    readiness_probe=probe(
        period_secs=3,
        tcp_socket=tcp_socket_action(50052)
    ),
    labels=['backend', 'grpc', 'core'],
    resource_deps=['user-service'],
    links=[
        link('http://localhost:50052', 'gRPC Endpoint'),
    ],
)

#############################################
# 3. Tenant Service (gRPC - Port 50053)
#############################################

local_resource(
    'tenant-service',
    serve_cmd='cd services/tenant-service && go run cmd/main.go',
    serve_dir='.',
    env={'GRPC_PORT': '50053'},
    deps=[
        'services/tenant-service/cmd',
        'services/tenant-service/internal',
        'services/tenant-service/pkg',
        'shared/proto/tenant',
    ],
    readiness_probe=probe(
        period_secs=3,
        tcp_socket=tcp_socket_action(50053)
    ),
    labels=['backend', 'grpc', 'core'],
    links=[
        link('http://localhost:50053', 'gRPC Endpoint'),
    ],
)

#############################################
# 4. API Gateway (GraphQL - Port 8080)
#############################################

local_resource(
    'api-gateway',
    serve_cmd='cd services/api-gateway && go run server.go',
    serve_dir='.',
    env={'PORT': '8080'},
    deps=[
        'services/api-gateway/graph',
        'services/api-gateway/internal',
        'services/api-gateway/server.go',
    ],
    readiness_probe=probe(
        period_secs=3,
        http_get=http_get_action(8080, '/'),
    ),
    labels=['frontend', 'gateway', 'core'],
    resource_deps=['auth-service', 'user-service', 'tenant-service', 'product-service'],
    links=[
        link('http://localhost:8080', 'GraphQL Playground'),
        link('http://localhost:8080/query', 'GraphQL API'),
    ],
)

#############################################
# 5. Product Service (gRPC - Port 50054)
#############################################

local_resource(
    'product-service',
    serve_cmd='cd services/product-service && go run cmd/main.go',
    serve_dir='.',
    env={'GRPC_PORT': '50054'},
    deps=[
        'services/product-service/cmd',
        'services/product-service/internal',
        'services/product-service/pkg',
        'shared/proto/product',
    ],
    readiness_probe=probe(
        period_secs=3,
        tcp_socket=tcp_socket_action(50054)
    ),
    labels=['backend', 'grpc', 'core'],
    links=[
        link('http://localhost:50054', 'gRPC Endpoint'),
    ],
)

#############################################
# 6. Billing Service (gRPC - Port 50055)
#############################################

local_resource(
    'billing-service',
    serve_cmd='cd services/billing-service && go run cmd/main.go',
    serve_dir='.',
    env={'GRPC_PORT': '50055'},
    deps=[
        'services/billing-service/cmd',
        'services/billing-service/internal',
        'services/billing-service/pkg',
    ],
    readiness_probe=probe(
        period_secs=3,
        tcp_socket=tcp_socket_action(50055)
    ),
    labels=['backend', 'grpc', 'optional'],
    auto_init=False,
)

#############################################
# 7. Notification Service (Event Consumer)
#############################################

local_resource(
    'notification-service',
    serve_cmd='cd services/notification-service && go run cmd/main.go',
    serve_dir='.',
    deps=[
        'services/notification-service/cmd',
        'services/notification-service/internal',
        'shared/amqp',
        'shared/contracts',
    ],
    labels=['backend', 'events', 'core'],
    resource_deps=['user-service'],
    auto_init=True,
    links=[
        link('http://localhost:8025', 'Mailhog Web UI'),
    ],
)

#############################################
# 8. Media Service (gRPC - Port 50056)
#############################################

local_resource(
    'media-service',
    serve_cmd='cd services/media-service && go run cmd/main.go',
    serve_dir='.',
    env={'GRPC_PORT': '50056'},
    deps=[
        'services/media-service/cmd',
        'services/media-service/internal',
        'services/media-service/pkg',
    ],
    readiness_probe=probe(
        period_secs=3,
        tcp_socket=tcp_socket_action(50056)
    ),
    labels=['backend', 'grpc', 'optional'],
    auto_init=False,
)

#############################################
# Development Tools
#############################################

# Proto generation
local_resource(
    'generate-proto',
    cmd='make proto',
    deps=['proto'],
    labels=['tools'],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
)

# GraphQL generation
local_resource(
    'generate-graphql',
    cmd='make graphql',
    deps=['services/api-gateway/graph/schema.graphqls'],
    labels=['tools'],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
)

print("""
✅ Tiltfile loaded successfully!

🎯 Core Services (auto-start):
   - user-service      : gRPC Port 50051
   - auth-service      : gRPC Port 50052
   - tenant-service    : gRPC Port 50053
   - product-service   : gRPC Port 50054
   - api-gateway       : HTTP Port 8080 (GraphQL Playground)

🔧 Optional Services (manual start via Tilt UI):
   - billing-service      : gRPC Port 50055
   - media-service        : gRPC Port 50056

🛠️  Development Tools (manual trigger):
   - generate-proto    : Generate protobuf files
   - generate-graphql  : Generate GraphQL resolvers

🌐 Quick Links:
   - GraphQL Playground: http://localhost:8080
   - Tilt UI: http://localhost:10350

⚙️  Prerequisites (must be running separately):
   - PostgreSQL on localhost:5432
   - RabbitMQ on localhost:5672 (optional, for billing/notification services)
   
📝 Configuration:
   - Copy .env.example to .env and adjust values if needed
   - All services use the same database: damar_admin_cms
   - Database credentials configured in .env file

💡 Usage:
   tilt up          - Start core services
   tilt down        - Stop all services
   tilt trigger <resource> - Manually trigger a resource
""")
