import { createFileRoute } from '@tanstack/react-router'
import { CrudListPage } from '@/components/crud'
import { workspacesConfig } from '@/features/workspaces'
import type { Tenant } from '@/types'
import type {
  CreateTenantInput,
  UpdateTenantInput,
} from '@/lib/graphql/tenant.graphql'

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
