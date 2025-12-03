.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make migration name=<migration_name>  - Create a new migration"
	@echo "  make migrate-up                       - Run all pending migrations"
	@echo "  make migrate-down                     - Rollback last migration"
	@echo "  make migrate-status                   - Show migration status"
	@echo "  make migrate-force version=<N>        - Force migration version"
	@echo "  make create-db                        - Create database"
	@echo "  make drop-db                          - Drop database"
	@echo "  make proto                            - Generate all protobuf files"
	@echo "  make proto-auth                       - Generate auth protobuf files"
	@echo "  make proto-user                       - Generate user protobuf files"
	@echo "  make proto-tenant                     - Generate tenant protobuf files"
	@echo "  make graphql                          - Generate GraphQL resolvers and models"

# Database migration variables (centralized)
MIGRATION_PATH := shared/database/migrations

DB_HOST ?= localhost
DB_PORT ?= 5432
DB_USER ?= damarhuda
DB_PASSWORD ?= password
DB_NAME ?= damar_admin_cms

# Build database URL
DB_ADDR := postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=disable

.PHONY: migration
migration:
	@if [ -z "$(name)" ]; then \
		echo "Error: Please provide a migration name using 'name=<migration_name>'"; \
		echo "Example: make migration name=create_products_table"; \
		exit 1; \
	fi
	@mkdir -p $(MIGRATION_PATH)
	@migrate create -seq -ext sql -dir $(MIGRATION_PATH) $(name)
	@echo "Migration files created in $(MIGRATION_PATH)"

.PHONY: migrate-up
migrate-up:
	@echo "Running all pending migrations..."
	@migrate -path=$(MIGRATION_PATH) -database="$(DB_ADDR)" up
	@echo "Migrations completed!"

.PHONY: migrate-down
migrate-down:
	@echo "Rolling back last migration..."
	@migrate -path=$(MIGRATION_PATH) -database="$(DB_ADDR)" down 1
	@echo "Rollback completed!"

.PHONY: migrate-status
migrate-status:
	@echo "Current migration status:"
	@migrate -path=$(MIGRATION_PATH) -database="$(DB_ADDR)" version

.PHONY: migrate-force
migrate-force:
	@if [ -z "$(version)" ]; then \
		echo "Error: Please specify version using 'version=<N>'"; \
		echo "Example: make migrate-force version=3"; \
		exit 1; \
	fi
	@echo "Forcing migration to version $(version)..."
	@migrate -path=$(MIGRATION_PATH) -database="$(DB_ADDR)" force $(version)
	@echo "Migration version forced to $(version)"

.PHONY: create-db
create-db:
	@echo "Creating database $(DB_NAME)..."
	@psql -h $(DB_HOST) -U $(DB_USER) -c "CREATE DATABASE $(DB_NAME);" 2>/dev/null || echo "$(DB_NAME) already exists"
	@echo "Database ready!"

.PHONY: drop-db
drop-db:
	@echo "Dropping database $(DB_NAME)..."
	@psql -h $(DB_HOST) -U $(DB_USER) -c "DROP DATABASE IF EXISTS $(DB_NAME);"
	@echo "Database dropped!"

# Proto generation
PROTO_DIR := proto
PROTO_SRC := $(wildcard $(PROTO_DIR)/*.proto)
GO_OUT := .

.PHONY: proto
proto:
	@echo "Generating protobuf files..."
	@protoc \
		--proto_path=$(PROTO_DIR) \
		--go_out=$(GO_OUT) \
		--go-grpc_out=$(GO_OUT) \
		$(PROTO_SRC)
	@echo "Protobuf files generated successfully!"

.PHONY: proto-auth
proto-auth:
	@echo "Generating auth protobuf files..."
	@protoc \
		--proto_path=$(PROTO_DIR) \
		--go_out=$(GO_OUT) \
		--go-grpc_out=$(GO_OUT) \
		$(PROTO_DIR)/auth.proto
	@echo "Auth protobuf files generated!"

.PHONY: proto-user
proto-user:
	@echo "Generating user protobuf files..."
	@protoc \
		--proto_path=$(PROTO_DIR) \
		--go_out=$(GO_OUT) \
		--go-grpc_out=$(GO_OUT) \
		$(PROTO_DIR)/user.proto
	@echo "User protobuf files generated!"

.PHONY: proto-tenant
proto-tenant:
	@echo "Generating tenant protobuf files..."
	@protoc \
		--proto_path=$(PROTO_DIR) \
		--go_out=$(GO_OUT) \
		--go-grpc_out=$(GO_OUT) \
		$(PROTO_DIR)/tenant.proto
	@echo "Tenant protobuf files generated!"

# GraphQL generation
.PHONY: graphql
graphql:
	@echo "Generating GraphQL resolvers and models..."
	@cd services/api-gateway && gqlgen generate
	@echo "GraphQL files generated successfully!"
