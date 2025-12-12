package graph

import (
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/api-gateway/graph/model"
	mediaPb "github.com/damarteplok/damar-admin-cms/shared/proto/media"
	"github.com/damarteplok/damar-admin-cms/shared/util"
)

// Helper function to convert protobuf media to GraphQL model
func pbMediaToModel(m *mediaPb.Media) *model.Media {
	if m == nil {
		return nil
	}

	// Use presigned URL from proto if available, otherwise construct it
	var url string
	if m.PresignedUrl != "" {
		url = m.PresignedUrl
	} else {
		url = util.ConstructMediaURL(m.Uuid, m.FileName)
	}

	return &model.Media{
		ID:             fmt.Sprintf("%d", m.Id),
		ModelType:      m.ModelType,
		ModelID:        fmt.Sprintf("%d", m.ModelId),
		UUID:           m.Uuid,
		CollectionName: m.CollectionName,
		Name:           m.Name,
		FileName:       m.FileName,
		MimeType: func() *string {
			if m.MimeType != "" {
				return &m.MimeType
			}
			return nil
		}(),
		Disk: m.Disk,
		ConversionsDisk: func() *string {
			if m.ConversionsDisk != "" {
				return &m.ConversionsDisk
			}
			return nil
		}(),
		Size:                 int32(m.Size),
		Manipulations:        m.Manipulations,
		CustomProperties:     m.CustomProperties,
		GeneratedConversions: m.GeneratedConversions,
		ResponsiveImages:     m.ResponsiveImages,
		OrderColumn: func() *int32 {
			if m.OrderColumn != 0 {
				v := int32(m.OrderColumn)
				return &v
			}
			return nil
		}(),
		URL:       &url,
		CreatedAt: int32(m.CreatedAt),
		UpdatedAt: int32(m.UpdatedAt),
	}
}
