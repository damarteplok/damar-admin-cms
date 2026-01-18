import { createFileRoute } from '@tanstack/react-router'
import type { CreateProductInput, Product, UpdateProductInput } from '@/types'
import { CrudCreatePage } from '@/components/crud'
import { productsConfig } from '@/features/products'

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
