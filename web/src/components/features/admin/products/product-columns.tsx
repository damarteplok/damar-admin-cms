import { ColumnDef } from '@tanstack/react-table'
import type { Product } from '@/types'
import {
  DataTableActions,
  DataTableAction,
} from '@/components/ui/data-table-actions'
import { Badge } from '@/components/ui/badge'
import { Check, X, Pencil, Trash2, Eye } from 'lucide-react'
import type { TFunction } from 'i18next'
import { formatDateTime } from '@/lib/utils/date'

interface ColumnProps {
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onView: (id: string) => void
  t: TFunction
}

export const createProductColumns = ({
  onDelete,
  onEdit,
  onView,
  t,
}: ColumnProps): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: t('products.columns.name', { defaultValue: 'Name' }),
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
    header: t('products.columns.slug', { defaultValue: 'Slug' }),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-mono text-xs">
          {row.getValue('slug')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'isPopular',
    header: t('products.columns.is_popular', { defaultValue: 'Popular' }),
    cell: ({ row }) => {
      const isPopular = row.getValue('isPopular')
      return isPopular ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/30" />
      )
    },
  },
  {
    accessorKey: 'isDefault',
    header: t('products.columns.is_default', { defaultValue: 'Default' }),
    cell: ({ row }) => {
      const isDefault = row.getValue('isDefault')
      return isDefault ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/30" />
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: t('products.columns.created_at', { defaultValue: 'Created At' }),
    cell: ({ row }) => {
      const timestamp = Number(row.getValue('createdAt'))
      return <span className="text-sm">{formatDateTime(timestamp)}</span>
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">
        {t('products.columns.actions', { defaultValue: 'Actions' })}
      </div>
    ),
    cell: ({ row }) => {
      const product = row.original

      const actions: DataTableAction<Product>[] = [
        {
          label: t('products.actions.view_details', {
            defaultValue: 'View Details',
          }),
          icon: Eye,
          onClick: (product) => onView(product.id),
        },
        { separator: true },
        {
          label: t('products.actions.edit', { defaultValue: 'Edit' }),
          icon: Pencil,
          onClick: (product) => onEdit(product.id),
        },
        {
          label: t('products.actions.delete', { defaultValue: 'Delete' }),
          icon: Trash2,
          onClick: (product) => onDelete(product.id),
          variant: 'destructive',
        },
      ]

      return <DataTableActions item={product} actions={actions} />
    },
  },
]
