import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type {
  BlogPost,
  PublishBlogPostResponse,
  UnpublishBlogPostResponse,
} from '@/types'
import { useCrudTable } from '@/hooks/crud'
import { blogConfig } from '@/features/blog'
import {
  PUBLISH_BLOG_POST_MUTATION,
  UNPUBLISH_BLOG_POST_MUTATION,
} from '@/lib/graphql/blog.graphql'

import { DataTable } from '@/components/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

export const Route = createFileRoute('/admin/blog/')({
  component: BlogPostsPage,
})

function BlogPostsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Use generic hook for CRUD state management
  const {
    data: posts,
    fetching,
    error,
    isInitialLoad,
    page,
    perPage,
    setPerPage,
    setSearch,
    handlePageChange,
    handleSortChange,
    deleteDialogOpen,
    itemToDelete,
    closeDeleteDialog,
    openDeleteDialog,
    confirmDelete,
    total,
    totalPages,
    querySuccess,
    queryMessage,
  } = useCrudTable<BlogPost>({
    listQuery: blogConfig.queries.list,
    deleteMutation: blogConfig.queries.delete,
    dataKey: blogConfig.dataKey,
    itemsKey: blogConfig.dataKey, // 'blogPosts' inside data
    defaultSort: blogConfig.defaultSort,
    onDeleteSuccess: () => {
      toast.success(
        t('blog.deleted_success', {
          defaultValue: 'Blog post deleted successfully!',
        }),
      )
    },
  })

  // Additional mutations for Publish/Unpublish
  const [, publishBlogPostMutation] = useMutation<PublishBlogPostResponse>(
    PUBLISH_BLOG_POST_MUTATION,
  )
  const [, unpublishBlogPostMutation] = useMutation<UnpublishBlogPostResponse>(
    UNPUBLISH_BLOG_POST_MUTATION,
  )

  const handleAddPost = () => {
    navigate({ to: '/admin/blog/create' })
  }

  const handleViewPost = (id: string) => {
    navigate({ to: `/admin/blog/${id}` })
  }

  const handleEditPost = (id: string) => {
    navigate({ to: `/admin/blog/${id}/edit` })
  }

  const handlePublishPost = async (id: string) => {
    const result = await publishBlogPostMutation({ id })

    if (result.data?.publishBlogPost.success) {
      toast.success(
        t('blog.published_success', {
          defaultValue: 'Blog post published successfully!',
        }),
      )
      window.location.reload()
    } else {
      toast.error(
        result.data?.publishBlogPost.message ||
          t('blog.publish_failed', { defaultValue: 'Failed to publish post' }),
      )
    }
  }

  const handleUnpublishPost = async (id: string) => {
    const result = await unpublishBlogPostMutation({ id })

    if (result.data?.unpublishBlogPost.success) {
      toast.success(
        t('blog.unpublished_success', {
          defaultValue: 'Blog post unpublished successfully!',
        }),
      )
      window.location.reload()
    } else {
      toast.error(
        result.data?.unpublishBlogPost.message ||
          t('blog.unpublish_failed', {
            defaultValue: 'Failed to unpublish post',
          }),
      )
    }
  }

  const columns = useMemo(
    () =>
      blogConfig.createColumns({
        onView: handleViewPost,
        onEdit: handleEditPost,
        onDelete: (id: string) => {
          // Find item to pass to generic openDeleteDialog which expects TModel
          // But openDeleteDialog expects TModel, not ID.
          // However, columns normally pass ID if they follow generic pattern.
          // wait, blog-post-columns.tsx passes ID.
          // useCrudTable.openDeleteDialog expects TModel.
          // We need to find the item from 'posts' array.
          const post = posts.find((p) => p.id === id)
          if (post) openDeleteDialog(post)
        },
        onPublish: handlePublishPost,
        onUnpublish: handleUnpublishPost,
        t,
      } as any),
    [t, posts, openDeleteDialog], // Added relevant deps
  )

  // Loading state
  if (isInitialLoad) {
    return (
      <DataTableSkeleton
        showCreateButton={true}
        showSearch={true}
        rows={10}
        columns={blogConfig.skeletonColumns}
      />
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title={t('blog.failed_to_load', {
          defaultValue: 'Failed to load blog posts',
        })}
        description={
          error.message ||
          t('blog.error_occurred', {
            defaultValue:
              'An error occurred while fetching blog posts. Please try again.',
          })
        }
      />
    )
  }

  // Empty or error response (if not loading and success is false)
  if (!fetching && (!querySuccess || !posts)) {
    return (
      <ErrorState
        title={t('blog.failed_to_load', {
          defaultValue: 'Failed to load blog posts',
        })}
        description={
          queryMessage ||
          t('blog.unable_to_fetch', {
            defaultValue: 'Unable to fetch blog posts data.',
          })
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <DataTable
        title={t('blog.title', { defaultValue: 'Blog Posts' })}
        columns={columns}
        data={posts}
        searchColumn={blogConfig.searchColumn}
        searchPlaceholder={t('blog.search_placeholder', {
          defaultValue: 'Search blog posts...',
        })}
        canAdd={true}
        addButtonTitle={t('blog.create_button', {
          defaultValue: 'Create post',
        })}
        onAddClick={handleAddPost}
        serverSideSearch={true}
        onSearchChange={setSearch}
        isLoading={fetching}
        showRowNumber={false}
        currentPage={page}
        pageSize={perPage}
        onPageSizeChange={setPerPage}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        totalItems={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={closeDeleteDialog}
        onConfirm={confirmDelete}
        title={t('blog.delete_title', {
          defaultValue: 'Delete Blog Post?',
        })}
        description={
          <>
            {t('blog.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the post',
            })}
            {itemToDelete && (
              <>
                {' '}
                <span className="font-semibold">{itemToDelete.title}</span>
              </>
            )}{' '}
            {t('blog.delete_description_and', {
              defaultValue: 'and remove all associated data.',
            })}
          </>
        }
        confirmText={t('blog.delete_button', {
          defaultValue: 'Delete',
        })}
        variant="destructive"
      />
    </div>
  )
}
