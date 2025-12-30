import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState, useEffect } from 'react'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  GET_BLOG_POSTS_QUERY,
  DELETE_BLOG_POST_MUTATION,
  PUBLISH_BLOG_POST_MUTATION,
  UNPUBLISH_BLOG_POST_MUTATION,
} from '@/lib/graphql/blog.graphql'
import type {
  BlogPostsResponse,
  DeleteBlogPostResponse,
  PublishBlogPostResponse,
  UnpublishBlogPostResponse,
  BlogPost,
} from '@/types'

import { DataTable } from '@/components/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

import { createBlogPostColumns } from '@/components/features/admin/blog'

export const Route = createFileRoute('/admin/blog/')({
  component: BlogPostsPage,
})

function BlogPostsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)

  const [result] = useQuery<BlogPostsResponse>({
    query: GET_BLOG_POSTS_QUERY,
    variables: {
      page,
      perPage,
      publishedOnly: false,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
    requestPolicy: 'cache-and-network',
  })

  const [, deleteBlogPostMutation] = useMutation<DeleteBlogPostResponse>(
    DELETE_BLOG_POST_MUTATION,
  )
  const [, publishBlogPostMutation] = useMutation<PublishBlogPostResponse>(
    PUBLISH_BLOG_POST_MUTATION,
  )
  const [, unpublishBlogPostMutation] = useMutation<UnpublishBlogPostResponse>(
    UNPUBLISH_BLOG_POST_MUTATION,
  )

  const { data: queryData, fetching, error } = result
  const isInitialLoad = fetching && !queryData

  // Reset page to 1 when search or sort changes
  useEffect(() => {
    setPage(1)
  }, [search, sortBy, sortOrder])

  const handleAddPost = () => {
    navigate({ to: '/admin/blog/create' })
  }

  const handleViewPost = (id: string) => {
    navigate({ to: `/admin/blog/${id}` })
  }

  const handleEditPost = (id: string) => {
    navigate({ to: `/admin/blog/${id}/edit` })
  }

  const handleDeletePost = (id: string) => {
    const post = queryData?.blogPosts.data.blogPosts.find(
      (p: BlogPost) => p.id === id,
    )
    if (post) {
      setPostToDelete(post)
      setDeleteDialogOpen(true)
    }
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

  const confirmDeletePost = async () => {
    if (!postToDelete) return

    const result = await deleteBlogPostMutation({ id: postToDelete.id })

    if (result.data?.deleteBlogPost.success) {
      toast.success(
        t('blog.deleted_success', {
          defaultValue: 'Blog post deleted successfully!',
        }),
      )
      setDeleteDialogOpen(false)
      setPostToDelete(null)
      window.location.reload()
    } else {
      toast.error(
        result.data?.deleteBlogPost.message ||
          t('blog.deleted_failed', { defaultValue: 'Failed to delete post' }),
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
      createBlogPostColumns({
        onView: handleViewPost,
        onEdit: handleEditPost,
        onDelete: handleDeletePost,
        onPublish: handlePublishPost,
        onUnpublish: handleUnpublishPost,
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

  // Empty or error response
  if (!queryData?.blogPosts.success || !queryData?.blogPosts.data) {
    return (
      <ErrorState
        title={t('blog.failed_to_load', {
          defaultValue: 'Failed to load blog posts',
        })}
        description={
          queryData?.blogPosts.message ||
          t('blog.unable_to_fetch', {
            defaultValue: 'Unable to fetch blog posts data.',
          })
        }
      />
    )
  }

  const posts = queryData.blogPosts.data.blogPosts

  const totalPages = queryData?.blogPosts.data
    ? Math.ceil(queryData.blogPosts.data.total / perPage)
    : 0

  return (
    <div className="space-y-4">
      <DataTable
        title={t('blog.title', { defaultValue: 'Blog Posts' })}
        columns={columns}
        data={posts}
        searchColumn="title"
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
        totalItems={queryData?.blogPosts.data.total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeletePost}
        title={t('blog.delete_title', {
          defaultValue: 'Delete Blog Post?',
        })}
        description={
          <>
            {t('blog.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the post',
            })}
            {postToDelete && (
              <>
                {' '}
                <span className="font-semibold">{postToDelete.title}</span>
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
