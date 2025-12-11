import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'

import {
  GET_PRODUCTS_QUERY,
  DELETE_PRODUCT_MUTATION,
} from '@/lib/graphql/product.graphql'
import type { ProductsResponse, DeleteProductResponse, Product } from '@/types'

import { DataTable } from '@/components/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

import { createProductColumns } from '@/components/features/admin/products'

export const Route = createFileRoute('/admin/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const [result] = useQuery<ProductsResponse>({
    query: GET_PRODUCTS_QUERY,
    variables: {
      page,
      perPage,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
    requestPolicy: 'cache-and-network',
  })

  const [, deleteProductMutation] = useMutation<DeleteProductResponse>(
    DELETE_PRODUCT_MUTATION,
  )

  const { data: queryData, fetching, error } = result
  const isInitialLoad = fetching && !queryData

  const handleAddProduct = () => {
    navigate({ to: '/admin/products/create' })
  }

  const handleViewProduct = (id: string) => {
    navigate({ to: `/admin/products/${id}` })
  }

  const handleEditProduct = (id: string) => {
    navigate({ to: `/admin/products/${id}/edit` })
  }

  const handleDeleteProduct = (id: string) => {
    const product = queryData?.products.data.products.find((p) => p.id === id)
    if (product) {
      setProductToDelete(product)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return

    const result = await deleteProductMutation({ id: productToDelete.id })

    if (result.data?.deleteProduct.success) {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      // Refetch will happen automatically via URQL cache or page reload
      window.location.reload()
    } else {
      alert(result.data?.deleteProduct.message || 'Failed to delete product')
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
      createProductColumns({
        onView: handleViewProduct,
        onEdit: handleEditProduct,
        onDelete: handleDeleteProduct,
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
        columns={5}
      />
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title={t('products.failed_to_load', {
          defaultValue: 'Failed to load products',
        })}
        description={
          error.message ||
          t('products.error_occurred', {
            defaultValue:
              'An error occurred while fetching products. Please try again.',
          })
        }
      />
    )
  }

  // Empty or error response
  if (!queryData?.products.success || !queryData?.products.data) {
    return (
      <ErrorState
        title={t('products.failed_to_load', {
          defaultValue: 'Failed to load products',
        })}
        description={
          queryData?.products.message ||
          t('products.unable_to_fetch', {
            defaultValue: 'Unable to fetch products data.',
          })
        }
      />
    )
  }

  const products = queryData.products.data.products

  const totalPages = queryData?.products.data
    ? Math.ceil(queryData.products.data.total / perPage)
    : 0

  return (
    <div className="space-y-4">
      <DataTable
        title={t('products.title', { defaultValue: 'Products' })}
        columns={columns}
        data={products}
        searchColumn="name"
        searchPlaceholder={t('products.search_placeholder', {
          defaultValue: 'Search products...',
        })}
        canAdd={true}
        addButtonTitle={t('products.create_button', {
          defaultValue: 'Create product',
        })}
        onAddClick={handleAddProduct}
        serverSideSearch={true}
        onSearchChange={setSearch}
        isLoading={fetching}
        showRowNumber={false}
        currentPage={page}
        pageSize={perPage}
        onPageSizeChange={setPerPage}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        totalItems={queryData?.products.data.total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteProduct}
        title={t('products.delete_title', {
          defaultValue: 'Delete Product?',
        })}
        description={
          <>
            {t('products.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the product',
            })}
            {productToDelete && (
              <>
                {' '}
                <span className="font-semibold">{productToDelete.name}</span>
              </>
            )}{' '}
            {t('products.delete_description_and', {
              defaultValue: 'and remove all associated data.',
            })}
          </>
        }
        confirmText={t('products.delete_button', {
          defaultValue: 'Delete',
        })}
        variant="destructive"
      />
    </div>
  )
}
