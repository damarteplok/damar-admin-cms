import { createFileRoute } from '@tanstack/react-router'
import type { CreateProductInput, Product, UpdateProductInput } from '@/types'
import { CrudListPage } from '@/components/crud'
import { productsConfig } from '@/features/products'

export const Route = createFileRoute('/admin/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  return (
    <CrudListPage<Product, CreateProductInput, UpdateProductInput>
      config={productsConfig}
    />
  )
}
