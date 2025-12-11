import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  GET_PRODUCT_QUERY,
  UPDATE_PRODUCT_MUTATION,
} from '@/lib/graphql/product.graphql'
import type {
  ProductResponse,
  UpdateProductResponse,
  UpdateProductInput,
  CreateProductInput,
} from '@/types'
import { ProductForm } from '@/components/features/admin/products'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/admin/products/$id/edit')({
  component: EditProductPage,
})

function EditProductPage() {
  const { id } = useParams({ from: '/admin/products/$id/edit' })
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [result] = useQuery<ProductResponse>({
    query: GET_PRODUCT_QUERY,
    variables: { id },
  })

  const [, updateProductMutation] = useMutation<UpdateProductResponse>(
    UPDATE_PRODUCT_MUTATION,
  )

  const { data, fetching, error } = result

  const handleUpdate = async (
    data: CreateProductInput | UpdateProductInput,
    _createAnother?: boolean,
  ) => {
    // Ensure we send all fields required for update
    const updateInput: UpdateProductInput = {
      ...data,
      id,
    }

    const result = await updateProductMutation({ input: updateInput })

    if (result.data?.updateProduct.success) {
      toast.success(
        t('products.form.updated_success', {
          defaultValue: 'Product updated successfully!',
        }),
      )
      navigate({ to: '/admin/products' })
      return true
    } else {
      toast.error(
        result.data?.updateProduct.message ||
          t('products.form.updated_failed', {
            defaultValue: 'Failed to update product',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/products' })
  }

  if (fetching) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
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
        actionLabel={t('common.go_back', { defaultValue: 'Go Back' })}
        onAction={() => navigate({ to: '/admin/products' })}
      />
    )
  }

  const product = data.product.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('products.edit_title', { defaultValue: 'Edit Product' })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('products.edit_description', {
              defaultValue: 'Update product details',
            })}
          </p>
        </div>
      </div>

      {/* Product Form */}
      <Card>
        <CardContent className="pt-6">
          <ProductForm
            initialData={{
              name: product.name,
              slug: product.slug,
              description: product.description || '',
              metadata: product.metadata || undefined,
              features: product.features || undefined,
              isPopular: product.isPopular,
              isDefault: product.isDefault,
            }}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            submitLabel={t('products.form.save', { defaultValue: 'Save' })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
