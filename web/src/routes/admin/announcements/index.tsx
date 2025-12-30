import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState, useEffect } from 'react'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'

import {
  GET_ANNOUNCEMENTS_QUERY,
  DELETE_ANNOUNCEMENT_MUTATION,
} from '@/lib/graphql/announcement.graphql'
import type {
  AnnouncementsResponse,
  DeleteAnnouncementResponse,
  Announcement,
} from '@/types'

import { DataTable } from '@/components/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

import { createAnnouncementColumns } from '@/components/features/admin/announcements'

export const Route = createFileRoute('/admin/announcements/')({
  component: AnnouncementsPage,
})

function AnnouncementsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] =
    useState<Announcement | null>(null)

  const [result] = useQuery<AnnouncementsResponse>({
    query: GET_ANNOUNCEMENTS_QUERY,
    variables: {
      page,
      perPage,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
    requestPolicy: 'cache-and-network',
  })

  const [, deleteAnnouncementMutation] =
    useMutation<DeleteAnnouncementResponse>(DELETE_ANNOUNCEMENT_MUTATION)

  const { data: queryData, fetching, error } = result
  const isInitialLoad = fetching && !queryData

  // Reset page to 1 when search or sort changes
  useEffect(() => {
    setPage(1)
  }, [search, sortBy, sortOrder])

  const handleAddAnnouncement = () => {
    navigate({ to: '/admin/announcements/create' })
  }

  const handleViewAnnouncement = (id: string) => {
    navigate({ to: `/admin/announcements/${id}` })
  }

  const handleEditAnnouncement = (id: string) => {
    navigate({ to: `/admin/announcements/${id}/edit` })
  }

  const handleDeleteAnnouncement = (id: string) => {
    const announcement = queryData?.announcements.data.announcements.find(
      (a) => a.id === id,
    )
    if (announcement) {
      setAnnouncementToDelete(announcement)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeleteAnnouncement = async () => {
    if (!announcementToDelete) return

    const result = await deleteAnnouncementMutation({
      id: announcementToDelete.id,
    })

    if (result.data?.deleteAnnouncement.success) {
      setDeleteDialogOpen(false)
      setAnnouncementToDelete(null)
      window.location.reload()
    } else {
      alert(
        result.data?.deleteAnnouncement.message ||
          'Failed to delete announcement',
      )
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSortChange = (columnId: string, order: 'asc' | 'desc') => {
    setSortBy(columnId)
    setSortOrder(order)
  }

  const columns = useMemo(
    () =>
      createAnnouncementColumns({
        onView: handleViewAnnouncement,
        onEdit: handleEditAnnouncement,
        onDelete: handleDeleteAnnouncement,
        t,
      }),
    [t],
  )

  // Loading state
  if (isInitialLoad) {
    return (
      <DataTableSkeleton
        showCreateButton={true}
        showSearch={true}
        rows={10}
        columns={7}
      />
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title={t('announcements.failed_to_load', {
          defaultValue: 'Failed to load announcements',
        })}
        description={
          error.message ||
          t('announcements.error_occurred', {
            defaultValue:
              'An error occurred while fetching announcements. Please try again.',
          })
        }
      />
    )
  }

  // Empty or error response
  if (!queryData?.announcements.success || !queryData?.announcements.data) {
    return (
      <ErrorState
        title={t('announcements.failed_to_load', {
          defaultValue: 'Failed to load announcements',
        })}
        description={
          queryData?.announcements.message ||
          t('announcements.unable_to_fetch', {
            defaultValue: 'Unable to fetch announcements data.',
          })
        }
      />
    )
  }

  const announcements = queryData.announcements.data.announcements

  const totalPages = queryData?.announcements.data
    ? Math.ceil(queryData.announcements.data.total / perPage)
    : 0

  return (
    <div className="space-y-4">
      <DataTable
        title={t('announcements.title', { defaultValue: 'Announcements' })}
        columns={columns}
        data={announcements}
        searchColumn="title"
        searchPlaceholder={t('announcements.search_placeholder', {
          defaultValue: 'Search announcements...',
        })}
        canAdd={true}
        addButtonTitle={t('announcements.create_button', {
          defaultValue: 'Create announcement',
        })}
        onAddClick={handleAddAnnouncement}
        serverSideSearch={true}
        onSearchChange={setSearch}
        isLoading={fetching}
        showRowNumber={false}
        currentPage={page}
        pageSize={perPage}
        onPageSizeChange={setPerPage}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        totalItems={queryData?.announcements.data.total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteAnnouncement}
        title={t('announcements.delete_title', {
          defaultValue: 'Delete Announcement?',
        })}
        description={
          <>
            {t('announcements.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the announcement',
            })}
            {announcementToDelete && (
              <>
                {' '}
                <span className="font-semibold">
                  {announcementToDelete.title}
                </span>
              </>
            )}{' '}
            {t('announcements.delete_description_and', {
              defaultValue: 'and remove all associated data.',
            })}
          </>
        }
        confirmText={t('announcements.delete_button', {
          defaultValue: 'Delete',
        })}
        variant="destructive"
      />
    </div>
  )
}
