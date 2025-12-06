import { createFileRoute } from '@tanstack/react-router'
import { Pricing2 } from '@/components/pricing2'

export const Route = createFileRoute('/_layout/pricing')({
  component: PricingPage,
})

function PricingPage() {
  return (
    <Pricing2
      heading="Simple, Transparent Pricing"
      description="Choose the plan that fits your needs. All plans include core features with 14-day free trial."
      plans={[
        {
          id: 'starter',
          name: 'Starter',
          description: 'Perfect for small teams',
          monthlyPrice: '$29',
          yearlyPrice: '$290',
          features: [
            { text: 'Up to 5 users' },
            { text: '3 workspaces' },
            { text: 'Basic analytics' },
            { text: 'Email support' },
            { text: 'SSL certificate' },
          ],
          button: {
            text: 'Start Free Trial',
            url: '/signup',
          },
        },
        {
          id: 'professional',
          name: 'Professional',
          description: 'For growing teams',
          monthlyPrice: '$99',
          yearlyPrice: '$990',
          features: [
            { text: 'Up to 20 users' },
            { text: 'Unlimited workspaces' },
            { text: 'Advanced analytics' },
            { text: 'Priority support' },
            { text: 'Custom integrations' },
            { text: 'API access' },
          ],
          button: {
            text: 'Start Free Trial',
            url: '/signup',
          },
        },
      ]}
    />
  )
}
