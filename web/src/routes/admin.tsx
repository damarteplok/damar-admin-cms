import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layout/AdminLayout'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')

      if (!accessToken) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        })
      }
    }
  },
  component: AdminLayoutRoute,
})

function AdminLayoutRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
