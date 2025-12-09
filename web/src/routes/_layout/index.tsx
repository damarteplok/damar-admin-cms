import { createFileRoute } from '@tanstack/react-router'

import { Feature43Component } from '@/components/public/Feature43Component'
import { FaqComponent } from '@/components/public/FaqComponent'
import { HeroComponent } from '@/components/public/HeroComponent'
import { LogosComponent } from '@/components/public/LogosComponent'
import { StatsComponent } from '@/components/public/StatsComponent'

export const Route = createFileRoute('/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <HeroComponent />
      <Feature43Component />
      <StatsComponent />
      <FaqComponent />
      <LogosComponent />
    </>
  )
}
