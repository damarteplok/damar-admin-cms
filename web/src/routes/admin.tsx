import { AdminLayout } from '@/components/layout/AdminLayout'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  component: AdminLayoutRoute,
})

function AdminLayoutRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
