package redis

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

// APQCache implements gqlgen's cache interface for Automatic Persisted Queries
type APQCache struct {
	client *redis.Client
	ttl    time.Duration
}

// NewAPQCache creates a new APQ cache backed by Redis
func NewAPQCache(client *redis.Client, ttl time.Duration) *APQCache {
	if ttl == 0 {
		ttl = 24 * time.Hour // Default TTL 24 hours
	}
	return &APQCache{
		client: client,
		ttl:    ttl,
	}
}

// Add stores a query in the cache
func (c *APQCache) Add(ctx context.Context, key string, value string) {
	// Store in Redis with TTL
	_ = c.client.Set(ctx, key, value, c.ttl).Err()
}

// Get retrieves a query from the cache
func (c *APQCache) Get(ctx context.Context, key string) (string, bool) {
	val, err := c.client.Get(ctx, key).Result()
	if err != nil {
		return "", false
	}
	return val, true
}
