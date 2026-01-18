import { createFileRoute } from '@tanstack/react-router'
import { CrudEditPage } from '@/components/crud'
import { productsConfig, transformProductToFormData } from '@/features/products'
import type { Product, CreateProductInput, UpdateProductInput } from '@/types'

export const Route = createFileRoute('/admin/products/$id/edit')({
  component: EditProductPage,
})

function EditProductPage() {
  return (
    <CrudEditPage<Product, CreateProductInput, UpdateProductInput>
      config={productsConfig}
      routePath="/admin/products/$id/edit"
      transformToFormData={transformProductToFormData}
    />
  )
}
