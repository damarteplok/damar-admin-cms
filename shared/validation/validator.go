package validation

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()

	// Register custom validation functions
	validate.RegisterValidation("alphanum_hyphen", validateAlphanumHyphen)
}

// validateAlphanumHyphen validates that a string contains only alphanumeric characters and hyphens
func validateAlphanumHyphen(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	if value == "" {
		return true // Allow empty for omitempty fields
	}
	// Allow lowercase letters, numbers, and hyphens
	matched, _ := regexp.MatchString(`^[a-z0-9-]+$`, value)
	return matched
}

func GetValidator() *validator.Validate {
	return validate
}

func ValidateStruct(s interface{}) error {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	var errMessages []string
	for _, err := range err.(validator.ValidationErrors) {
		errMessages = append(errMessages, formatValidationError(err))
	}

	return fmt.Errorf("%s", strings.Join(errMessages, "; "))
}

func formatValidationError(err validator.FieldError) string {
	field := err.Field()
	tag := err.Tag()
	param := err.Param()

	switch tag {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return fmt.Sprintf("%s must be a valid email address", field)
	case "min":
		return fmt.Sprintf("%s must be at least %s characters", field, param)
	case "max":
		return fmt.Sprintf("%s must not exceed %s characters", field, param)
	case "len":
		return fmt.Sprintf("%s must be exactly %s characters", field, param)
	case "e164":
		return fmt.Sprintf("%s must be a valid phone number in E.164 format", field)
	case "url":
		return fmt.Sprintf("%s must be a valid URL", field)
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s", field, param)
	case "gt":
		return fmt.Sprintf("%s must be greater than %s", field, param)
	case "gte":
		return fmt.Sprintf("%s must be greater than or equal to %s", field, param)
	case "lt":
		return fmt.Sprintf("%s must be less than %s", field, param)
	case "lte":
		return fmt.Sprintf("%s must be less than or equal to %s", field, param)
	case "alphanum_hyphen":
		return fmt.Sprintf("%s must contain only lowercase letters, numbers, and hyphens", field)
	case "fqdn":
		return fmt.Sprintf("%s must be a valid domain name", field)
	case "uuid":
		return fmt.Sprintf("%s must be a valid UUID", field)
	default:
		return fmt.Sprintf("%s failed validation for '%s'", field, tag)
	}
}
