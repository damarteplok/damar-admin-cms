import { HelpCircle } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FaqItem {
  id: string
  question: string
  answer: string
}

interface FaqComponentProps {
  heading?: string
  items?: FaqItem[]
}

const defaultItems: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What is damar-admin-cms?',
    answer:
      'damar-admin-cms is a modern, Go-based multi-tenant SaaS admin platform that provides comprehensive tenant management, user administration, product catalogs, and subscription handling.',
  },
  {
    id: 'faq-2',
    question: 'How does multi-tenancy work?',
    answer:
      'Our platform provides enterprise-grade tenant isolation with dedicated data and configuration for each customer. You can scale from a single tenant to thousands seamlessly with proper authorization and data separation.',
  },
  {
    id: 'faq-3',
    question: 'What technology stack is used?',
    answer:
      'We use Go 1.25.1 for microservices, GraphQL API Gateway, PostgreSQL database, RabbitMQ for messaging, and Kubernetes for orchestration. The frontend is built with TanStack Start.',
  },
  {
    id: 'faq-4',
    question: 'Is it suitable for enterprises?',
    answer:
      'Yes! The platform is built with enterprise requirements in mind, including scalability, security, multi-tenancy, role-based access control, and comprehensive audit logging.',
  },
  {
    id: 'faq-5',
    question: 'How do subscriptions and billing work?',
    answer:
      'We provide flexible subscription plans with automated billing, payment processing, and invoice management. Support for multiple payment gateways and currencies is built-in.',
  },
  {
    id: 'faq-6',
    question: 'What kind of support is available?',
    answer:
      '24/7 support with a dedicated engineering team. We provide comprehensive documentation, active community assistance, and priority support for enterprise customers.',
  },
]

export const FaqComponent = ({
  heading = 'Frequently asked questions',
  items = defaultItems,
}: FaqComponentProps) => {
  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
            <HelpCircle className="size-6" />
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            Find answers to common questions about our platform
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, index) => (
            <AccordionItem
              key={item.id}
              value={`item-${index}`}
              className="border-border rounded-lg border px-6 data-[state=open]:bg-muted/30"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline [&[data-state=open]]:text-primary">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pt-1 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4 text-sm">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  )
}
