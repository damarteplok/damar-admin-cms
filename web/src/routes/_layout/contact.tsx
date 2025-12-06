import { createFileRoute } from '@tanstack/react-router'
import { Contact7 } from '@/components/contact7'

export const Route = createFileRoute('/_layout/contact')({
  component: ContactPage,
})

function ContactPage() {
  return (
    <Contact7
      title="Get in Touch"
      description="Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
      emailLabel="Email"
      emailDescription="We respond to all emails within 24 hours."
      email="support@damarcms.com"
      officeLabel="Office"
      officeDescription="Drop by our office for a chat."
      officeAddress="123 Tech Street, San Francisco, CA 94107"
      phoneLabel="Phone"
      phoneDescription="We're available Mon-Fri, 9am-6pm EST."
      phone="+1 (555) 123-4567"
      chatLabel="Live Chat"
      chatDescription="Get instant help from our support team."
      chatLink="Start a conversation"
    />
  )
}
