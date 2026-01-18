import { gql } from 'urql'

// Permission Queries
export const GET_PERMISSIONS_QUERY = gql`
  query GetPermissions(
    $page: Int
    $perPage: Int
    $search: String
    $sortBy: String
    $sortOrder: String
    $guardName: String
  ) {
    permissions(
      page: $page
      perPage: $perPage
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
      guardName: $guardName
    ) {
      success
      message
      data {
        permissions {
          id
          name
          guardName
          createdAt
          updatedAt
        }
        total
        page
        perPage
      }
    }
  }
`

export const GET_PERMISSION_QUERY = gql`
  query GetPermission($id: ID!) {
    permission(id: $id) {
      success
      message
      data {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

// Role Queries
export const GET_ROLES_QUERY = gql`
  query GetRoles(
    $page: Int
    $perPage: Int
    $search: String
    $sortBy: String
    $sortOrder: String
    $guardName: String
  ) {
    roles(
      page: $page
      perPage: $perPage
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
      guardName: $guardName
    ) {
      success
      message
      data {
        roles {
          id
          name
          guardName
          createdAt
          updatedAt
        }
        total
        page
        perPage
      }
    }
  }
`

export const GET_ROLE_QUERY = gql`
  query GetRole($id: ID!) {
    role(id: $id) {
      success
      message
      data {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const GET_ROLE_WITH_PERMISSIONS_QUERY = gql`
  query GetRoleWithPermissions($id: ID!) {
    roleWithPermissions(id: $id) {
      success
      message
      data {
        id
        name
        guardName
        permissions {
          id
          name
          guardName
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
    }
  }
`

// User RBAC Queries
export const GET_USER_ROLES_QUERY = gql`
  query GetUserRoles($userId: ID!, $modelType: String) {
    userRoles(userId: $userId, modelType: $modelType) {
      success
      message
      roles {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const GET_USER_PERMISSIONS_QUERY = gql`
  query GetUserPermissions($userId: ID!, $modelType: String) {
    userPermissions(userId: $userId, modelType: $modelType) {
      success
      message
      permissions {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const CHECK_USER_HAS_PERMISSION_QUERY = gql`
  query CheckUserHasPermission(
    $userId: ID!
    $permissionName: String!
    $modelType: String
  ) {
    checkUserHasPermission(
      userId: $userId
      permissionName: $permissionName
      modelType: $modelType
    ) {
      hasPermission
    }
  }
`

export const CHECK_USER_HAS_ROLE_QUERY = gql`
  query CheckUserHasRole($userId: ID!, $roleName: String!, $modelType: String) {
    checkUserHasRole(
      userId: $userId
      roleName: $roleName
      modelType: $modelType
    ) {
      hasRole
    }
  }
`

// Permission Mutations
export const CREATE_PERMISSION_MUTATION = gql`
  mutation CreatePermission($input: CreatePermissionInput!) {
    createPermission(input: $input) {
      success
      message
      data {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const UPDATE_PERMISSION_MUTATION = gql`
  mutation UpdatePermission($input: UpdatePermissionInput!) {
    updatePermission(input: $input) {
      success
      message
      data {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const DELETE_PERMISSION_MUTATION = gql`
  mutation DeletePermission($id: ID!) {
    deletePermission(id: $id) {
      success
      message
    }
  }
`

// Role Mutations
export const CREATE_ROLE_MUTATION = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      success
      message
      data {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const UPDATE_ROLE_MUTATION = gql`
  mutation UpdateRole($input: UpdateRoleInput!) {
    updateRole(input: $input) {
      success
      message
      data {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const DELETE_ROLE_MUTATION = gql`
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id) {
      success
      message
    }
  }
`

export const SYNC_ROLE_PERMISSIONS_MUTATION = gql`
  mutation SyncRolePermissions($input: SyncRolePermissionsInput!) {
    syncRolePermissions(input: $input) {
      success
      message
      data {
        id
        name
        guardName
        permissions {
          id
          name
          guardName
        }
        createdAt
        updatedAt
      }
    }
  }
`

// User Role Mutations
export const ASSIGN_ROLE_TO_USER_MUTATION = gql`
  mutation AssignRoleToUser($input: AssignRoleToUserInput!) {
    assignRoleToUser(input: $input) {
      success
      message
      roles {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const REVOKE_ROLE_FROM_USER_MUTATION = gql`
  mutation RevokeRoleFromUser($input: RevokeRoleFromUserInput!) {
    revokeRoleFromUser(input: $input) {
      success
      message
      roles {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const SYNC_USER_ROLES_MUTATION = gql`
  mutation SyncUserRoles($input: SyncUserRolesInput!) {
    syncUserRoles(input: $input) {
      success
      message
      roles {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

// User Permission Mutations
export const ASSIGN_PERMISSION_TO_USER_MUTATION = gql`
  mutation AssignPermissionToUser($input: AssignPermissionToUserInput!) {
    assignPermissionToUser(input: $input) {
      success
      message
      permissions {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const REVOKE_PERMISSION_FROM_USER_MUTATION = gql`
  mutation RevokePermissionFromUser($input: RevokePermissionFromUserInput!) {
    revokePermissionFromUser(input: $input) {
      success
      message
      permissions {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`

export const SYNC_USER_PERMISSIONS_MUTATION = gql`
  mutation SyncUserPermissions($input: SyncUserPermissionsInput!) {
    syncUserPermissions(input: $input) {
      success
      message
      permissions {
        id
        name
        guardName
        createdAt
        updatedAt
      }
    }
  }
`
