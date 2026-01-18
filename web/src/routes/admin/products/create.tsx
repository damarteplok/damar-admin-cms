import { createFileRoute } from '@tanstack/react-router'
import { CrudCreatePage } from '@/components/crud'
import { productsConfig } from '@/features/products'
import type { Product, CreateProductInput, UpdateProductInput } from '@/types'

export const Route = createFileRoute('/admin/products/create')({
  component: CreateProductPage,
})

function CreateProductPage() {
  return (
    <CrudCreatePage<Product, CreateProductInput, UpdateProductInput>
      config={productsConfig}
    />
  )
}
