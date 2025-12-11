import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  GET_PRODUCT_QUERY,
  DELETE_PRODUCT_MUTATION,
} from '@/lib/graphql/product.graphql'
import type { ProductResponse, DeleteProductResponse } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Check, X } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { formatDateTime } from '@/lib/utils/date'

export const Route = createFileRoute('/admin/products/$id/')({
  component: ProductDetailsPage,
})

function ProductDetailsPage() {
  const { id } = useParams({ from: '/admin/products/$id/' })
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [result] = useQuery<ProductResponse>({
    query: GET_PRODUCT_QUERY,
    variables: { id },
  })

  const [, deleteProductMutation] = useMutation<DeleteProductResponse>(
    DELETE_PRODUCT_MUTATION,
  )

  const { data, fetching, error } = result

  const handleEdit = () => {
    navigate({ to: `/admin/products/${id}/edit` })
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleBack = () => {
    navigate({ to: '/admin/products' })
  }

  const confirmDelete = async () => {
    const result = await deleteProductMutation({ id })
    if (result.data?.deleteProduct.success) {
      toast.success(t('products.deleted', { defaultValue: 'Product deleted' }))
      setDeleteDialogOpen(false)
      navigate({ to: '/admin/products' })
    } else {
      toast.error(
        result.data?.deleteProduct.message ||
          t('products.delete_failed', {
            defaultValue: 'Failed to delete product',
          }),
      )
    }
  }

  if (fetching) {
    return (
      <DataTableSkeleton
        showCreateButton={true}
        showSearch={true}
        rows={10}
        columns={5}
      />
    )
  }

  if (error || !data?.product.success || !data?.product.data) {
    return (
      <ErrorState
        title={t('products.not_found', { defaultValue: 'Product Not Found' })}
        description={
          error?.message ||
          data?.product.message ||
          t('products.load_failed', { defaultValue: 'Failed to load product' })
        }
        action={
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/admin/products' })}
          >
            {t('common.go_back', { defaultValue: 'Go Back' })}
          </Button>
        }
      />
    )
  }

  const product = data.product.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('products.view_description', {
                defaultValue: 'View product details',
              })}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleEdit}>
            {t('products.actions.edit', { defaultValue: 'Edit' })}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {t('products.actions.delete', { defaultValue: 'Delete' })}
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('products.information_title', {
              defaultValue: 'Product Information',
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('products.form.name', { defaultValue: 'Name' })}
              </label>
              <p className="mt-1 text-sm">{product.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('products.form.slug', { defaultValue: 'Slug' })}
              </label>
              <p className="mt-1 text-sm font-mono">{product.slug}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t('products.form.description', { defaultValue: 'Description' })}
            </label>
            <p className="mt-1 text-sm">
              {product.description || (
                <span className="text-muted-foreground italic">
                  {t('products.no_description', {
                    defaultValue: 'No description',
                  })}
                </span>
              )}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('products.form.is_popular', { defaultValue: 'Popular' })}
              </label>
              <p className="mt-1 text-sm">
                {product.isPopular ? (
                  <span className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {t('common.yes', { defaultValue: 'Yes' })}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <X className="h-4 w-4 text-muted-foreground mr-2" />
                    {t('common.no', { defaultValue: 'No' })}
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('products.form.is_default', { defaultValue: 'Default' })}
              </label>
              <p className="mt-1 text-sm">
                {product.isDefault ? (
                  <span className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {t('common.yes', { defaultValue: 'Yes' })}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <X className="h-4 w-4 text-muted-foreground mr-2" />
                    {t('common.no', { defaultValue: 'No' })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('products.columns.created_at', {
                  defaultValue: 'Created At',
                })}
              </label>
              <p className="mt-1 text-sm">
                {formatDateTime(product.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata Card */}
      {product.metadata &&
        (() => {
          try {
            const metadata = JSON.parse(product.metadata)
            const metadataEntries = Object.entries(metadata)
            if (metadataEntries.length > 0) {
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t('products.form.metadata', {
                        defaultValue: 'Metadata',
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {metadataEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-lg border bg-card p-4"
                        >
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {key}
                          </p>
                          <p className="text-sm font-semibold">
                            {String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            }
          } catch {
            return null
          }
          return null
        })()}

      {/* Features Card */}
      {product.features &&
        (() => {
          try {
            const features = JSON.parse(product.features)
            let featuresList: string[] = []

            // Handle both object and array format
            if (typeof features === 'object' && !Array.isArray(features)) {
              featuresList = Object.keys(features)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((key) => features[key])
            } else if (Array.isArray(features)) {
              featuresList = features
            }

            if (featuresList.length > 0) {
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t('products.form.features', {
                        defaultValue: 'Features',
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-3 md:grid-cols-2">
                      {featuresList.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 rounded-lg border bg-card p-3"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 mt-0.5">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                          </div>
                          <span className="text-sm flex-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            }
          } catch {
            return null
          }
          return null
        })()}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={t('products.delete_title', {
          defaultValue: 'Delete Product?',
        })}
        description={
          <>
            {t('products.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the product',
            })}{' '}
            <span className="font-semibold">{product.name}</span>{' '}
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
