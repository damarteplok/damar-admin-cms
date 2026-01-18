import { Eye, Pencil, Shield, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Role } from '@/types'
import type {
  DataTableAction} from '@/components/ui/data-table-actions';
import type { TFunction } from 'i18next'
import {
  DataTableActions
} from '@/components/ui/data-table-actions'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils/date'

interface ColumnProps {
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onView: (id: string) => void
  onManagePermissions?: (id: string) => void
  t: TFunction
}

export const createRoleColumns = ({
  onDelete,
  onEdit,
  onView,
  onManagePermissions,
  t,
}: ColumnProps): Array<ColumnDef<Role>> => [
  {
    accessorKey: 'name',
    header: t('roles.columns.name', { defaultValue: 'Name' }),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('name')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'guardName',
    header: t('roles.columns.guard_name', { defaultValue: 'Guard' }),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-mono text-xs">
          {row.getValue('guardName')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: t('roles.columns.created_at', { defaultValue: 'Created At' }),
    cell: ({ row }) => {
      const timestamp = Number(row.getValue('createdAt'))
      return <span className="text-sm">{formatDateTime(timestamp)}</span>
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">
        {t('roles.columns.actions', { defaultValue: 'Actions' })}
      </div>
    ),
    cell: ({ row }) => {
      const role = row.original

      const actions: Array<DataTableAction<Role>> = [
        {
          label: t('roles.actions.view_details', {
            defaultValue: 'View Details',
          }),
          icon: Eye,
          onClick: (role) => onView(role.id),
        },
        ...(onManagePermissions
          ? [
              {
                label: t('roles.actions.manage_permissions', {
                  defaultValue: 'Manage Permissions',
                }),
                icon: Shield,
                onClick: (role: Role) => onManagePermissions(role.id),
              },
            ]
          : []),
        { separator: true },
        {
          label: t('roles.actions.edit', { defaultValue: 'Edit' }),
          icon: Pencil,
          onClick: (role) => onEdit(role.id),
        },
        {
          label: t('roles.actions.delete', { defaultValue: 'Delete' }),
          icon: Trash2,
          onClick: (role) => onDelete(role.id),
          variant: 'destructive',
        },
      ]

      return <DataTableActions item={role} actions={actions} />
    },
  },
]
