# Public Bucket Implementation for Blog Images

## Overview

Implemented dual bucket strategy for MinIO object storage to support public blog images without signed URLs, improving SEO and performance.

## Architecture

### Storage Strategy

**Private Bucket (`aos`)**:

- User uploads (avatars, private documents)
- Requires presigned URLs with expiration
- Authentication required for access

**Public Bucket (`blog-images`)**:

- Blog post images and content media
- Direct HTTP/HTTPS URLs (no presigning needed)
- Publicly readable via S3 policy
- SEO-friendly and cacheable by CDNs

## Implementation Details

### 1. Backend Changes

#### Database Migration (`000036_add_public_fields_to_media_table`)

```sql
-- Up Migration
ALTER TABLE media
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN public_url TEXT;

-- Down Migration
ALTER TABLE media
DROP COLUMN IF EXISTS public_url,
DROP COLUMN IF EXISTS is_public;
```

#### Proto Definitions (`proto/media.proto`)

```protobuf
message UploadFileRequest {
  // ... existing fields
  bool is_public = 11;
}

message Media {
  // ... existing fields
  bool is_public = 18;
  string public_url = 19;
}
```

#### Storage Helper Functions (`shared/storage/minio.go`)

```go
// SetBucketPublic applies S3 policy for public read access
func SetBucketPublic(ctx context.Context, client *minio.Client, bucketName string) error

// GetPublicURL constructs direct HTTP/HTTPS URL for public files
func GetPublicURL(endpoint, bucketName, objectPath string, useSSL bool) string
```

#### Domain Layer (`services/media-service/internal/domain/media.go`)

```go
type Media struct {
    // ... existing fields
    IsPublic  bool
    PublicURL *string
}

type UploadRequest struct {
    // ... existing fields
    IsPublic bool
}
```

#### Repository Layer (`services/media-service/internal/infrastructure/repository/media_repository.go`)

```go
type MediaRepository struct {
    db               *pgxpool.Pool
    minio            *minio.Client
    bucketName       string       // Private bucket
    publicBucketName string       // Public bucket
    minioEndpoint    string
    minioUseSSL      bool
}

// Upload method logic:
// 1. Check media.IsPublic flag
// 2. Route to appropriate bucket (private or public)
// 3. Generate publicURL if public
// 4. Store metadata in database
```

#### Service Initialization (`services/media-service/cmd/main.go`)

```go
// Create both buckets on startup
storage.EnsureBucket(ctx, minioClient, bucketName)
storage.EnsureBucket(ctx, minioClient, publicBucketName)

// Set public bucket policy
storage.SetBucketPublic(ctx, minioClient, publicBucketName)

// Initialize repository with both buckets
mediaRepo := repository.NewMediaRepository(
    pool,
    minioClient,
    bucketName,          // aos (private)
    publicBucketName,    // blog-images (public)
    minioEndpoint,
    minioUseSSL,
)
```

### 2. API Gateway Changes

#### GraphQL Schema (`services/api-gateway/graph/schema.graphqls`)

```graphql
type Media {
  # ... existing fields
  isPublic: Boolean!
  publicUrl: String
  url: String
}

input UploadFileInput {
  # ... existing fields
  isPublic: Boolean
}
```

#### GraphQL Resolvers (`services/api-gateway/graph/schema.resolvers.go`)

```go
// UploadFile mutation passes isPublic flag
uploadResp, err := r.Resolver.MediaClient.UploadFile(ctx, &mediaPb.UploadFileRequest{
    // ... existing fields
    IsPublic: isPublic,
})
```

#### Helper Functions (`services/api-gateway/graph/helpers.go`)

```go
func pbMediaToModel(m *mediaPb.Media) *model.Media {
    return &model.Media{
        // ... existing fields
        IsPublic: m.IsPublic,
        PublicURL: func() *string {
            if m.PublicUrl != "" {
                return &m.PublicUrl
            }
            return nil
        }(),
    }
}
```

### 3. Frontend Changes

#### GraphQL Query (`web/src/lib/graphql/media.graphql.ts`)

```typescript
export const UPLOAD_FILE_MUTATION = gql`
  mutation UploadFile($input: UploadFileInput!) {
    uploadFile(input: $input) {
      success
      message
      data {
        id
        # ... existing fields
        isPublic
        publicUrl
        url
      }
    }
  }
`;
```

#### Type Definitions (`web/src/types/media.ts`)

```typescript
export interface Media {
  // ... existing fields
  isPublic: boolean;
  publicUrl: string | null;
  url: string | null;
}

export interface UploadFileInput {
  // ... existing fields
  isPublic?: boolean;
}
```

#### RichTextEditor Component (`web/src/components/ui/rich-text-editor.tsx`)

```typescript
const uploadImage = useCallback(
  async (event) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    setIsUploading(true);

    const result = await uploadFileMutation({
      input: {
        content: file,
        fileName: file.name,
        mimeType: file.type,
        modelType: "blog_post",
        modelId: "0",
        collectionName: "content_images",
        name: file.name,
        disk: "minio",
        isPublic: true, // CRITICAL: Blog images are public
      },
    });

    if (result.data?.uploadFile?.success) {
      const media = result.data.uploadFile.data;
      // Use publicUrl for permanent SEO-friendly URL
      const imageUrl = media.publicUrl || media.url;
      editor.chain().focus().setImage({ src: imageUrl }).run();
      toast.success("Image uploaded successfully");
    }
  },
  [editor, uploadFileMutation]
);
```

## Environment Variables

Add to `.env` files:

```env
# MinIO Public Bucket (for blog images)
MINIO_PUBLIC_BUCKET_NAME=blog-images
```

## Benefits

### SEO Improvements

- Direct URLs crawlable by search engines
- No signed URL expiration issues
- Image URLs remain stable over time

### Performance

- No presigned URL generation overhead
- CDN cacheable URLs
- Reduced backend load

### User Experience

- Faster image loading
- Reliable image display
- No broken images from expired URLs

## Testing Checklist

- [ ] Create new blog post with image upload
- [ ] Verify image stored in `blog-images` bucket
- [ ] Confirm `public_url` field populated in database
- [ ] Test image accessible without authentication
- [ ] Verify URL format: `http://minio:9000/blog-images/{path}`
- [ ] Check SEO crawler can access images
- [ ] Confirm existing private uploads still use signed URLs

## Security Considerations

- Public bucket **only** for blog content images
- User avatars remain in private bucket
- S3 policy restricts to read-only access
- No write permissions granted to public

## Migration Path

Existing blog posts with base64 images will continue to work. New uploads automatically use public bucket when `isPublic: true` is set.

## File Locations Changed

### Backend

- `shared/storage/minio.go` - Public bucket helpers
- `proto/media.proto` - Proto definitions
- `shared/proto/media/*.pb.go` - Generated code
- `services/media-service/internal/domain/media.go` - Domain types
- `services/media-service/internal/infrastructure/repository/media_repository.go` - Repository implementation
- `services/media-service/cmd/main.go` - Service initialization
- `shared/database/migrations/000036_*` - Database migration

### API Gateway

- `services/api-gateway/graph/schema.graphqls` - GraphQL schema
- `services/api-gateway/graph/generated.go` - Generated types
- `services/api-gateway/graph/schema.resolvers.go` - Resolvers
- `services/api-gateway/graph/helpers.go` - Helper functions

### Frontend

- `web/src/lib/graphql/media.graphql.ts` - GraphQL queries
- `web/src/types/media.ts` - TypeScript types
- `web/src/components/ui/rich-text-editor.tsx` - Upload implementation

## Deployment Notes

1. Run database migration: `make migrate-up service=media`
2. Ensure MinIO has `blog-images` bucket created
3. Verify public bucket policy applied
4. Rebuild and restart all services
5. Test image upload in blog editor

---

**Date**: December 17, 2025  
**Status**: ✅ Complete
