import { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'urql'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '@/lib/utils/date'

import {
  GET_TENANT_USERS_QUERY,
  ADD_USER_TO_TENANT_MUTATION,
  REMOVE_USER_FROM_TENANT_MUTATION,
  UPDATE_USER_ROLE_MUTATION,
} from '@/lib/graphql/tenant.graphql'
import {
  SEARCH_USERS_QUERY,
  ME_QUERY,
  GET_USER_BY_ID_QUERY,
} from '@/lib/graphql/auth.graphql'
import type {
  AddUserToTenantInput,
  UpdateUserRoleInput,
} from '@/lib/graphql/tenant.graphql'
import type { UserByIdResponse } from '@/types'

import { Button } from '@/components/ui/button'
import { DataTableClient } from '@/components/data-table-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableActions } from '@/components/ui/data-table-actions'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { UserPlus, Trash2, Edit, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'

interface TenantUser {
  id: string
  userId: string
  tenantId: string
  email: string
  role: string
  isDefault: boolean
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
}

interface WorkspaceUsersTableProps {
  workspaceId: string
  readOnly?: boolean
}

export function WorkspaceUsersTable({
  workspaceId,
  readOnly = false,
}: WorkspaceUsersTableProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null)
  const [viewUserId, setViewUserId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState<
    'owner' | 'admin' | 'member' | 'guest'
  >('member')

  // Get current user
  const [currentUserResult] = useQuery({
    query: ME_QUERY,
  })

  // Fetch tenant users
  const [tenantUsersResult, refetchTenantUsers] = useQuery({
    query: GET_TENANT_USERS_QUERY,
    variables: { tenantId: workspaceId },
    requestPolicy: 'cache-and-network',
  })

  // Search users
  const [searchUsersResult] = useQuery({
    query: SEARCH_USERS_QUERY,
    variables: {
      query: searchQuery || 'a', // Default search to get some results
      page: 1,
      perPage: 10,
    },
    pause: !addUserDialogOpen, // Only fetch when dialog is open
  })

  // Get user detail for drawer
  const [userDetailResult] = useQuery<UserByIdResponse>({
    query: GET_USER_BY_ID_QUERY,
    variables: { id: viewUserId },
    pause: !viewDrawerOpen || !viewUserId,
    requestPolicy: 'cache-and-network',
  })

  // Mutations
  const [, addUserMutation] = useMutation(ADD_USER_TO_TENANT_MUTATION)
  const [, removeUserMutation] = useMutation(REMOVE_USER_FROM_TENANT_MUTATION)
  const [, updateRoleMutation] = useMutation(UPDATE_USER_ROLE_MUTATION)

  const tenantUsers = tenantUsersResult.data?.tenantUsers?.data || []
  const searchedUsers = searchUsersResult.data?.searchUsers?.data?.users || []

  // Filter out users already in workspace
  const availableUsers = searchedUsers.filter(
    (user: User) =>
      !tenantUsers.some((tu: TenantUser) => tu.userId === user.id),
  )

  const handleAddUser = async () => {
    if (!selectedUserId) {
      toast.error(
        t('workspaces.users.select_user_required', {
          defaultValue: 'Please select a user',
        }),
      )
      return
    }

    const input: AddUserToTenantInput = {
      userId: selectedUserId,
      tenantId: workspaceId,
      role: selectedRole,
      isDefault: false,
    }

    const result = await addUserMutation({ input })

    if (result.data?.addUserToTenant.success) {
      toast.success(
        t('workspaces.users.user_added', {
          defaultValue: 'User added successfully',
        }),
      )
      setAddUserDialogOpen(false)
      setSelectedUserId('')
      setSearchQuery('')
      refetchTenantUsers({ requestPolicy: 'network-only' })
    } else {
      toast.error(
        result.data?.addUserToTenant.message ||
          t('workspaces.users.user_add_failed', {
            defaultValue: 'Failed to add user',
          }),
      )
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    const input: UpdateUserRoleInput = {
      userId: selectedUser.userId,
      tenantId: workspaceId,
      role: selectedRole,
    }

    const result = await updateRoleMutation({ input })

    if (result.data?.updateUserRole.success) {
      toast.success(
        t('workspaces.users.role_updated', {
          defaultValue: 'User role updated successfully',
        }),
      )
      setEditUserDialogOpen(false)
      setSelectedUser(null)
      refetchTenantUsers({ requestPolicy: 'network-only' })
    } else {
      toast.error(
        result.data?.updateUserRole.message ||
          t('workspaces.users.role_update_failed', {
            defaultValue: 'Failed to update role',
          }),
      )
    }
  }

  const handleRemoveUser = async () => {
    if (!selectedUser) return

    const result = await removeUserMutation({
      userId: selectedUser.userId,
      tenantId: workspaceId,
    })

    if (result.data?.removeUserFromTenant.success) {
      toast.success(
        t('workspaces.users.user_removed', {
          defaultValue: 'User removed successfully',
        }),
      )
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      refetchTenantUsers({ requestPolicy: 'network-only' })
    } else {
      toast.error(
        result.data?.removeUserFromTenant.message ||
          t('workspaces.users.user_remove_failed', {
            defaultValue: 'Failed to remove user',
          }),
      )
    }
  }

  const openEditDialog = (user: TenantUser) => {
    setSelectedUser(user)
    setSelectedRole(user.role as 'owner' | 'admin' | 'member' | 'guest')
    setEditUserDialogOpen(true)
  }

  const openDeleteDialog = (user: TenantUser) => {
    const currentUserId = currentUserResult.data?.me?.data?.id
    if (currentUserId && user.userId === currentUserId) {
      toast.error(
        t('workspaces.users.cannot_remove_self', {
          defaultValue: 'You cannot remove yourself from the workspace',
        }),
      )
      return
    }
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const openViewDrawer = (user: TenantUser) => {
    setViewUserId(user.userId)
    setViewDrawerOpen(true)
  }

  const columns: ColumnDef<TenantUser>[] = useMemo(
    () => [
      {
        accessorKey: 'email',
        header: t('workspaces.users.columns.email', { defaultValue: 'Email' }),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.email}</span>
            <span className="text-xs text-muted-foreground font-mono">
              ID: {row.original.userId}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: t('workspaces.users.columns.role', { defaultValue: 'Role' }),
        cell: ({ row }) => {
          const role = row.original.role
          const variant =
            role === 'owner'
              ? 'default'
              : role === 'admin'
                ? 'secondary'
                : 'outline'
          return (
            <Badge variant={variant} className="capitalize">
              {role}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('workspaces.users.columns.added_at', {
          defaultValue: 'Added At',
        }),
        cell: ({ row }) => {
          const timestamp = Number(row.original.createdAt)
          return <span className="text-sm">{formatDateTime(timestamp)}</span>
        },
      },
      {
        id: 'actions',
        header: t('workspaces.users.columns.actions', {
          defaultValue: 'Actions',
        }),
        cell: ({ row }) => (
          <DataTableActions
            item={row.original}
            actions={[
              {
                label: t('workspaces.users.actions.view_user', {
                  defaultValue: 'View User',
                }),
                onClick: () => openViewDrawer(row.original),
                icon: Eye,
              },
              ...(!readOnly
                ? [
                    {
                      label: t('workspaces.users.actions.edit_role', {
                        defaultValue: 'Edit Role',
                      }),
                      onClick: () => openEditDialog(row.original),
                      icon: Edit,
                    },
                    {
                      label: t('workspaces.users.actions.remove', {
                        defaultValue: 'Remove',
                      }),
                      onClick: () => openDeleteDialog(row.original),
                      icon: Trash2,
                      variant: 'destructive' as const,
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [readOnly, t],
  )

  return (
    <div className="space-y-4">
      <DataTableClient
        title={t('workspaces.users.title', { defaultValue: 'Workspace Users' })}
        columns={columns}
        data={tenantUsers}
        searchColumn="email"
        searchPlaceholder={t('workspaces.users.search_placeholder', {
          defaultValue: 'Search by email...',
        })}
        canAdd={!readOnly}
        addButtonTitle={t('workspaces.users.add_button', {
          defaultValue: 'Add User',
        })}
        onAddClick={() => setAddUserDialogOpen(true)}
        isLoading={tenantUsersResult.fetching}
        showRowNumber={false}
      />

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('workspaces.users.add_title', {
                defaultValue: 'Add User to Workspace',
              })}
            </DialogTitle>
            <DialogDescription>
              {t('workspaces.users.add_description', {
                defaultValue:
                  'Search and select a user to add to this workspace',
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('workspaces.users.search_email', {
                  defaultValue: 'Search by Email',
                })}
              </label>
              <Input
                placeholder={t('workspaces.users.search_placeholder', {
                  defaultValue: 'Search by name or email...',
                })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('workspaces.users.select_user', {
                  defaultValue: 'Select User',
                })}
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t('workspaces.users.select_user_placeholder', {
                      defaultValue: 'Select a user',
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {t('workspaces.users.no_users_found', {
                        defaultValue: 'No users found',
                      })}
                    </div>
                  ) : (
                    availableUsers.map((user: User) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={selectedRole}
                onValueChange={(value: string) =>
                  setSelectedRole(
                    value as 'owner' | 'admin' | 'member' | 'guest',
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddUserDialogOpen(false)
                setSelectedUserId('')
                setSearchQuery('')
              }}
            >
              {t('workspaces.form.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button onClick={handleAddUser} disabled={!selectedUserId}>
              <UserPlus className="mr-2 h-4 w-4" />
              {t('workspaces.users.add_button', { defaultValue: 'Add User' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role of {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={selectedRole}
                onValueChange={(value: string) =>
                  setSelectedRole(
                    value as 'owner' | 'admin' | 'member' | 'guest',
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditUserDialogOpen(false)
                setSelectedUser(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              <Edit className="mr-2 h-4 w-4" />
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleRemoveUser}
        title="Remove User from Workspace?"
        description={
          <>
            Are you sure you want to remove{' '}
            <span className="font-semibold">{selectedUser?.email}</span> from
            this workspace? They will lose access to all workspace resources.
          </>
        }
        confirmText="Remove"
        variant="destructive"
      />

      {/* View User Drawer */}
      <Drawer
        open={viewDrawerOpen}
        onOpenChange={setViewDrawerOpen}
        direction={isMobile ? 'bottom' : 'right'}
      >
        <DrawerContent
          className={
            isMobile ? 'h-[85vh]' : 'h-full w-[50vw] 2xl:w-[40vw] 3xl:w-[30vw]'
          }
        >
          <DrawerHeader>
            <DrawerTitle>
              {t('workspaces.users.view_drawer.title', {
                defaultValue: 'User Details',
              })}
            </DrawerTitle>
            <DrawerDescription>
              {userDetailResult.fetching
                ? t('workspaces.users.view_drawer.loading', {
                    defaultValue: 'Loading user details...',
                  })
                : userDetailResult.data?.user.data?.email}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            {userDetailResult.fetching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : userDetailResult.error ||
              !userDetailResult.data?.user.success ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  {userDetailResult.data?.user.message ||
                    t('workspaces.users.view_drawer.error', {
                      defaultValue: 'Failed to load user details',
                    })}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                    {t('workspaces.users.view_drawer.basic_info', {
                      defaultValue: 'Basic Information',
                    })}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('workspaces.users.view_drawer.user_id', {
                          defaultValue: 'User ID',
                        })}
                      </label>
                      <p className="mt-1 font-mono text-sm">
                        {userDetailResult.data.user.data.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('workspaces.form.workspace_name', {
                          defaultValue: 'Name',
                        })}
                      </label>
                      <p className="mt-1 text-sm">
                        {userDetailResult.data.user.data.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('workspaces.users.columns.email', {
                          defaultValue: 'Email',
                        })}
                      </label>
                      <p className="mt-1 text-sm">
                        {userDetailResult.data.user.data.email}
                      </p>
                    </div>
                    {userDetailResult.data.user.data.publicName && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          {t('workspaces.users.view_drawer.public_name', {
                            defaultValue: 'Public Name',
                          })}
                        </label>
                        <p className="mt-1 text-sm">
                          {userDetailResult.data.user.data.publicName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                {(userDetailResult.data.user.data.phoneNumber ||
                  userDetailResult.data.user.data.position) && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                      {t('workspaces.users.view_drawer.contact_info', {
                        defaultValue: 'Contact Information',
                      })}
                    </h3>
                    <div className="space-y-3">
                      {userDetailResult.data.user.data.phoneNumber && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            {t('workspaces.users.view_drawer.phone_number', {
                              defaultValue: 'Phone Number',
                            })}
                          </label>
                          <p className="mt-1 text-sm">
                            {userDetailResult.data.user.data.phoneNumber}
                          </p>
                        </div>
                      )}
                      {userDetailResult.data.user.data.position && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            {t('workspaces.users.view_drawer.position', {
                              defaultValue: 'Position',
                            })}
                          </label>
                          <p className="mt-1 text-sm">
                            {userDetailResult.data.user.data.position}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Account Status */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                    {t('workspaces.users.view_drawer.account_status', {
                      defaultValue: 'Account Status',
                    })}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('workspaces.users.view_drawer.admin_status', {
                          defaultValue: 'Admin Status',
                        })}
                      </label>
                      <p className="mt-1 text-sm">
                        <Badge
                          variant={
                            userDetailResult.data.user.data.isAdmin
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {userDetailResult.data.user.data.isAdmin
                            ? t('workspaces.users.view_drawer.yes', {
                                defaultValue: 'Yes',
                              })
                            : t('workspaces.users.view_drawer.no', {
                                defaultValue: 'No',
                              })}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('workspaces.users.view_drawer.blocked_status', {
                          defaultValue: 'Blocked Status',
                        })}
                      </label>
                      <p className="mt-1 text-sm">
                        <Badge
                          variant={
                            userDetailResult.data.user.data.isBlocked
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {userDetailResult.data.user.data.isBlocked
                            ? t('workspaces.users.view_drawer.yes', {
                                defaultValue: 'Yes',
                              })
                            : t('workspaces.users.view_drawer.no', {
                                defaultValue: 'No',
                              })}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('workspaces.users.view_drawer.email_verified', {
                          defaultValue: 'Email Verified',
                        })}
                      </label>
                      <p className="mt-1 text-sm">
                        <Badge
                          variant={
                            userDetailResult.data.user.data.emailVerified
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {userDetailResult.data.user.data.emailVerified
                            ? t('workspaces.users.view_drawer.yes', {
                                defaultValue: 'Yes',
                              })
                            : t('workspaces.users.view_drawer.no', {
                                defaultValue: 'No',
                              })}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                    {t('workspaces.users.view_drawer.timestamps', {
                      defaultValue: 'Timestamps',
                    })}
                  </h3>
                  <div className="space-y-3">
                    {userDetailResult.data.user.data.emailVerifiedAt && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          {t('workspaces.users.view_drawer.email_verified_at', {
                            defaultValue: 'Email Verified At',
                          })}
                        </label>
                        <p className="mt-1 text-sm">
                          {formatDateTime(
                            userDetailResult.data.user.data.emailVerifiedAt,
                          )}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('workspaces.users.view_drawer.last_login', {
                          defaultValue: 'Last Login',
                        })}
                      </label>
                      <p className="mt-1 text-sm">
                        {userDetailResult.data.user.data.lastLoginAt
                          ? formatDateTime(
                              userDetailResult.data.user.data.lastLoginAt,
                            )
                          : t('workspaces.users.view_drawer.never', {
                              defaultValue: 'Never',
                            })}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('workspaces.users.view_drawer.created_at', {
                          defaultValue: 'Created At',
                        })}
                      </label>
                      <p className="mt-1 text-sm">
                        {formatDateTime(
                          userDetailResult.data.user.data.createdAt,
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('workspaces.users.view_drawer.updated_at', {
                          defaultValue: 'Updated At',
                        })}
                      </label>
                      <p className="mt-1 text-sm">
                        {formatDateTime(
                          userDetailResult.data.user.data.updatedAt,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">
                {t('workspaces.users.view_drawer.close', {
                  defaultValue: 'Close',
                })}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
