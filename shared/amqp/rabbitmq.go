package amqp

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/damarteplok/damar-admin-cms/shared/logger"
	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

// Connection wraps the RabbitMQ connection
type Connection struct {
	conn    *amqp.Connection
	channel *amqp.Channel
}

// NewConnection creates a new RabbitMQ connection
func NewConnection(url string) (*Connection, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	channel, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}

	logger.Info("Connected to RabbitMQ", zap.String("url", url))

	return &Connection{
		conn:    conn,
		channel: channel,
	}, nil
}

// Close closes the RabbitMQ connection
func (c *Connection) Close() error {
	if c.channel != nil {
		if err := c.channel.Close(); err != nil {
			logger.Error("Failed to close channel", zap.Error(err))
		}
	}
	if c.conn != nil {
		if err := c.conn.Close(); err != nil {
			logger.Error("Failed to close connection", zap.Error(err))
			return err
		}
	}
	logger.Info("RabbitMQ connection closed")
	return nil
}

// DeclareExchange declares an exchange
func (c *Connection) DeclareExchange(name, kind string) error {
	return c.channel.ExchangeDeclare(
		name,  // name
		kind,  // type (direct, topic, fanout, headers)
		true,  // durable
		false, // auto-deleted
		false, // internal
		false, // no-wait
		nil,   // arguments
	)
}

// DeclareQueue declares a queue and binds it to an exchange
func (c *Connection) DeclareQueue(queueName, exchangeName, routingKey string) error {
	_, err := c.channel.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	err = c.channel.QueueBind(
		queueName,    // queue name
		routingKey,   // routing key
		exchangeName, // exchange
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("failed to bind queue: %w", err)
	}

	logger.Info("Queue declared and bound",
		zap.String("queue", queueName),
		zap.String("exchange", exchangeName),
		zap.String("routingKey", routingKey))

	return nil
}

type Publisher struct {
	conn     *Connection
	exchange string
}

func NewPublisher(conn *Connection, exchange string) (*Publisher, error) {
	if err := conn.DeclareExchange(exchange, "topic"); err != nil {
		return nil, fmt.Errorf("failed to declare exchange: %w", err)
	}

	return &Publisher{
		conn:     conn,
		exchange: exchange,
	}, nil
}

func (p *Publisher) Publish(ctx context.Context, routingKey string, message interface{}) error {
	body, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	err = p.conn.channel.PublishWithContext(
		ctx,
		p.exchange, // exchange
		routingKey, // routing key
		false,      // mandatory
		false,      // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent, // persist messages
			Timestamp:    time.Now(),
		},
	)
	if err != nil {
		logger.Error("Failed to publish message",
			zap.String("exchange", p.exchange),
			zap.String("routingKey", routingKey),
			zap.Error(err))
		return fmt.Errorf("failed to publish message: %w", err)
	}

	logger.Debug("Message published",
		zap.String("exchange", p.exchange),
		zap.String("routingKey", routingKey))

	return nil
}

// Consumer handles consuming messages
type Consumer struct {
	conn      *Connection
	queueName string
}

// NewConsumer creates a new consumer
func NewConsumer(conn *Connection, queueName, exchangeName, routingKey string) (*Consumer, error) {
	// Declare exchange
	if err := conn.DeclareExchange(exchangeName, "topic"); err != nil {
		return nil, fmt.Errorf("failed to declare exchange: %w", err)
	}

	// Declare and bind queue
	if err := conn.DeclareQueue(queueName, exchangeName, routingKey); err != nil {
		return nil, err
	}

	return &Consumer{
		conn:      conn,
		queueName: queueName,
	}, nil
}

// Consume starts consuming messages
func (c *Consumer) Consume(handler func([]byte) error) error {
	msgs, err := c.conn.channel.Consume(
		c.queueName, // queue
		"",          // consumer tag
		false,       // auto-ack (manual ack for reliability)
		false,       // exclusive
		false,       // no-local
		false,       // no-wait
		nil,         // args
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %w", err)
	}

	logger.Info("Started consuming messages", zap.String("queue", c.queueName))

	// Consume messages forever
	for msg := range msgs {
		logger.Debug("Received message",
			zap.String("queue", c.queueName),
			zap.String("routingKey", msg.RoutingKey))

		if err := handler(msg.Body); err != nil {
			logger.Error("Failed to handle message",
				zap.String("queue", c.queueName),
				zap.Error(err))
			msg.Nack(false, true)
		} else {
			msg.Ack(false)
		}
	}

	return nil
}
