# Blog Post Feature Improvements

## Summary

Implemented WYSIWYG editor and image upload functionality for blog posts. The blog post creation form now matches the design specification with rich text editing capabilities and featured image support.

## Frontend Changes

### 1. Components Created

#### `web/src/components/ui/image-upload.tsx`

- Drag & drop image upload component
- Image preview functionality
- File validation for images only
- Remove image capability

#### `web/src/components/ui/rich-text-editor.tsx` (Already exists)

- TipTap-based WYSIWYG editor
- Supports: Bold, Italic, Code, Headings, Lists, Undo/Redo
- Toolbar with formatting options

### 2. Form Updates (`blog-post-form.tsx`)

**Added Fields:**

- **Body (WYSIWYG)**: Rich text editor replacing plain textarea
- **Featured Image**: Image upload with preview
- **Is Published**: Toggle switch to publish/unpublish
- **Published At**: Date-time picker for scheduling

**Form Flow:**

1. User fills in title, slug, description, category
2. Writes content in WYSIWYG editor
3. Uploads optional featured image
4. Sets publish status and date
5. Submits to backend

### 3. Type Updates (`web/src/types/blog.ts`)

Added to `CreateBlogPostInput` and `UpdateBlogPostInput`:

```typescript
isPublished?: boolean
publishedAt?: number  // Unix timestamp
imageFile?: File
```

### 4. Create Page Updates (`routes/admin/blog/create.tsx`)

- Handles image upload separately before blog post creation
- Converts `publishedAt` datetime to Unix timestamp
- Removes `imageFile` from blog post data before mutation

## Backend Integration Status

### ✅ Working

- **Media Service**: Fully functional and standalone
  - Handles file uploads via gRPC
  - Stores files in MinIO/S3
  - Associates media with model via `modelType` and `modelId`
  - Collection name: `featured_image` for blog posts

### ⚠️ Needs Backend Updates

The following fields are **NOT YET** handled by backend:

1. **`isPublished` field** - Currently only `publishBlogPost` mutation exists
2. **`publishedAt` field** - Not in `CreateBlogPostRequest` proto
3. **Image association** - Need to update `modelId` after blog post creation

#### Backend Proto Files to Update

**`proto/content.proto`** - Add to `CreateBlogPostRequest`:

```protobuf
message CreateBlogPostRequest {
  string title = 1;
  string slug = 2;
  string body = 3;
  string description = 4;
  int64 user_id = 5;
  int64 author_id = 6;
  int64 blog_post_category_id = 7;
  bool is_published = 8;           // NEW
  int64 published_at = 9;          // NEW (Unix timestamp)
}
```

#### Backend Service Changes Needed

**`services/content-service/internal/domain/blog_post.go`**:

```go
type BlogPost struct {
    // ... existing fields
    IsPublished  bool
    PublishedAt  *int64  // Unix timestamp, nullable
}
```

**`services/content-service/internal/infrastructure/grpc/blog_post_handler.go`**:

- Add validation for `isPublished` and `publishedAt`
- Set `publishedAt` to current time if `isPublished` is true and no date provided

#### Database Migration Needed

The `blog_posts` table already has these columns (from Laravel schema):

- `is_published` (boolean, default false)
- `published_at` (timestamp, nullable)

## Image Upload Workflow

### Current Implementation (Placeholder)

```typescript
// In create.tsx handleCreate function
if (data.imageFile) {
  // TODO: Upload image via GraphQL uploadFile mutation
  // Step 1: Create blog post and get ID
  // Step 2: Upload image with modelType='blog_post' and modelId=blogPostId
  // Step 3: (Optional) Update blog post with featured_image_id
}
```

### Recommended Workflow

**Option A: Upload After Creation** (Current approach)

1. Create blog post without image
2. Get blog post ID from response
3. Upload image to media-service with `modelType='blog_post'` and `modelId=blogPostId`
4. Media service automatically associates image with blog post

**Option B: Two-Step Creation**

1. Upload image first with temporary `modelId=0`
2. Create blog post and get ID
3. Update media `modelId` with actual blog post ID

**Option C: Separate Media Field in BlogPost**

1. Add `featured_image_id` to `blog_posts` table
2. Upload image first
3. Pass `featured_image_id` when creating blog post

## Media Service Architecture

### Key Points

- **Standalone Service**: No tight coupling with other services
- **gRPC Communication**: All operations via protobuf
- **MinIO Storage**: Files stored in object storage
- **URL Generation**: Presigned URLs for secure access
- **Model Association**: Uses `model_type` + `model_id` pattern
- **Collections**: Organizes media by type (avatar, featured_image, etc.)

### Example Media Upload

```graphql
mutation UploadBlogImage($input: UploadFileInput!) {
  uploadFile(input: $input) {
    success
    message
    data {
      id
      uuid
      url
      fileName
      mimeType
      modelType
      modelId
      collectionName
    }
  }
}
```

```javascript
{
  input: {
    content: fileObject,
    fileName: "blog-image.jpg",
    mimeType: "image/jpeg",
    modelType: "blog_post",
    modelId: "123",
    collectionName: "featured_image",
    disk: "public"
  }
}
```

### Retrieving Blog Post Image

```graphql
query GetBlogPostImage($modelId: ID!) {
  mediaByModel(
    input: {
      modelType: "blog_post"
      modelId: $modelId
      collectionName: "featured_image"
    }
  ) {
    success
    data {
      media {
        id
        url
        fileName
      }
    }
  }
}
```

## Testing Checklist

### Frontend

- [ ] WYSIWYG editor formatting works (bold, italic, lists, etc.)
- [ ] Image upload shows preview
- [ ] Image can be removed
- [ ] Drag & drop image upload works
- [ ] Form validation prevents empty title/body
- [ ] "Create & Create Another" resets form correctly
- [ ] Published toggle works
- [ ] Date-time picker for publishedAt works

### Backend (TODO)

- [ ] Create blog post with `isPublished=true`
- [ ] Create blog post with custom `publishedAt`
- [ ] Upload image and associate with blog post
- [ ] Retrieve blog post with featured image
- [ ] Update blog post with new image
- [ ] Delete blog post cascades to media

## Future Enhancements

1. **Rich Media in Body**

   - Allow image uploads within WYSIWYG editor
   - Embed videos/iframes
   - Code syntax highlighting

2. **Multiple Images**

   - Gallery support
   - Multiple featured images
   - Image captions

3. **Image Optimization**

   - Automatic resize/compression
   - Generate thumbnails
   - WebP conversion

4. **SEO Enhancements**
   - Auto-generate meta descriptions from body
   - Image alt text support
   - Open Graph tags

## Known Limitations

1. **Image Upload Incomplete**: Frontend prepared but backend integration pending
2. **No Image Preview in List**: Blog list doesn't show thumbnails yet
3. **No Draft Auto-Save**: Users can lose work if not saved
4. **No Version History**: Can't track blog post revisions

## Files Modified

```
web/src/
├── components/
│   ├── features/admin/blog/
│   │   └── blog-post-form.tsx         # Updated with WYSIWYG and image
│   └── ui/
│       ├── image-upload.tsx           # NEW component
│       └── rich-text-editor.tsx       # Existing, now used
├── routes/admin/blog/
│   └── create.tsx                     # Updated for image handling
└── types/
    └── blog.ts                        # Added isPublished, publishedAt, imageFile
```

## Translation Keys Added

```json
{
  "blog.form.image": "Featured Image",
  "blog.form.imageDescription": "Optional featured image for your blog post.",
  "blog.form.image_upload": "Drag & Drop your files or",
  "blog.form.browse": "Browse",
  "blog.form.image_format": "PNG, JPG, GIF up to 10MB",
  "blog.form.image_upload_failed": "Failed to upload image",
  "blog.form.isPublished": "Published",
  "blog.form.isPublishedDescription": "Make this post visible to the public.",
  "blog.form.publishedAt": "Published At",
  "blog.form.publishedAtDescription": "Optional publish date/time. Leave empty to use current time."
}
```

## Next Steps

1. **Backend Team**: Implement `isPublished` and `publishedAt` fields in content-service
2. **Frontend Team**: Complete image upload integration once backend is ready
3. **Testing**: E2E testing of complete workflow
4. **Documentation**: Update API docs with new fields
5. **Deployment**: Coordinate backend + frontend deployment

## References

- TipTap Documentation: https://tiptap.dev/
- Media Service Proto: `/proto/media.proto`
- Content Service Proto: `/proto/content.proto`
- API Gateway Resolvers: `/services/api-gateway/graph/schema.resolvers.go`
