import { createFileRoute } from '@tanstack/react-router'

import { FeatureComponent } from '@/components/public/FeatureComponent'

export const Route = createFileRoute('/_layout/features')({
  component: FeaturesPage,
})

function FeaturesPage() {
  return <FeatureComponent />
}
