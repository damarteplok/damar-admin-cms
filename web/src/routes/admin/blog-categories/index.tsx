import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import {
  GET_CATEGORIES_QUERY,
  DELETE_CATEGORY_MUTATION,
} from '@/lib/graphql/blog.graphql'
import type {
  CategoriesResponse,
  DeleteCategoryResponse,
  Category,
} from '@/types'
import { createCategoryColumns } from '@/components/features/admin/blog'

import { DataTable } from '@/components/data-table'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/admin/blog-categories/')({
  component: CategoriesPage,
})

function CategoriesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [result, reexecuteQuery] = useQuery<CategoriesResponse>({
    query: GET_CATEGORIES_QUERY,
    variables: {
      page,
      perPage,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
    requestPolicy: 'cache-and-network',
  })

  const [, deleteCategoryMutation] = useMutation<DeleteCategoryResponse>(
    DELETE_CATEGORY_MUTATION,
  )

  const { data, fetching, error } = result
  const isInitialLoad = fetching && !data

  // Reset page to 1 when search or sort changes
  useEffect(() => {
    setPage(1)
  }, [search, sortBy, sortOrder])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSortChange = (columnId: string, order: 'asc' | 'desc') => {
    setSortBy(columnId)
    setSortOrder(order)
  }

  const handleDelete = (category: Category) => {
    setDeleteCategory(category)
  }

  const confirmDelete = async () => {
    if (!deleteCategory) return

    const result = await deleteCategoryMutation({ id: deleteCategory.id })

    if (result.data?.deleteCategory.success) {
      toast.success(
        t('category.deleted_success', {
          defaultValue: 'Category deleted successfully!',
        }),
      )
      reexecuteQuery({ requestPolicy: 'network-only' })
    } else {
      toast.error(
        result.data?.deleteCategory.message ||
          t('category.deleted_failed', {
            defaultValue: 'Failed to delete category',
          }),
      )
    }

    setDeleteCategory(null)
  }

  const handleCreate = () => {
    navigate({ to: '/admin/blog-categories/create' })
  }

  // Loading state
  if (isInitialLoad) {
    return (
      <DataTableSkeleton
        showCreateButton={true}
        showSearch={true}
        rows={10}
        columns={4}
      />
    )
  }

  // Error state
  if (error || !data?.categories.success) {
    return (
      <ErrorState
        title={t('category.failed_to_load', {
          defaultValue: 'Failed to load categories',
        })}
        description={
          error?.message ||
          data?.categories.message ||
          t('category.unable_to_fetch', {
            defaultValue: 'Unable to fetch categories data.',
          })
        }
      />
    )
  }

  const categories = data.categories.data.categories

  const totalPages = data?.categories.data
    ? Math.ceil(data.categories.data.total / perPage)
    : 0

  const columns = createCategoryColumns({
    onDelete: handleDelete,
    t,
  })

  return (
    <div className="space-y-6">
      {/* Data Table */}
      <DataTable
        title={t('category.list_title', { defaultValue: 'Blog Categories' })}
        description={t('category.list_description', {
          defaultValue: 'Manage blog post categories',
        })}
        columns={columns}
        data={categories}
        canAdd
        addButtonTitle={t('category.create_button', {
          defaultValue: 'Create Category',
        })}
        onAddClick={handleCreate}
        searchColumn="name"
        searchPlaceholder={t('category.search_placeholder', {
          defaultValue: 'Search categories...',
        })}
        serverSideSearch
        onSearchChange={setSearch}
        isLoading={fetching}
        showRowNumber={false}
        currentPage={page}
        pageSize={perPage}
        onPageSizeChange={setPerPage}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        totalItems={data?.categories.data.total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteCategory !== null}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('category.delete_title', {
                defaultValue: 'Delete Category',
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('category.delete_description', {
                defaultValue:
                  'Are you sure you want to delete this category? This action cannot be undone.',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('common.delete', { defaultValue: 'Delete' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
