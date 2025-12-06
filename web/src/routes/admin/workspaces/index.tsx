import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/data-table'
import { Edit, Trash2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useQuery, useMutation } from 'urql'
import {
  GET_TENANTS_QUERY,
  DELETE_TENANT_MUTATION,
  type TenantsResponse,
  type DeleteTenantResponse,
  type Tenant,
} from '@/lib/graphql/tenant.graphql'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/admin/workspaces/')({
  component: WorkspacesPage,
})

function WorkspacesPage() {
  const [page] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Fetch tenants data
  const [result] = useQuery<TenantsResponse>({
    query: GET_TENANTS_QUERY,
    variables: {
      page,
      perPage,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
    // Use cache-and-network to keep previous data while fetching
    requestPolicy: 'cache-and-network',
  })

  const [, deleteTenantMutation] = useMutation<DeleteTenantResponse>(
    DELETE_TENANT_MUTATION,
  )

  const { data: queryData, fetching, error } = result

  // Track if this is the initial load (no data yet)
  const isInitialLoad = fetching && !queryData

  const handleDeleteTenant = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      const result = await deleteTenantMutation({ id })
      if (result.data?.deleteTenant.success) {
        // Refetch will happen automatically via URQL cache
        window.location.reload()
      } else {
        window.alert(
          result.data?.deleteTenant.message || 'Failed to delete workspace',
        )
      }
    }
  }

  const handleAddWorkspace = () => {
    // TODO: navigate to create page or open modal
    console.log('Add workspace clicked')
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to asc
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '⇅'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const columns = useMemo<ColumnDef<Tenant>[]>(
    () => [
      {
        accessorKey: 'name',
        header: () => (
          <button
            onClick={() => handleSort('name')}
            className="flex items-center gap-1 hover:text-foreground font-medium"
          >
            Name <span className="text-xs">{getSortIcon('name')}</span>
          </button>
        ),
        cell: (info) => (
          <div className="font-medium">{String(info.getValue())}</div>
        ),
      },
      {
        accessorKey: 'slug',
        header: () => (
          <button
            onClick={() => handleSort('slug')}
            className="flex items-center gap-1 hover:text-foreground font-medium"
          >
            Slug <span className="text-xs">{getSortIcon('slug')}</span>
          </button>
        ),
        cell: (info) => (
          <span className="text-muted-foreground">
            {String(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'domain',
        header: () => (
          <button
            onClick={() => handleSort('domain')}
            className="flex items-center gap-1 hover:text-foreground font-medium"
          >
            Domain <span className="text-xs">{getSortIcon('domain')}</span>
          </button>
        ),
        cell: (info) => {
          const domain = info.getValue()
          return domain ? String(domain) : '-'
        },
      },
      {
        accessorKey: 'createdAt',
        header: () => (
          <button
            onClick={() => handleSort('created_at')}
            className="flex items-center gap-1 hover:text-foreground font-medium"
          >
            Created <span className="text-xs">{getSortIcon('created_at')}</span>
          </button>
        ),
        cell: (info) => {
          const timestamp = Number(info.getValue())
          // Convert Unix timestamp (seconds) to milliseconds
          const date = new Date(timestamp * 1000)
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              title="Edit"
              className="p-1 rounded-md hover:bg-muted transition-colors"
              onClick={() => {
                // TODO: navigate to edit
                console.log('Edit workspace:', row.original.id)
              }}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              title="Delete"
              className="p-1 rounded-md hover:bg-muted transition-colors"
              onClick={() => handleDeleteTenant(row.original.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortBy, sortOrder],
  )

  // Only show full loading state on initial load
  // For subsequent searches, keep the table visible with previous data
  if (isInitialLoad) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
            <p className="text-muted-foreground mt-1">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || 'Failed to load workspaces'}
        </AlertDescription>
      </Alert>
    )
  }

  // Empty or error response
  if (!queryData?.tenants.success || !queryData?.tenants.data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {queryData?.tenants.message || 'Failed to load workspaces'}
        </AlertDescription>
      </Alert>
    )
  }

  const tenants = queryData.tenants.data.tenants

  return (
    <DataTable
      title="Workspaces"
      description="Manage your workspaces and team members"
      columns={columns}
      data={tenants}
      searchColumn="name"
      searchPlaceholder="Search by name, slug, or domain..."
      canAdd={true}
      addButtonTitle="Create workspace"
      onAddClick={handleAddWorkspace}
      serverSideSearch={true}
      onSearchChange={setSearch}
      isLoading={fetching}
      showRowNumber={true}
      currentPage={page}
      pageSize={perPage}
      onPageSizeChange={setPerPage}
      pageSizeOptions={[5, 10, 20, 50, 100]}
    />
  )
}
