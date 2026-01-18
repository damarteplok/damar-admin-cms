import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

import {
  GET_ROLE_WITH_PERMISSIONS_QUERY,
  GET_PERMISSIONS_QUERY,
  SYNC_ROLE_PERMISSIONS_MUTATION,
} from '@/lib/graphql/rbac.graphql'
import type {
  RoleWithPermissionsResponse,
  PermissionsResponse,
  SyncRolePermissionsResponse,
  Permission,
} from '@/types'

import { ArrowLeft, Loader2, Shield, Check, X, Search } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/admin/roles/$id/permissions')({
  component: ManageRolePermissionsPage,
})

function ManageRolePermissionsPage() {
  const { id } = useParams({ from: '/admin/roles/$id/permissions' })
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch role with current permissions
  const [roleResult] = useQuery<RoleWithPermissionsResponse>({
    query: GET_ROLE_WITH_PERMISSIONS_QUERY,
    variables: { id },
  })

  // Fetch all permissions
  const [permissionsResult] = useQuery<PermissionsResponse>({
    query: GET_PERMISSIONS_QUERY,
    variables: {
      page: 1,
      perPage: 1000, // Get all permissions
    },
  })

  const [, syncPermissionsMutation] = useMutation<SyncRolePermissionsResponse>(
    SYNC_ROLE_PERMISSIONS_MUTATION,
  )

  const {
    data: roleData,
    fetching: roleFetching,
    error: roleError,
  } = roleResult
  const { data: permissionsData, fetching: permissionsFetching } =
    permissionsResult

  // Initialize selected permissions when role data loads
  useEffect(() => {
    if (
      roleData?.roleWithPermissions.success &&
      roleData.roleWithPermissions.data?.permissions
    ) {
      const currentPermissionIds =
        roleData.roleWithPermissions.data.permissions.map((p) => p.id)
      setSelectedPermissionIds(currentPermissionIds)
    }
  }, [roleData])

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId)
      }
      return [...prev, permissionId]
    })
  }

  const handleSelectAll = () => {
    if (
      permissionsData?.permissions.success &&
      permissionsData.permissions.data
    ) {
      const allIds = permissionsData.permissions.data.permissions.map(
        (p) => p.id,
      )
      setSelectedPermissionIds(allIds)
    }
  }

  const handleDeselectAll = () => {
    setSelectedPermissionIds([])
  }

  const handleSavePermissions = async () => {
    setIsSubmitting(true)
    try {
      const result = await syncPermissionsMutation({
        input: {
          roleId: id,
          permissionIds: selectedPermissionIds,
        },
      })

      if (result.data?.syncRolePermissions.success) {
        toast.success(
          t('roles.permissions.sync_success', {
            defaultValue: 'Permissions updated successfully!',
          }),
        )
        navigate({ to: `/admin/roles/${id}` })
      } else {
        toast.error(
          result.data?.syncRolePermissions.message ||
            t('roles.permissions.sync_failed', {
              defaultValue: 'Failed to update permissions',
            }),
        )
      }
    } catch (error) {
      toast.error(
        t('roles.permissions.sync_error', {
          defaultValue: 'An error occurred while updating permissions',
        }),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate({ to: `/admin/roles/${id}` })
  }

  const isLoading = roleFetching || permissionsFetching

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (
    roleError ||
    !roleData?.roleWithPermissions.success ||
    !roleData?.roleWithPermissions.data
  ) {
    return (
      <ErrorState
        title={t('roles.not_found', { defaultValue: 'Role Not Found' })}
        description={
          roleError?.message ||
          roleData?.roleWithPermissions.message ||
          t('roles.load_failed', { defaultValue: 'Failed to load role' })
        }
        actionLabel={t('common.go_back', { defaultValue: 'Go Back' })}
        onAction={() => navigate({ to: '/admin/roles' })}
      />
    )
  }

  const role = roleData.roleWithPermissions.data
  const allPermissions = permissionsData?.permissions.data?.permissions || []

  // Filter permissions by search term
  const filteredPermissions = allPermissions.filter((permission) =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Group permissions by prefix (e.g., "users.", "products.", etc.)
  const groupedPermissions = filteredPermissions.reduce<
    Record<string, Permission[]>
  >((acc, permission) => {
    const parts = permission.name.split('.')
    const group = parts.length > 1 ? parts[0] : 'general'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(permission)
    return acc
  }, {})

  const sortedGroups = Object.keys(groupedPermissions).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('roles.permissions.title', {
                defaultValue: 'Manage Permissions',
              })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('roles.permissions.description', {
                defaultValue: 'Assign or remove permissions for role',
              })}{' '}
              <span className="font-semibold text-foreground">{role.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Shield className="mr-1 h-3 w-3" />
            {selectedPermissionIds.length}{' '}
            {t('roles.permissions.selected', { defaultValue: 'selected' })}
          </Badge>
        </div>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('roles.permissions.search_placeholder', {
                  defaultValue: 'Search permissions...',
                })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                <Check className="mr-1 h-3 w-3" />
                {t('roles.permissions.select_all', {
                  defaultValue: 'Select All',
                })}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                <X className="mr-1 h-3 w-3" />
                {t('roles.permissions.deselect_all', {
                  defaultValue: 'Deselect All',
                })}
              </Button>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {sortedGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">
                {t('roles.permissions.no_permissions', {
                  defaultValue: 'No permissions found',
                })}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm
                  ? t('roles.permissions.no_search_results', {
                      defaultValue: 'No permissions match your search.',
                    })
                  : t('roles.permissions.create_first', {
                      defaultValue: 'Create some permissions first.',
                    })}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedGroups.map((group) => (
                <div key={group}>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {groupedPermissions[group].map((permission) => {
                      const isSelected = selectedPermissionIds.includes(
                        permission.id,
                      )
                      return (
                        <label
                          key={permission.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleTogglePermission(permission.id)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {permission.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {permission.guardName}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Footer */}
      <div className="flex items-center gap-3 pt-4">
        <Button onClick={handleSavePermissions} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('roles.permissions.save', { defaultValue: 'Save Permissions' })}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </div>
  )
}
