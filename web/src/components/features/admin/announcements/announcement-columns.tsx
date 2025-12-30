import { ColumnDef } from '@tanstack/react-table'
import type { Announcement } from '@/types'
import {
  DataTableActions,
  DataTableAction,
} from '@/components/ui/data-table-actions'
import { Badge } from '@/components/ui/badge'
import { Check, X, Pencil, Trash2, Eye, AlertCircle } from 'lucide-react'
import type { TFunction } from 'i18next'
import { formatDateTime } from '@/lib/utils/date'

interface ColumnProps {
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onView: (id: string) => void
  t: TFunction
}

export const createAnnouncementColumns = ({
  onDelete,
  onEdit,
  onView,
  t,
}: ColumnProps): ColumnDef<Announcement>[] => [
  {
    accessorKey: 'title',
    header: t('announcements.columns.title', { defaultValue: 'Title' }),
    cell: ({ row }) => {
      const isActive = row.original.isActive
      return (
        <div className="flex items-center gap-2">
          {!isActive && (
            <Badge variant="secondary" className="text-xs">
              {t('announcements.status.inactive', { defaultValue: 'Inactive' })}
            </Badge>
          )}
          <span className="font-medium">{row.getValue('title')}</span>
        </div>
      )
    },
  },
  {
    id: 'schedule',
    header: t('announcements.columns.schedule', { defaultValue: 'Schedule' }),
    cell: ({ row }) => {
      const startsAt = row.original.startsAt
      const endsAt = row.original.endsAt

      if (!startsAt && !endsAt) {
        return (
          <Badge variant="outline" className="text-xs">
            {t('announcements.schedule.always', {
              defaultValue: 'Always Active',
            })}
          </Badge>
        )
      }

      return (
        <div className="flex flex-col gap-1 text-xs">
          {startsAt && (
            <div className="text-muted-foreground">
              From: {formatDateTime(startsAt)}
            </div>
          )}
          {endsAt && (
            <div className="text-muted-foreground">
              Until: {formatDateTime(endsAt)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'visibility',
    header: t('announcements.columns.visibility', {
      defaultValue: 'Visibility',
    }),
    cell: ({ row }) => {
      const { showForCustomers, showOnFrontend, showOnUserDashboard } =
        row.original

      const badges = []
      if (showForCustomers) badges.push('Customers')
      if (showOnFrontend) badges.push('Frontend')
      if (showOnUserDashboard) badges.push('Dashboard')

      return (
        <div className="flex flex-wrap gap-1">
          {badges.map((badge) => (
            <Badge key={badge} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
          {badges.length === 0 && (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'isDismissible',
    header: t('announcements.columns.dismissible', {
      defaultValue: 'Dismissible',
    }),
    cell: ({ row }) => {
      const isDismissible = row.getValue('isDismissible')
      return isDismissible ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <div className="flex items-center gap-1">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <span className="text-xs text-orange-500">Critical</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'isActive',
    header: t('announcements.columns.is_active', { defaultValue: 'Active' }),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive')
      return isActive ? (
        <Badge variant="default" className="text-xs">
          {t('announcements.status.active', { defaultValue: 'Active' })}
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">
          {t('announcements.status.inactive', { defaultValue: 'Inactive' })}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: t('announcements.columns.created_at', {
      defaultValue: 'Created At',
    }),
    cell: ({ row }) => {
      const timestamp = Number(row.getValue('createdAt'))
      return <span className="text-sm">{formatDateTime(timestamp)}</span>
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">
        {t('announcements.columns.actions', { defaultValue: 'Actions' })}
      </div>
    ),
    cell: ({ row }) => {
      const announcement = row.original

      const actions: DataTableAction<Announcement>[] = [
        {
          label: t('announcements.actions.view_details', {
            defaultValue: 'View Details',
          }),
          icon: Eye,
          onClick: (announcement) => onView(announcement.id),
        },
        { separator: true },
        {
          label: t('announcements.actions.edit', { defaultValue: 'Edit' }),
          icon: Pencil,
          onClick: (announcement) => onEdit(announcement.id),
        },
        {
          label: t('announcements.actions.delete', { defaultValue: 'Delete' }),
          icon: Trash2,
          onClick: (announcement) => onDelete(announcement.id),
          variant: 'destructive',
        },
      ]

      return <DataTableActions item={announcement} actions={actions} />
    },
  },
]
