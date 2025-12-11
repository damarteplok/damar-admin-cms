---
description: Create and run database migrations
---

# Database Migration Workflow

## Create New Migration

// turbo
```bash
make migrate-create service={service_name} name={description_of_change}
```

This creates two files in `services/{service-name}-service/cmd/migrate/migrations/`:
- `{timestamp}_{description}.up.sql` - Schema changes
- `{timestamp}_{description}.down.sql` - Rollback logic

## Edit Migration Files

### Up Migration
File: `{timestamp}_{description}.up.sql`

Write SQL to apply schema changes:
```sql
-- Example: Create table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Always add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
```

### Down Migration
File: `{timestamp}_{description}.down.sql`

Write SQL to rollback changes:
```sql
-- Example: Drop table
DROP INDEX IF EXISTS idx_users_email;
DROP TABLE IF EXISTS users;
```

## Run Migrations

### Apply Migrations (Up)

// turbo
```bash
make migrate-up service={service_name}
```

### Rollback Last Migration (Down)

```bash
make migrate-down service={service_name}
```

### Force Migration Version

If you need to force a specific version:
```bash
make migrate-force service={service_name} version={version_number}
```

## Best Practices

1. **Always test both up and down migrations**
   - Run `migrate-up` then `migrate-down` to verify rollback works

2. **Keep migrations atomic**
   - Each migration should do ONE thing
   - Use transactions when possible

3. **Never modify existing migrations**
   - Once applied to production, create a new migration instead

4. **Add proper indexes**
   - Index foreign keys and frequently queried columns
   - Consider composite indexes for multi-column queries

5. **Handle data migrations carefully**
   - Test with production-like data volumes
   - Consider using batches for large updates

6. **Document complex migrations**
   - Add comments explaining non-obvious changes
   - Link to relevant issues or design docs

## Multi-Tenancy Considerations

Since this is a multi-tenant platform:
- Each service owns its database tables
- No cross-service direct database access
- Use `tenant_id` columns for tenant isolation where appropriate
- Add indexes on tenant_id for query performance

## Troubleshooting

### Migration Fails
Check migration logs and fix the SQL, then:
```bash
make migrate-force service={service_name} version={current_version}
make migrate-up service={service_name}
```

### Check Current Version
```bash
make migrate-version service={service_name}
```

### View Migration Status
Check the `schema_migrations` table in the service database to see applied migrations.

## PostgreSQL Schema Structure

Database schema mirrors SaaSyKit (Laravel) structure:
- Use PostgreSQL-specific features when beneficial (JSONB, Arrays, UUID)
- Follow existing naming conventions
- Maintain referential integrity with foreign keys
