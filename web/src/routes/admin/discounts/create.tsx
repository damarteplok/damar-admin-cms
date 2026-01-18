import { createFileRoute } from '@tanstack/react-router'
import type {
  CreateDiscountInput,
  Discount,
  UpdateDiscountInput,
} from '@/types'
import { CrudCreatePage } from '@/components/crud'
import { discountsConfig } from '@/features/discounts'

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
