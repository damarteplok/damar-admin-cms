.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make migration name=<migration_name>  - Create a new migration"
	@echo "  make migrate-up service=<service>     - Run all pending migrations for a service"
	@echo "  make migrate-down service=<service>   - Rollback last migration for a service"
	@echo "  make migrate-up-all                   - Run all pending migrations for all services"
	@echo "  make migrate-down-all                 - Rollback last migration for all services"
	@echo "  make proto                            - Generate all protobuf files"
	@echo "  make proto-auth                       - Generate auth protobuf files"
	@echo "  make proto-user                       - Generate user protobuf files"
	@echo "  make graphql                          - Generate GraphQL resolvers and models"

# Database migration variables
MIGRATION_PATH_USER_SERVICE := services/user-service/cmd/migrate/migrations
MIGRATION_PATH_AUTH_SERVICE := services/auth-service/cmd/migrate/migrations

DB_HOST ?= localhost
DB_PORT ?= 5432
DB_USER ?= damarhuda
DB_PASSWORD ?= password
DB_NAME ?= damar_admin_cms

# Build database URL for user-service
USER_SERVICE_DB_NAME := $(DB_NAME)
USER_SERVICE_DB_ADDR := postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(USER_SERVICE_DB_NAME)?sslmode=disable

# Build database URL for auth-service
AUTH_SERVICE_DB_NAME := $(DB_NAME)
AUTH_SERVICE_DB_ADDR := postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(AUTH_SERVICE_DB_NAME)?sslmode=disable

.PHONY: migration
migration:
	@if [ -z "$(name)" ]; then \
		echo "Error: Please provide a migration name using 'name=<migration_name>'"; \
		echo "Example: make migration name=create_users_table service=user"; \
		exit 1; \
	fi
	@if [ -z "$(service)" ]; then \
		echo "Error: Please specify service using 'service=user|auth'"; \
		exit 1; \
	fi
	@if [ "$(service)" = "user" ]; then \
		mkdir -p $(MIGRATION_PATH_USER_SERVICE); \
		migrate create -seq -ext sql -dir $(MIGRATION_PATH_USER_SERVICE) $(name); \
	elif [ "$(service)" = "auth" ]; then \
		mkdir -p $(MIGRATION_PATH_AUTH_SERVICE); \
		migrate create -seq -ext sql -dir $(MIGRATION_PATH_AUTH_SERVICE) $(name); \
	else \
		echo "Error: Invalid service '$(service)'. Use 'user' or 'auth'"; \
		exit 1; \
	fi

.PHONY: migrate-up
migrate-up:
	@if [ -z "$(service)" ]; then \
		echo "Error: Please specify service using 'service=user|auth'"; \
		exit 1; \
	fi
	@if [ "$(service)" = "user" ]; then \
		migrate -path=$(MIGRATION_PATH_USER_SERVICE) -database="$(USER_SERVICE_DB_ADDR)" up; \
	elif [ "$(service)" = "auth" ]; then \
		migrate -path=$(MIGRATION_PATH_AUTH_SERVICE) -database="$(AUTH_SERVICE_DB_ADDR)" up; \
	else \
		echo "Error: Invalid service '$(service)'. Use 'user' or 'auth'"; \
		exit 1; \
	fi

.PHONY: migrate-down
migrate-down:
	@if [ -z "$(service)" ]; then \
		echo "Error: Please specify service using 'service=user|auth'"; \
		exit 1; \
	fi
	@if [ "$(service)" = "user" ]; then \
		migrate -path=$(MIGRATION_PATH_USER_SERVICE) -database="$(USER_SERVICE_DB_ADDR)" down; \
	elif [ "$(service)" = "auth" ]; then \
		migrate -path=$(MIGRATION_PATH_AUTH_SERVICE) -database="$(AUTH_SERVICE_DB_ADDR)" down; \
	else \
		echo "Error: Invalid service '$(service)'. Use 'user' or 'auth'"; \
		exit 1; \
	fi

.PHONY: migrate-up-all
migrate-up-all:
	@echo "Running migrations for user-service..."
	@migrate -path=$(MIGRATION_PATH_USER_SERVICE) -database="$(USER_SERVICE_DB_ADDR)" up
	@echo "Running migrations for auth-service..."
	@migrate -path=$(MIGRATION_PATH_AUTH_SERVICE) -database="$(AUTH_SERVICE_DB_ADDR)" up

.PHONY: migrate-down-all
migrate-down-all:
	@echo "Rolling back migrations for user-service..."
	@migrate -path=$(MIGRATION_PATH_USER_SERVICE) -database="$(USER_SERVICE_DB_ADDR)" down
	@echo "Rolling back migrations for auth-service..."
	@migrate -path=$(MIGRATION_PATH_AUTH_SERVICE) -database="$(AUTH_SERVICE_DB_ADDR)" down

.PHONY: create-dbs
create-dbs:
	@echo "Creating databases..."
	@psql -h $(DB_HOST) -U $(DB_USER) -c "CREATE DATABASE $(USER_SERVICE_DB_NAME);" 2>/dev/null || echo "$(USER_SERVICE_DB_NAME) already exists"
	@psql -h $(DB_HOST) -U $(DB_USER) -c "CREATE DATABASE $(AUTH_SERVICE_DB_NAME);" 2>/dev/null || echo "$(AUTH_SERVICE_DB_NAME) already exists"
	@echo "Databases ready!"

.PHONY: drop-dbs
drop-dbs:
	@echo "Dropping databases..."
	@psql -h $(DB_HOST) -U $(DB_USER) -c "DROP DATABASE IF EXISTS $(USER_SERVICE_DB_NAME);"
	@psql -h $(DB_HOST) -U $(DB_USER) -c "DROP DATABASE IF EXISTS $(AUTH_SERVICE_DB_NAME);"
	@echo "Databases dropped!"

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

# GraphQL generation
.PHONY: graphql
graphql:
	@echo "Generating GraphQL resolvers and models..."
	@cd services/api-gateway && gqlgen generate
	@echo "GraphQL files generated successfully!"
