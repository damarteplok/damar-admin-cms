import { ColumnDef } from '@tanstack/react-table'
import type { Tenant } from '@/types'
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

export const createWorkspaceColumns = ({
  onDelete,
  onEdit,
  onView,
  t,
}: ColumnProps): ColumnDef<Tenant>[] => [
  {
    accessorKey: 'name',
    header: t('workspaces.columns.name', { defaultValue: 'Name' }),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('name')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'slug',
    header: t('workspaces.columns.slug', { defaultValue: 'Slug' }),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-mono text-xs">
          {row.getValue('slug')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'domain',
    header: t('workspaces.columns.domain', { defaultValue: 'Domain' }),
    cell: ({ row }) => {
      const domain = row.getValue('domain')
      return domain ? (
        <span className="text-sm text-muted-foreground">{String(domain)}</span>
      ) : (
        <span className="text-xs text-muted-foreground italic">
          {t('workspaces.columns.no_domain', { defaultValue: 'No domain' })}
        </span>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: t('workspaces.columns.created_at', { defaultValue: 'Created At' }),
    cell: ({ row }) => {
      const timestamp = Number(row.getValue('createdAt'))
      return <span className="text-sm">{formatDateTime(timestamp)}</span>
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">
        {t('workspaces.columns.actions', { defaultValue: 'Actions' })}
      </div>
    ),
    cell: ({ row }) => {
      const workspace = row.original

      const actions: DataTableAction<Tenant>[] = [
        {
          label: t('workspaces.actions.view_details', {
            defaultValue: 'View Details',
          }),
          icon: Eye,
          onClick: (workspace) => onView(workspace.id),
        },
        { separator: true },
        {
          label: t('workspaces.actions.edit', { defaultValue: 'Edit' }),
          icon: Pencil,
          onClick: (workspace) => onEdit(workspace.id),
        },
        {
          label: t('workspaces.actions.delete', { defaultValue: 'Delete' }),
          icon: Trash2,
          onClick: (workspace) => onDelete(workspace.id),
          variant: 'destructive',
        },
      ]

      return <DataTableActions item={workspace} actions={actions} />
    },
  },
]
