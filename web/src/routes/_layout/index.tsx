import { Hero1 } from '@/components/hero1'
import { Feature43 } from '@/components/feature43'
import { Faq1 } from '@/components/faq1'
import { Compliance1 } from '@/components/compliance1'
import { createFileRoute } from '@tanstack/react-router'
import { Services4 } from '@/components/services4'
import { Logos8 } from '@/components/logos8'
import { Stats8 } from '@/components/stats8'

export const Route = createFileRoute('/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Hero1 />
      <Feature43 />
      <Stats8 />
      <Faq1 />
      <Logos8 />
    </>
  )
}
