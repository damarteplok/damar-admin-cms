package util

import (
	"fmt"
	"time"

	"github.com/damarteplok/damar-admin-cms/shared/env"
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

// ConstructMediaURL builds a complete MinIO URL from UUID and filename
func ConstructMediaURL(uuid, filename string) string {
	endpoint := env.GetString("MINIO_ENDPOINT", "localhost:9000")
	bucketName := env.GetString("MINIO_BUCKET_NAME", "aos")
	useSSL := env.GetBool("MINIO_USE_SSL", false)

	protocol := "http"
	if useSSL {
		protocol = "https"
	}

	return fmt.Sprintf("%s://%s/%s/%s/%s", protocol, endpoint, bucketName, uuid, filename)
}
