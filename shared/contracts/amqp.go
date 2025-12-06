package contracts

// AmqpMessage is the message structure for AMQP.
type AmqpMessage struct {
	OwnerID string `json:"ownerId"`
	Data    []byte `json:"data"`
}

// Routing keys - using consistent event/command patterns
const (
	// Trip events (trip.event.*)
	TripEventCreated             = "trip.event.created"
	TripEventDriverAssigned      = "trip.event.driver_assigned"
	TripEventNoDriversFound      = "trip.event.no_drivers_found"
	TripEventDriverNotInterested = "trip.event.driver_not_interested"

	// Driver commands (driver.cmd.*)
	DriverCmdTripRequest = "driver.cmd.trip_request"
	DriverCmdTripAccept  = "driver.cmd.trip_accept"
	DriverCmdTripDecline = "driver.cmd.trip_decline"
	DriverCmdLocation    = "driver.cmd.location"
	DriverCmdRegister    = "driver.cmd.register"

	// Payment events (payment.event.*)
	PaymentEventSessionCreated = "payment.event.session_created"
	PaymentEventSuccess        = "payment.event.success"
	PaymentEventFailed         = "payment.event.failed"
	PaymentEventCancelled      = "payment.event.cancelled"

	// Payment commands (payment.cmd.*)
	PaymentCmdCreateSession = "payment.cmd.create_session"

	// User events (user.event.*)
	UserEventRegistered      = "user.event.registered"
	UserEventPasswordChanged = "user.event.password_changed"
	UserEventEmailVerified   = "user.event.email_verified"
	UserEventProfileUpdated  = "user.event.profile_updated"
	UserEventBlocked         = "user.event.blocked"
	UserEventUnblocked       = "user.event.unblocked"
	UserEventDeleted         = "user.event.deleted"

	// Auth events (auth.event.*)
	AuthEventPasswordResetRequested = "auth.event.password_reset_requested"
	AuthEventPasswordResetCompleted = "auth.event.password_reset_completed"
	AuthEventVerificationRequested  = "auth.event.verification_requested"

	// Notification commands (notification.cmd.*)
	NotificationCmdSendEmail = "notification.cmd.send_email"
	NotificationCmdSendSMS   = "notification.cmd.send_sms"
	NotificationCmdSendPush  = "notification.cmd.send_push"

	// Product events (product.event.*)
	ProductEventCreated      = "product.event.created"
	ProductEventUpdated      = "product.event.updated"
	ProductEventDeleted      = "product.event.deleted"
	ProductEventPriceChanged = "product.event.price_changed"
)
