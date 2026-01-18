import { createFileRoute } from '@tanstack/react-router'
import type { Tenant } from '@/types'
import type {
  CreateTenantInput,
  UpdateTenantInput,
} from '@/lib/graphql/tenant.graphql'
import { CrudListPage } from '@/components/crud'
import { workspacesConfig } from '@/features/workspaces'

export const Route = createFileRoute('/admin/workspaces/')({
  component: WorkspacesPage,
})

function WorkspacesPage() {
  return (
    <CrudListPage<Tenant, CreateTenantInput, UpdateTenantInput>
      config={workspacesConfig}
    />
  )
}
