import { ColumnDef } from '@tanstack/react-table'
import type { Plan } from '@/types'
import {
  DataTableActions,
  DataTableAction,
} from '@/components/ui/data-table-actions'
import { Badge } from '@/components/ui/badge'
import { Check, X, Pencil, Trash2, Eye } from 'lucide-react'
import type { TFunction } from 'i18next'

interface ColumnProps {
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onView: (id: string) => void
  t: TFunction
}

export const createPlanColumns = ({
  onDelete,
  onEdit,
  onView,
  t,
}: ColumnProps): ColumnDef<Plan>[] => [
  {
    accessorKey: 'name',
    header: t('plans.columns.name', { defaultValue: 'Name' }),
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
    header: t('plans.columns.slug', { defaultValue: 'Slug' }),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-mono text-xs">
          {row.getValue('slug')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'type',
    header: t('plans.columns.type', { defaultValue: 'Type' }),
    cell: ({ row }) => {
      return <Badge variant="outline">{row.getValue('type')}</Badge>
    },
  },
  {
    accessorKey: 'intervalCount',
    header: t('plans.columns.interval_count', { defaultValue: 'Interval' }),
    cell: ({ row }) => {
      return <span className="text-sm">{row.getValue('intervalCount')}</span>
    },
  },
  {
    accessorKey: 'isActive',
    header: t('plans.columns.is_active', { defaultValue: 'Active' }),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive')
      return isActive ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/30" />
      )
    },
  },
  {
    accessorKey: 'isVisible',
    header: t('plans.columns.is_visible', { defaultValue: 'Visible' }),
    cell: ({ row }) => {
      const isVisible = row.getValue('isVisible')
      return isVisible ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/30" />
      )
    },
  },
  {
    accessorKey: 'hasTrial',
    header: t('plans.columns.has_trial', { defaultValue: 'Trial' }),
    cell: ({ row }) => {
      const hasTrial = row.getValue('hasTrial')
      return hasTrial ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/30" />
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: t('plans.columns.created_at', { defaultValue: 'Created At' }),
    cell: ({ row }) => {
      const timestamp = Number(row.getValue('createdAt'))
      const date = new Date(timestamp * 1000)
      return (
        <div className="flex flex-col">
          <span className="text-sm">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">
        {t('plans.columns.actions', { defaultValue: 'Actions' })}
      </div>
    ),
    cell: ({ row }) => {
      const plan = row.original

      const actions: DataTableAction<Plan>[] = [
        {
          label: t('plans.actions.view_details', {
            defaultValue: 'View Details',
          }),
          icon: Eye,
          onClick: (plan) => onView(plan.id),
        },
        { separator: true },
        {
          label: t('plans.actions.edit', { defaultValue: 'Edit' }),
          icon: Pencil,
          onClick: (plan) => onEdit(plan.id),
        },
        {
          label: t('plans.actions.delete', { defaultValue: 'Delete' }),
          icon: Trash2,
          onClick: (plan) => onDelete(plan.id),
          variant: 'destructive',
        },
      ]

      return <DataTableActions item={plan} actions={actions} />
    },
  },
]
