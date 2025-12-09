import { createFileRoute } from '@tanstack/react-router'

import { PricingComponent } from '@/components/public/PricingComponent'

export const Route = createFileRoute('/_layout/pricing')({
  component: PricingPage,
})

function PricingPage() {
  return <PricingComponent />
}
