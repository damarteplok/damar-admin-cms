import type { CrudConfig, CrudTranslations } from '@/types'
import type { Tenant } from '@/types'
import {
  CreateTenantInput,
  UpdateTenantInput,
} from '@/lib/graphql/tenant.graphql'

import {
  GET_TENANTS_QUERY,
  GET_TENANT_QUERY,
  CREATE_TENANT_MUTATION,
  UPDATE_TENANT_MUTATION,
  DELETE_TENANT_MUTATION,
} from '@/lib/graphql/tenant.graphql'

import { createWorkspaceColumns } from '@/components/features/admin/workspaces/workspace-columns'
import { WorkspaceForm } from '@/components/features/admin/workspaces/workspace-form'

/**
 * CRUD Configuration for Workspaces (uses Tenant model internally)
 */
export const workspacesConfig: CrudConfig<
  Tenant,
  CreateTenantInput,
  UpdateTenantInput
> = {
  resourceName: 'workspaces',
  dataKey: 'tenants',
  basePath: '/admin/workspaces',

  queries: {
    list: GET_TENANTS_QUERY,
    get: GET_TENANT_QUERY,
    create: CREATE_TENANT_MUTATION,
    update: UPDATE_TENANT_MUTATION,
    delete: DELETE_TENANT_MUTATION,
    // Explicit keys since workspaces uses Tenant model
    getKey: 'tenant',
    createKey: 'createTenant',
    updateKey: 'updateTenant',
    deleteKey: 'deleteTenant',
  },

  createColumns: createWorkspaceColumns,
  FormComponent: WorkspaceForm,

  translations: {
    title: 'Workspaces',
    searchPlaceholder: 'Search workspaces...',
    createButton: 'Create workspace',
    failedToLoad: 'Failed to load workspaces',
    errorOccurred:
      'An error occurred while fetching workspaces. Please try again.',
    unableToFetch: 'Unable to fetch workspaces data.',

    deleteTitle: 'Delete Workspace?',
    deleteDescription:
      'This action cannot be undone. This will permanently delete the workspace',
    deleteConfirm: 'Delete',

    createTitle: 'Create Workspace',
    createDescription: 'Create a new workspace',
    editTitle: 'Edit Workspace',
    editDescription: 'Update workspace details',

    viewTitle: 'Workspace Details',
    viewDescription: 'View workspace details',
    notFound: 'Workspace Not Found',
    loadFailed: 'Failed to load workspace',

    createdSuccess: 'Workspace created successfully!',
    createdAnother: 'Workspace created! Create another one.',
    createFailed: 'Failed to create workspace',
    updatedSuccess: 'Workspace updated successfully!',
    updateFailed: 'Failed to update workspace',
    deletedSuccess: 'Workspace deleted',
    deleteFailed: 'Failed to delete workspace',
  } as Partial<CrudTranslations>,

  defaultSort: {
    field: 'created_at',
    order: 'desc',
  },

  searchColumn: 'name',
  skeletonColumns: 5,
}

/**
 * Transform Tenant model to form initial data
 */
export function transformWorkspaceToFormData(
  tenant: Tenant,
): Partial<CreateTenantInput> {
  return {
    name: tenant.name,
    slug: tenant.slug,
    domain: tenant.domain || undefined,
  }
}
