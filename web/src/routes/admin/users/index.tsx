import { createFileRoute } from '@tanstack/react-router'

import { Edit, Plus, Trash2 } from 'lucide-react'
import { AdminLayout } from '../../../components/layout/AdminLayout'

export const Route = createFileRoute('/admin/users/')({
  component: UsersPage,
})



function UsersPage() {
  return (
    <AdminLayout>
      ini halaman admin users page
    </AdminLayout>
  )
}
