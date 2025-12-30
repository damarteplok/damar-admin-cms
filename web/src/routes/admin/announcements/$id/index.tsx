import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useState } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { ArrowLeft, Calendar, Clock, Eye, EyeOff, Loader2 } from 'lucide-react'

import {
  GET_ANNOUNCEMENT_QUERY,
  DELETE_ANNOUNCEMENT_MUTATION,
} from '@/lib/graphql/announcement.graphql'
import type { AnnouncementResponse } from '@/types'
import { Button } from '@/components/ui/button'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/admin/announcements/$id/')({
  component: AnnouncementDetailPage,
})

function AnnouncementDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [result] = useQuery<AnnouncementResponse>({
    query: GET_ANNOUNCEMENT_QUERY,
    variables: { id },
    requestPolicy: 'cache-and-network',
  })

  const [, deleteAnnouncementMutation] = useMutation(
    DELETE_ANNOUNCEMENT_MUTATION,
  )

  const handleBack = () => navigate({ to: '/admin/announcements' })

  const handleEdit = () => navigate({ to: `/admin/announcements/${id}/edit` })

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }

    setDeleting(true)
    const deleteResult = await deleteAnnouncementMutation({ id })

    if (deleteResult.data?.deleteAnnouncement.success) {
      toast.success(
        t('announcements.delete_success', {
          defaultValue: 'Announcement deleted successfully',
        }),
      )
      navigate({ to: '/admin/announcements' })
    } else {
      toast.error(
        deleteResult.data?.deleteAnnouncement.message ||
          t('announcements.delete_failed', {
            defaultValue: 'Failed to delete announcement',
          }),
      )
      setDeleting(false)
      setConfirming(false)
    }
  }

  const formatDateTime = (timestamp?: number | null) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp * 1000)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (result.fetching) {
    return <DataTableSkeleton rows={1} columns={1} />
  }

  if (result.error || !result.data?.announcement.success) {
    return (
      <ErrorState
        title={t('announcements.failed_to_load', {
          defaultValue: 'Failed to load announcement',
        })}
        description={result.error?.message || result.data?.announcement.message}
        action={<Button onClick={handleBack}>Back to List</Button>}
      />
    )
  }

  const announcement = result.data.announcement.data
  const sanitizedContent = DOMPurify.sanitize(announcement.content, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('announcements.detail_title', {
            defaultValue: 'Announcement Details',
          })}
        </h1>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                {announcement.isActive
                  ? t('announcements.status.active', { defaultValue: 'Active' })
                  : t('announcements.status.inactive', {
                      defaultValue: 'Inactive',
                    })}
              </Badge>
              {announcement.isDismissible && (
                <Badge variant="outline">
                  {t('announcements.status.dismissible', {
                    defaultValue: 'Dismissible',
                  })}
                </Badge>
              )}
              {announcement.showOnFrontend && (
                <Badge variant="outline">
                  {t('announcements.visibility.frontend', {
                    defaultValue: 'Frontend',
                  })}
                </Badge>
              )}
              {announcement.showOnUserDashboard && (
                <Badge variant="outline">
                  {t('announcements.visibility.dashboard', {
                    defaultValue: 'Dashboard',
                  })}
                </Badge>
              )}
              {announcement.showForCustomers && (
                <Badge variant="outline">
                  {t('announcements.visibility.customers', {
                    defaultValue: 'Customers',
                  })}
                </Badge>
              )}
            </div>

            {/* Main Title */}
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              {announcement.title}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button onClick={handleEdit}>
              {t('announcements.actions.edit', { defaultValue: 'Edit' })}
            </Button>
            <Button
              variant={confirming ? 'destructive' : 'outline'}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirming
                ? t('announcements.actions.confirm_delete', {
                    defaultValue: 'Click to confirm',
                  })
                : t('announcements.actions.delete', { defaultValue: 'Delete' })}
            </Button>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {t('announcements.schedule.starts', { defaultValue: 'Starts' })}{' '}
              <span className="font-medium text-foreground">
                {formatDateTime(announcement.startsAt)}
              </span>
            </span>
          </div>
          {announcement.endsAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {t('announcements.schedule.ends', { defaultValue: 'Ends' })}{' '}
                <span className="font-medium text-foreground">
                  {formatDateTime(announcement.endsAt)}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* HTML Content Rendering */}
      <article
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-img:rounded-xl prose-img:shadow-md prose-pre:bg-muted prose-pre:border prose-code:text-sm prose-li:marker:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      <Separator />

      {/* Metadata Footer */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          {t('announcements.metadata.title', {
            defaultValue: 'Additional Information',
          })}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Created At */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t('announcements.metadata.created_at', {
                defaultValue: 'Created',
              })}
            </p>
            <p className="text-sm font-medium">
              {formatDateTime(announcement.createdAt)}
            </p>
          </div>

          {/* Updated At */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t('announcements.metadata.updated_at', {
                defaultValue: 'Last Updated',
              })}
            </p>
            <p className="text-sm font-medium">
              {formatDateTime(announcement.updatedAt)}
            </p>
          </div>

          {/* Active Status */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t('announcements.metadata.active', {
                defaultValue: 'Active Status',
              })}
            </p>
            <div className="flex items-center gap-2">
              {announcement.isActive ? (
                <>
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {t('announcements.status.active', {
                      defaultValue: 'Active',
                    })}
                  </span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('announcements.status.inactive', {
                      defaultValue: 'Inactive',
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Dismissible */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t('announcements.metadata.dismissible', {
                defaultValue: 'Dismissible',
              })}
            </p>
            <p className="text-sm font-medium">
              {announcement.isDismissible
                ? t('announcements.common.yes', { defaultValue: 'Yes' })
                : t('announcements.common.no', { defaultValue: 'No' })}
            </p>
          </div>

          {/* Visibility */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t('announcements.metadata.visibility', {
                defaultValue: 'Visibility',
              })}
            </p>
            <div className="flex flex-wrap gap-1">
              {announcement.showOnFrontend && (
                <Badge variant="outline" className="text-xs">
                  {t('announcements.visibility.frontend', {
                    defaultValue: 'Frontend',
                  })}
                </Badge>
              )}
              {announcement.showOnUserDashboard && (
                <Badge variant="outline" className="text-xs">
                  {t('announcements.visibility.dashboard', {
                    defaultValue: 'Dashboard',
                  })}
                </Badge>
              )}
              {announcement.showForCustomers && (
                <Badge variant="outline" className="text-xs">
                  {t('announcements.visibility.customers', {
                    defaultValue: 'Customers',
                  })}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
