import { ColumnDef } from '@tanstack/react-table'
import type { Permission } from '@/types'
import {
  DataTableActions,
  DataTableAction,
} from '@/components/ui/data-table-actions'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Eye } from 'lucide-react'
import type { TFunction } from 'i18next'
import { formatDateTime } from '@/lib/utils/date'

interface ColumnProps {
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onView: (id: string) => void
  t: TFunction
}

export const createPermissionColumns = ({
  onDelete,
  onEdit,
  onView,
  t,
}: ColumnProps): ColumnDef<Permission>[] => [
  {
    accessorKey: 'name',
    header: t('permissions.columns.name', { defaultValue: 'Name' }),
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
    header: t('permissions.columns.guard_name', { defaultValue: 'Guard' }),
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
    header: t('permissions.columns.created_at', { defaultValue: 'Created At' }),
    cell: ({ row }) => {
      const timestamp = Number(row.getValue('createdAt'))
      return <span className="text-sm">{formatDateTime(timestamp)}</span>
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">
        {t('permissions.columns.actions', { defaultValue: 'Actions' })}
      </div>
    ),
    cell: ({ row }) => {
      const permission = row.original

      const actions: DataTableAction<Permission>[] = [
        {
          label: t('permissions.actions.view_details', {
            defaultValue: 'View Details',
          }),
          icon: Eye,
          onClick: (permission) => onView(permission.id),
        },
        { separator: true },
        {
          label: t('permissions.actions.edit', { defaultValue: 'Edit' }),
          icon: Pencil,
          onClick: (permission) => onEdit(permission.id),
        },
        {
          label: t('permissions.actions.delete', { defaultValue: 'Delete' }),
          icon: Trash2,
          onClick: (permission) => onDelete(permission.id),
          variant: 'destructive',
        },
      ]

      return <DataTableActions item={permission} actions={actions} />
    },
  },
]
