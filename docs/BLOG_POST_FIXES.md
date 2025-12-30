# Blog Post Bug Fixes - December 15, 2024

## Issues Reported

User melaporkan 3 issues setelah implementasi image upload:

1. **Search tidak berfungsi** - Searching dengan kata ngasal masih menampilkan semua data (seharusnya kosong)
2. **Action buttons tidak berfungsi** - View detail, edit, delete buttons tidak ada reaksi
3. **Media cleanup missing** - Perlu delete media dari MinIO dan table saat blog post deleted/updated

## Fixes Implemented

### 1. Search Functionality Fix ✅

**Problem:** Repository `GetAll` method missing `search` parameter, menyebabkan search query tidak di-filter.

**Solution:**

#### a. Updated Repository Interface (`services/content-service/internal/domain/blog_post.go`)

```go
// Before:
GetAll(ctx context.Context, page, perPage int, publishedOnly bool, categoryID *int64, sortBy, sortOrder string)

// After:
GetAll(ctx context.Context, page, perPage int, search string, publishedOnly bool, categoryID *int64, sortBy, sortOrder string)
```

#### b. Updated Repository Implementation (`services/content-service/internal/infrastructure/repository/blog_post_repository.go`)

Added ILIKE search filtering:

```go
if search != "" {
    whereClauses = append(whereClauses, fmt.Sprintf("(title ILIKE $%d OR body ILIKE $%d OR description ILIKE $%d)", argCount, argCount, argCount))
    searchPattern := "%" + search + "%"
    args = append(args, searchPattern)
    argCount++
}
```

#### c. Updated Service Layer (`services/content-service/internal/service/blog_post_service.go`)

```go
// Before: Used separate Search() method
if search != "" {
    return s.repo.Search(ctx, search, page, perPage, publishedOnly)
}
return s.repo.GetAll(ctx, page, perPage, publishedOnly, categoryID, sortBy, sortOrder)

// After: Unified to use GetAll() with search parameter
return s.repo.GetAll(ctx, page, perPage, search, publishedOnly, categoryID, sortBy, sortOrder)
```

**Benefits:**

- Search now filters by title, body, and description using PostgreSQL ILIKE (case-insensitive)
- Can combine search with category filter and sorting
- More consistent API

**Files Changed:**

- `services/content-service/internal/domain/blog_post.go`
- `services/content-service/internal/infrastructure/repository/blog_post_repository.go`
- `services/content-service/internal/service/blog_post_service.go`

---

### 2. Action Buttons Fix ✅

**Problem:** DataTableActions component menerima prop `item` tetapi blog-post-columns.tsx mengirim prop `row`.

**Solution:**

#### Updated Column Actions (`web/src/components/features/admin/blog/blog-post-columns.tsx`)

```tsx
// Before:
<DataTableActions<BlogPost> actions={actions} row={blogPost} />

// After:
<DataTableActions<BlogPost> actions={actions} item={blogPost} />
```

**Root Cause:** Prop name mismatch antara component definition dan usage.

**Files Changed:**

- `web/src/components/features/admin/blog/blog-post-columns.tsx`

---

### 3. Media Cleanup on Delete ✅

**Problem:** Saat blog post di-delete, media files di MinIO dan media table records tidak terhapus, menyebabkan orphaned files.

**Solution:**

#### Updated DeleteBlogPost Resolver (`services/api-gateway/graph/schema.resolvers.go`)

Added media cleanup logic BEFORE deleting blog post:

```go
// First, cleanup associated media files
mediaResp, err := r.MediaClient.GetFilesByModel(ctx, &mediaPb.GetFilesByModelRequest{
    ModelType: "blog_post",
    ModelId:   id,
})
if err == nil && mediaResp.Success && len(mediaResp.Data) > 0 {
    // Delete all associated media files
    for _, media := range mediaResp.Data {
        _, _ = r.MediaClient.DeleteFile(ctx, &mediaPb.DeleteFileRequest{
            Id: media.Id,
        })
    }
}

// Then delete the blog post
resp, err := r.ContentClient.DeleteBlogPost(ctx, &contentPb.DeleteBlogPostRequest{
    Id: blogID,
})
```

**Workflow:**

1. Query all media files associated with blog post (modelType='blog_post', modelId=post_id)
2. Delete each media file (removes from MinIO + media table)
3. Delete blog post record

**Benefits:**

- No orphaned files in MinIO
- No orphaned records in media table
- Proper cleanup workflow

**Files Changed:**

- `services/api-gateway/graph/schema.resolvers.go`

---

## Testing Checklist

### Search Functionality

- [x] Rebuild content-service
- [ ] Test search dengan keyword yang ada di title
- [ ] Test search dengan keyword yang ada di body
- [ ] Test search dengan keyword yang ada di description
- [ ] Test search dengan keyword ngasal (should return empty)
- [ ] Test search + category filter combination
- [ ] Test search + sorting combination

### Action Buttons

- [ ] Test View button → should navigate to detail page
- [ ] Test Edit button → should navigate to edit page
- [ ] Test Delete button → should open confirm dialog
- [ ] Test Publish button → should publish draft post
- [ ] Test Unpublish button → should unpublish published post

### Media Cleanup

- [ ] Create blog post with image
- [ ] Verify image exists in MinIO
- [ ] Verify media record exists in table
- [ ] Delete blog post
- [ ] Verify image removed from MinIO
- [ ] Verify media record removed from table

---

## Rebuild Commands

```bash
# 1. Rebuild content-service (search fix)
cd /Users/damarhuda/Latihan/damar-admin-cms/services/content-service
go build -o content-service cmd/main.go

# 2. Rebuild api-gateway (media cleanup fix)
cd /Users/damarhuda/Latihan/damar-admin-cms/services/api-gateway
go build -o api-gateway server.go

# 3. Frontend (no rebuild needed - hot reload in dev)
```

---

## Deployment Notes

### Backend Services to Deploy:

1. **content-service** - Search functionality fix
2. **api-gateway** - Media cleanup logic

### Frontend:

- No deployment needed (changes auto-compiled by Vite)

### Database:

- No migration needed

### MinIO/Storage:

- No changes needed

---

## Known Limitations & Future Improvements

### Current Limitations:

1. **UpdateBlogPost** belum handle media replacement

   - Saat user ganti featured image, old image belum di-delete
   - Need to implement same cleanup logic in UpdateBlogPost mutation

2. **Media cleanup is best-effort**

   - Menggunakan `_, _ = r.MediaClient.DeleteFile()` (ignoring errors)
   - Tidak ada transaction rollback jika media delete failed
   - Consider: Implement proper transaction handling or background cleanup job

3. **Search performance**
   - ILIKE search might be slow on large datasets
   - Consider: Add PostgreSQL full-text search or Elasticsearch for better performance

### Recommended Next Steps:

#### 1. Implement Media Replacement in UpdateBlogPost

```go
// In UpdateBlogPost resolver:
// If new image uploaded:
// 1. Query existing featured_image
// 2. Delete old image if exists
// 3. Upload new image
// 4. Update blog post
```

#### 2. Add Transaction Support

- Wrap media deletion and blog post deletion in transaction
- Rollback if any operation fails
- Ensure data consistency

#### 3. Background Cleanup Job

- Create scheduled job to find orphaned media
- Clean up files where model_type='blog_post' but blog post doesn't exist
- Run periodically (e.g., daily)

#### 4. Search Performance Optimization

- Add PostgreSQL full-text search indexes
- Implement search result caching
- Consider Elasticsearch integration for large datasets

#### 5. Frontend Improvements

- Add loading states for action buttons
- Add success animation after delete
- Implement optimistic updates for publish/unpublish

---

## Related Documentation

- [BLOG_EMAIL_NOTIFICATIONS.md](./BLOG_EMAIL_NOTIFICATIONS.md) - Email notification setup
- [CONTENT_RABBITMQ_TESTING.md](./CONTENT_RABBITMQ_TESTING.md) - Event-driven architecture
- Main project instructions: `/.github/copilot-instructions.md`

---

## Author & Date

- **Author**: Damar Huda (via GitHub Copilot)
- **Date**: December 15, 2024
- **Version**: 1.0
