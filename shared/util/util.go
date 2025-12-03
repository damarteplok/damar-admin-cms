package util

import (
	"fmt"
	"time"
)

// GetRandomAvatar returns a random avatar URL from the randomuser.me API
func GetRandomAvatar(index int) string {
	return fmt.Sprintf("https://randomuser.me/api/portraits/lego/%d.jpg", index)
}

// StringValue converts *string to string, returns empty string if nil
func StringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// StringPtr converts string to *string, returns nil if empty
func StringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// TimeToUnix converts *time.Time to Unix timestamp, returns 0 if nil
func TimeToUnix(t *time.Time) int64 {
	if t == nil {
		return 0
	}
	return t.Unix()
}
