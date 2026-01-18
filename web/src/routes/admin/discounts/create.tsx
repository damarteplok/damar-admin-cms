import { createFileRoute } from '@tanstack/react-router'
import { CrudCreatePage } from '@/components/crud'
import { discountsConfig } from '@/features/discounts'
import type {
  Discount,
  CreateDiscountInput,
  UpdateDiscountInput,
} from '@/types'

export const Route = createFileRoute('/admin/discounts/create')({
  component: CreateDiscountPage,
})

function CreateDiscountPage() {
  return (
    <CrudCreatePage<Discount, CreateDiscountInput, UpdateDiscountInput>
      config={discountsConfig}
    />
  )
}
