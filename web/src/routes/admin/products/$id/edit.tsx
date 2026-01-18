import { createFileRoute } from '@tanstack/react-router'
import type { CreateProductInput, Product, UpdateProductInput } from '@/types'
import { CrudEditPage } from '@/components/crud'
import { productsConfig, transformProductToFormData } from '@/features/products'

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
