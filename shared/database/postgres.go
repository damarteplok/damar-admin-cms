package database

import (
"context"
"fmt"
"os"

"github.com/jackc/pgx/v5/pgxpool"
)

// NewPostgresPool creates a new PostgreSQL connection pool from environment variables
// Required env vars: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
// Optional: DB_MAX_CONNS (default: 10), DB_MIN_CONNS (default: 2)
func NewPostgresPool(ctx context.Context) (*pgxpool.Pool, error) {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "postgres"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		return nil, fmt.Errorf("DB_NAME environment variable is required")
	}

	connString := fmt.Sprintf(
"postgres://%s:%s@%s:%s/%s?sslmode=disable",
dbUser, dbPassword, dbHost, dbPort, dbName,
)

	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database config: %w", err)
	}

	// Optional: configure pool size from env
	if maxConns := os.Getenv("DB_MAX_CONNS"); maxConns != "" {
		var max int32
		fmt.Sscanf(maxConns, "%d", &max)
		if max > 0 {
			config.MaxConns = max
		}
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return pool, nil
}
