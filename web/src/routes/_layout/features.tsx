import { createFileRoute } from '@tanstack/react-router'
import { Feature72 } from '@/components/feature72'

export const Route = createFileRoute('/_layout/features')({
  component: FeaturesPage,
})

function FeaturesPage() {
  return (
    <Feature72
      title="Powerful Features for Modern SaaS"
      description="Everything you need to build, manage, and scale your multi-tenant application with enterprise-grade security and performance."
      buttonText="Explore all features"
      buttonUrl="/contact"
      features={[
        {
          id: 'feature-1',
          heading: 'User Management',
          description:
            'Complete user lifecycle management with advanced roles, permissions, and secure tenant isolation. Manage user profiles, authentication, and authorization with ease.',
          image:
            'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg',
          url: '/features',
        },
        {
          id: 'feature-2',
          heading: 'Multi-Tenancy',
          description:
            'Enterprise-grade tenant isolation with dedicated data and configuration for each customer. Scale from single to thousands of tenants seamlessly.',
          image:
            'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg',
          url: '/features',
        },
        {
          id: 'feature-3',
          heading: 'Subscription & Billing',
          description:
            'Flexible subscription plans with automated billing, payment processing, and invoice management. Support for multiple payment gateways and currencies.',
          image:
            'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg',
          url: '/features',
        },
        {
          id: 'feature-4',
          heading: 'API Gateway & Security',
          description:
            'GraphQL API Gateway with built-in authentication, rate limiting, and comprehensive security features. Monitor and control all API access.',
          image:
            'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-4.svg',
          url: '/features',
        },
      ]}
    />
  )
}
