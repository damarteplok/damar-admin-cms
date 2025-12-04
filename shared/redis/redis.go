package redis

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

// Client wraps redis client with helper methods
type Client struct {
	*redis.Client
}

// NewClient creates a new Redis client
func NewClient(addr string, password string, db int) (*Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	return &Client{Client: client}, nil
}

// NewClientFromURL creates a new Redis client from a URL
func NewClientFromURL(url string) (*Client, error) {
	opts, err := redis.ParseURL(url)
	if err != nil {
		return nil, err
	}

	client := redis.NewClient(opts)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	return &Client{Client: client}, nil
}

// Close closes the Redis connection
func (c *Client) Close() error {
	return c.Client.Close()
}
