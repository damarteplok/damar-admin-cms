import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CREATE_PRODUCT_MUTATION } from '@/lib/graphql/product.graphql'
import type {
  CreateProductResponse,
  CreateProductInput,
  UpdateProductInput,
} from '@/types'
import { ProductForm } from '@/components/features/admin/products'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/admin/products/create')({
  component: CreateProductPage,
})

function CreateProductPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, createProductMutation] = useMutation<CreateProductResponse>(
    CREATE_PRODUCT_MUTATION,
  )

  const handleCreate = async (
    data: CreateProductInput | UpdateProductInput,
    createAnother: boolean = false,
  ) => {
    const result = await createProductMutation({
      input: data as CreateProductInput,
    })

    if (result.data?.createProduct.success) {
      toast.success(
        createAnother
          ? t('products.form.created_another', {
              defaultValue: 'Product created! Create another one.',
            })
          : t('products.form.created_success', {
              defaultValue: 'Product created successfully!',
            }),
      )

      if (!createAnother) {
        navigate({ to: '/admin/products' })
      }
      return true
    } else {
      toast.error(
        result.data?.createProduct.message ||
          t('products.form.created_failed', {
            defaultValue: 'Failed to create product',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/products' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {t('products.create_title', { defaultValue: 'Create Product' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('products.create_description', {
                defaultValue: 'Create a new product',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Product Form */}
      <Card>
        <CardContent className="pt-6">
          <ProductForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            submitLabel={t('products.form.create', { defaultValue: 'Create' })}
            showCreateAnother={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
