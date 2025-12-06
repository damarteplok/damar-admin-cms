# Backend API Enhancement Proposal: Search & Sort for Tenants

## Overview

Proposal untuk menambahkan fitur **search** dan **sort** pada endpoint `GetAllTenants` agar frontend dapat melakukan filtering dan sorting di server-side, bukan client-side.

## Current Limitation

Saat ini endpoint `tenants` hanya support pagination:

```graphql
query GetAllTenants {
  tenants(page: 1, perPage: 10) {
    # Returns only first 10 tenants
  }
}
```

**Masalah:**

- Frontend hanya bisa search/sort dari 10 data yang di-load
- Jika ada 1000 tenants, user tidak bisa search tenant di page lain
- Tidak efisien untuk data besar

---

## Proposed Changes

### 1. Proto Definition Update

**File:** `proto/tenant.proto`

Update `GetAllTenantsRequest` message:

```protobuf
message GetAllTenantsRequest {
  int32 page = 1;
  int32 per_page = 2;

  // NEW: Search parameters
  string search = 3;           // Search query (akan search di name, slug, domain)

  // NEW: Sort parameters
  string sort_by = 4;          // Field to sort: "name", "slug", "created_at", etc
  string sort_order = 5;       // "asc" or "desc"
}
```

**Nilai default jika tidak diisi:**

- `search`: empty string (no filtering)
- `sort_by`: "created_at"
- `sort_order`: "desc"

---

### 2. Repository Layer Update

**File:** `services/tenant-service/internal/infrastructure/repository/tenant_repository.go`

Update method `GetAllTenants`:

```go
func (r *tenantRepository) GetAllTenants(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*domain.Tenant, int, error) {
    var tenants []*domain.Tenant
    var total int64

    // Base query
    query := r.db.WithContext(ctx).Model(&Tenant{}).Where("deleted_at IS NULL")

    // Search filter (if provided)
    if search != "" {
        searchPattern := "%" + search + "%"
        query = query.Where(
            "name ILIKE ? OR slug ILIKE ? OR domain ILIKE ?",
            searchPattern, searchPattern, searchPattern,
        )
    }

    // Count total (after search filter)
    if err := query.Count(&total).Error; err != nil {
        return nil, 0, fmt.Errorf("failed to count tenants: %w", err)
    }

    // Sort (default to created_at desc if not specified)
    if sortBy == "" {
        sortBy = "created_at"
    }
    if sortOrder == "" {
        sortOrder = "desc"
    }

    // Validate sort field (security: prevent SQL injection)
    allowedSortFields := map[string]bool{
        "id": true, "name": true, "slug": true,
        "domain": true, "created_at": true, "updated_at": true,
    }
    if !allowedSortFields[sortBy] {
        sortBy = "created_at"
    }

    // Validate sort order
    if sortOrder != "asc" && sortOrder != "desc" {
        sortOrder = "desc"
    }

    orderClause := fmt.Sprintf("%s %s", sortBy, sortOrder)

    // Fetch with pagination
    offset := (page - 1) * perPage
    if err := query.Order(orderClause).Limit(perPage).Offset(offset).Find(&tenants).Error; err != nil {
        return nil, 0, fmt.Errorf("failed to fetch tenants: %w", err)
    }

    // Convert to domain models
    domainTenants := make([]*domain.Tenant, len(tenants))
    for i, t := range tenants {
        domainTenants[i] = t.ToDomain()
    }

    return domainTenants, int(total), nil
}
```

---

### 3. Domain Interface Update

**File:** `services/tenant-service/internal/domain/tenant.go`

Update repository interface:

```go
type TenantRepository interface {
    // ... existing methods ...

    GetAllTenants(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*Tenant, int, error)
}
```

---

### 4. Service Layer Update

**File:** `services/tenant-service/internal/service/tenant_service.go`

Update service method:

```go
func (s *tenantService) GetAllTenants(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*domain.Tenant, int, error) {
    if page < 1 {
        page = 1
    }
    if perPage < 1 || perPage > 100 {
        perPage = 10
    }

    return s.repo.GetAllTenants(ctx, page, perPage, search, sortBy, sortOrder)
}
```

---

### 5. gRPC Handler Update

**File:** `services/tenant-service/internal/infrastructure/grpc/tenant_handler.go`

Update gRPC handler:

```go
func (h *TenantHandler) GetAllTenants(ctx context.Context, req *pb.GetAllTenantsRequest) (*pb.GetAllTenantsResponse, error) {
    page := int(req.Page)
    perPage := int(req.PerPage)

    // NEW: Extract search and sort params
    search := req.Search
    sortBy := req.SortBy
    sortOrder := req.SortOrder

    tenants, total, err := h.service.GetAllTenants(ctx, page, perPage, search, sortBy, sortOrder)
    if err != nil {
        return &pb.GetAllTenantsResponse{
            Success: false,
            Message: err.Error(),
        }, nil
    }

    // Convert to protobuf...
    // (rest of the code remains the same)
}
```

---

### 6. GraphQL Schema Update

**File:** `services/api-gateway/graph/schema.graphqls`

Update Query type:

```graphql
type Query {
  # ... existing queries ...

  tenants(
    page: Int!
    perPage: Int!
    search: String # NEW
    sortBy: String # NEW: "name", "slug", "created_at", etc
    sortOrder: String # NEW: "asc" or "desc"
  ): TenantsResponse!
}
```

---

### 7. GraphQL Resolver Update

**File:** `services/api-gateway/graph/schema.resolvers.go`

Update resolver:

```go
func (r *queryResolver) Tenants(ctx context.Context, page int, perPage int, search *string, sortBy *string, sortOrder *string) (*model.TenantsResponse, error) {
    // Extract optional params
    searchStr := ""
    if search != nil {
        searchStr = *search
    }

    sortByStr := "created_at"
    if sortBy != nil {
        sortByStr = *sortBy
    }

    sortOrderStr := "desc"
    if sortOrder != nil {
        sortOrderStr = *sortOrder
    }

    // Call gRPC service
    resp, err := r.TenantClient.GetAllTenants(ctx, &tenant_pb.GetAllTenantsRequest{
        Page:      int32(page),
        PerPage:   int32(perPage),
        Search:    searchStr,
        SortBy:    sortByStr,
        SortOrder: sortOrderStr,
    })

    // ... rest of the code
}
```

---

## Frontend Usage Examples

### Example 1: Search by name

```graphql
query SearchTenants {
  tenants(page: 1, perPage: 10, search: "acme") {
    success
    data {
      tenants {
        id
        name
        slug
      }
      total
    }
  }
}
```

### Example 2: Sort by name ascending

```graphql
query SortedTenants {
  tenants(page: 1, perPage: 10, sortBy: "name", sortOrder: "asc") {
    success
    data {
      tenants {
        id
        name
      }
    }
  }
}
```

### Example 3: Search + Sort

```graphql
query SearchAndSort {
  tenants(
    page: 1
    perPage: 10
    search: "corp"
    sortBy: "created_at"
    sortOrder: "desc"
  ) {
    success
    data {
      tenants {
        id
        name
        createdAt
      }
    }
  }
}
```

---

## Frontend TypeScript Integration

Update GraphQL query file:

**File:** `web/src/lib/graphql/tenant.graphql.ts`

```typescript
export const GET_TENANTS_QUERY = gql`
  query GetAllTenants(
    $page: Int!
    $perPage: Int!
    $search: String
    $sortBy: String
    $sortOrder: String
  ) {
    tenants(
      page: $page
      perPage: $perPage
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      success
      message
      data {
        tenants {
          id
          name
          slug
          domain
          createdBy
          createdAt
        }
        total
        page
        perPage
      }
    }
  }
`;
```

Usage in component:

```typescript
const [page, setPage] = useState(1);
const [search, setSearch] = useState("");
const [sortBy, setSortBy] = useState("created_at");
const [sortOrder, setSortOrder] = useState("desc");

const [result] = useQuery<TenantsResponse>({
  query: GET_TENANTS_QUERY,
  variables: {
    page,
    perPage: 10,
    search: search || undefined,
    sortBy,
    sortOrder,
  },
});
```

---

## Benefits

✅ **Server-side filtering**: Search across ALL data, not just current page
✅ **Server-side sorting**: Sort across ALL data efficiently
✅ **Better performance**: Database can use indexes for search/sort
✅ **Scalability**: Works well even with millions of records
✅ **Backward compatible**: Optional params (existing queries still work)

---

## Implementation Checklist

Backend Tasks:

- [ ] Update `proto/tenant.proto`
- [ ] Run `make proto` to regenerate protobuf code
- [ ] Update repository layer (`tenant_repository.go`)
- [ ] Update domain interface (`tenant.go`)
- [ ] Update service layer (`tenant_service.go`)
- [ ] Update gRPC handler (`tenant_handler.go`)
- [ ] Update GraphQL schema (`schema.graphqls`)
- [ ] Run `go run github.com/99designs/gqlgen generate` in api-gateway
- [ ] Update GraphQL resolver (`schema.resolvers.go`)
- [ ] Test dengan GraphQL Playground
- [ ] Update `GRAPHQL_TESTING.md` documentation

Frontend Tasks:

- [ ] Update GraphQL query (`tenant.graphql.ts`)
- [ ] Update component to use new parameters
- [ ] Test search functionality
- [ ] Test sort functionality
- [ ] Update DataTable component if needed

---

## Testing Scenarios

### Test Case 1: Search

```graphql
# Search for tenants with "test" in name/slug/domain
tenants(page: 1, perPage: 10, search: "test")
```

### Test Case 2: Sort by name

```graphql
# Sort tenants alphabetically
tenants(page: 1, perPage: 10, sortBy: "name", sortOrder: "asc")
```

### Test Case 3: Sort by date (newest first)

```graphql
# Default behavior
tenants(page: 1, perPage: 10, sortBy: "created_at", sortOrder: "desc")
```

### Test Case 4: Combined

```graphql
# Search "corp" and sort by name
tenants(page: 1, perPage: 10, search: "corp", sortBy: "name", sortOrder: "asc")
```

---

## Security Considerations

1. **SQL Injection Prevention**: Whitelist allowed sort fields
2. **Input Validation**: Validate sortOrder is only "asc" or "desc"
3. **Search Sanitization**: Use parameterized queries (GORM handles this)
4. **Rate Limiting**: Consider adding rate limit for search queries
5. **Max PerPage**: Enforce max 100 items per page

---

## Performance Optimization Recommendations

1. **Database Indexes**:

```sql
CREATE INDEX idx_tenants_name ON tenants(name) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_created_at ON tenants(created_at) WHERE deleted_at IS NULL;
```

2. **Full-Text Search** (Optional, for better search):

```sql
ALTER TABLE tenants ADD COLUMN search_vector tsvector;
CREATE INDEX idx_tenants_search ON tenants USING gin(search_vector);
```

3. **Caching**: Consider Redis cache for frequently accessed tenant lists

---

## Migration Path

**Phase 1**: Add optional parameters (backward compatible)

- Existing queries continue to work
- New queries can use search/sort

**Phase 2**: Update frontend to use new features

- Gradually update UI components
- Monitor performance

**Phase 3**: Optimize based on usage patterns

- Add indexes if needed
- Implement caching if needed

---

## Related Endpoints to Update (Future)

This pattern should also be applied to:

- `users` query (User service)
- `products` query (Product service)
- `subscriptions` query (Subscription service)

Keep the API consistent across all services.

---

## Questions for Discussion

1. Should we support multiple sort fields? e.g., `sortBy: ["name", "created_at"]`
2. Should we add filter by `createdBy` (created by specific user)?
3. Do we need date range filter for `created_at`?
4. Should search be case-sensitive or case-insensitive? (Proposed: case-insensitive with ILIKE)

---

**Priority**: High
**Effort**: Medium (2-3 hours backend + 1 hour frontend)
**Impact**: High (improves UX significantly for large datasets)
