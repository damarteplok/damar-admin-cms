import { createFileRoute } from '@tanstack/react-router'

import { ContactComponent } from '@/components/public/ContactComponent'

export const Route = createFileRoute('/_layout/contact')({
  component: ContactPage,
})

function ContactPage() {
  return <ContactComponent />
}
