import { createFileRoute, Outlet } from '@tanstack/react-router'
import { PublicLayout } from '@/components/layout/PublicLayout'

export const Route = createFileRoute('/_layout')({
  component: PublicLayoutRoute,
})

function PublicLayoutRoute() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  )
}
