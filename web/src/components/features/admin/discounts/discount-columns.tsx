import { ColumnDef } from '@tanstack/react-table'
import type { Discount } from '@/types'
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

export const createDiscountColumns = ({
  onDelete,
  onEdit,
  onView,
  t,
}: ColumnProps): ColumnDef<Discount>[] => [
  {
    accessorKey: 'name',
    header: t('discounts.columns.name', { defaultValue: 'Name' }),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('name')}</span>
          {row.original.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: t('discounts.columns.type', { defaultValue: 'Type' }),
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant={type === 'percentage' ? 'default' : 'secondary'}>
          {type === 'percentage' ? 'Percentage' : 'Fixed'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: t('discounts.columns.amount', { defaultValue: 'Amount' }),
    cell: ({ row }) => {
      const type = row.original.type
      const amount = row.getValue('amount') as number
      return (
        <span className="font-medium">
          {type === 'percentage' ? `${amount}%` : `$${amount.toFixed(2)}`}
        </span>
      )
    },
  },
  {
    accessorKey: 'isActive',
    header: t('discounts.columns.is_active', { defaultValue: 'Active' }),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive')
      return isActive ? (
        <Badge variant="default" className="gap-1">
          <Check className="h-3 w-3" />
          Active
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <X className="h-3 w-3" />
          Inactive
        </Badge>
      )
    },
  },
  {
    accessorKey: 'redemptions',
    header: t('discounts.columns.redemptions', { defaultValue: 'Redemptions' }),
    cell: ({ row }) => {
      const redemptions = row.getValue('redemptions') as number
      const maxRedemptions = row.original.maxRedemptions

      return (
        <span className="text-sm">
          {redemptions}
          {maxRedemptions && maxRedemptions > 0 && ` / ${maxRedemptions}`}
        </span>
      )
    },
  },
  {
    accessorKey: 'isRecurring',
    header: t('discounts.columns.is_recurring', { defaultValue: 'Recurring' }),
    cell: ({ row }) => {
      const isRecurring = row.getValue('isRecurring')
      return isRecurring ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/30" />
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: t('discounts.columns.created_at', { defaultValue: 'Created At' }),
    cell: ({ row }) => {
      const timestamp = Number(row.getValue('createdAt'))
      return <span className="text-sm">{formatDateTime(timestamp)}</span>
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">
        {t('discounts.columns.actions', { defaultValue: 'Actions' })}
      </div>
    ),
    cell: ({ row }) => {
      const discount = row.original

      const actions: DataTableAction<Discount>[] = [
        {
          label: t('discounts.actions.view_details', {
            defaultValue: 'View Details',
          }),
          icon: Eye,
          onClick: (discount) => onView(discount.id),
        },
        { separator: true },
        {
          label: t('discounts.actions.edit', { defaultValue: 'Edit' }),
          icon: Pencil,
          onClick: (discount) => onEdit(discount.id),
        },
        {
          label: t('discounts.actions.delete', { defaultValue: 'Delete' }),
          icon: Trash2,
          onClick: (discount) => onDelete(discount.id),
          variant: 'destructive',
        },
      ]

      return <DataTableActions item={discount} actions={actions} />
    },
  },
]
