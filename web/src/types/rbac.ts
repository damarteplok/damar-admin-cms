// RBAC Permission Types
export interface Permission {
  id: string
  name: string
  guardName: string
  createdAt: number
  updatedAt: number
}

export interface PermissionList {
  permissions: Permission[]
  total: number
  page: number
  perPage: number
}

export interface PermissionsResponse {
  permissions: {
    success: boolean
    message: string
    data: PermissionList
  }
}

export interface PermissionResponse {
  permission: {
    success: boolean
    message: string
    data: Permission
  }
}

export interface CreatePermissionInput {
  name: string
  guardName?: string
}

export interface UpdatePermissionInput {
  id: string
  name: string
  guardName?: string
}

export interface CreatePermissionResponse {
  createPermission: {
    success: boolean
    message: string
    data: Permission
  }
}

export interface UpdatePermissionResponse {
  updatePermission: {
    success: boolean
    message: string
    data: Permission
  }
}

export interface DeletePermissionResponse {
  deletePermission: {
    success: boolean
    message: string
  }
}

// RBAC Role Types
export interface Role {
  id: string
  name: string
  guardName: string
  createdAt: number
  updatedAt: number
}

export interface RoleWithPermissions {
  id: string
  name: string
  guardName: string
  permissions: Permission[]
  createdAt: number
  updatedAt: number
}

export interface RoleList {
  roles: Role[]
  total: number
  page: number
  perPage: number
}

export interface RolesResponse {
  roles: {
    success: boolean
    message: string
    data: RoleList
  }
}

export interface RoleResponse {
  role: {
    success: boolean
    message: string
    data: Role
  }
}

export interface RoleWithPermissionsResponse {
  roleWithPermissions: {
    success: boolean
    message: string
    data: RoleWithPermissions
  }
}

export interface CreateRoleInput {
  name: string
  guardName?: string
}

export interface UpdateRoleInput {
  id: string
  name: string
  guardName?: string
}

export interface CreateRoleResponse {
  createRole: {
    success: boolean
    message: string
    data: Role
  }
}

export interface UpdateRoleResponse {
  updateRole: {
    success: boolean
    message: string
    data: Role
  }
}

export interface DeleteRoleResponse {
  deleteRole: {
    success: boolean
    message: string
  }
}

export interface SyncRolePermissionsInput {
  roleId: string
  permissionIds: string[]
}

export interface SyncRolePermissionsResponse {
  syncRolePermissions: {
    success: boolean
    message: string
    data: RoleWithPermissions
  }
}

// User RBAC Types
export interface UserRolesResponse {
  userRoles: {
    success: boolean
    message: string
    roles: Role[]
  }
}

export interface UserPermissionsResponse {
  userPermissions: {
    success: boolean
    message: string
    permissions: Permission[]
  }
}

export interface CheckPermissionResponse {
  checkUserHasPermission: {
    hasPermission: boolean
  }
}

export interface CheckRoleResponse {
  checkUserHasRole: {
    hasRole: boolean
  }
}

// User Role Assignment Types
export interface AssignRoleToUserInput {
  userId: string
  roleId: string
  modelType?: string
}

export interface RevokeRoleFromUserInput {
  userId: string
  roleId: string
  modelType?: string
}

export interface SyncUserRolesInput {
  userId: string
  roleIds: string[]
  modelType?: string
}

export interface AssignRoleToUserResponse {
  assignRoleToUser: {
    success: boolean
    message: string
    roles: Role[]
  }
}

export interface RevokeRoleFromUserResponse {
  revokeRoleFromUser: {
    success: boolean
    message: string
    roles: Role[]
  }
}

export interface SyncUserRolesResponse {
  syncUserRoles: {
    success: boolean
    message: string
    roles: Role[]
  }
}

// User Permission Assignment Types
export interface AssignPermissionToUserInput {
  userId: string
  permissionId: string
  modelType?: string
}

export interface RevokePermissionFromUserInput {
  userId: string
  permissionId: string
  modelType?: string
}

export interface SyncUserPermissionsInput {
  userId: string
  permissionIds: string[]
  modelType?: string
}

export interface AssignPermissionToUserResponse {
  assignPermissionToUser: {
    success: boolean
    message: string
    permissions: Permission[]
  }
}

export interface RevokePermissionFromUserResponse {
  revokePermissionFromUser: {
    success: boolean
    message: string
    permissions: Permission[]
  }
}

export interface SyncUserPermissionsResponse {
  syncUserPermissions: {
    success: boolean
    message: string
    permissions: Permission[]
  }
}
