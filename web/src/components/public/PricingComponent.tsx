import { Check } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

interface PricingPlan {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
    currency: string
  }
  features: string[]
  buttonText: string
  buttonUrl: string
  highlighted?: boolean
}

interface PricingComponentProps {
  heading?: string
  subheading?: string
  plans?: PricingPlan[]
}

const defaultPlans: PricingPlan[] = [
  {
    id: 'sandbox',
    name: 'Sandbox',
    description: 'Perfect for prototypes, hobby apps, and internal tools.',
    price: {
      monthly: 59,
      yearly: 590,
      currency: '€',
    },
    features: [
      'One-click git import',
      'Instant deployments',
      'Unlimited apps',
      'Lightweight logs & metrics',
      'Auto-sleep on idle',
      'Shared cloud domains',
      'Network-level protection',
      'Essential support',
    ],
    buttonText: 'Start for free',
    buttonUrl: '#',
    highlighted: false,
  },
  {
    id: 'production',
    name: 'Production',
    description: 'Autoscaling, custom domains, and fast performance.',
    price: {
      monthly: 149,
      yearly: 1490,
      currency: '€',
    },
    features: [
      'Everything in sandbox',
      'Autoscaling on demand',
      'Faster CPU & memory',
      'Bring your own domain',
      'Extended log retention',
      'Priority deploy queue',
      'Environment secrets',
      'Custom build pipelines',
      'Preview deployments',
      'Role-based access control',
    ],
    buttonText: 'Upgrade to production',
    buttonUrl: '#',
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Dedicated compute, secure networking, and team tools.',
    price: {
      monthly: 399,
      yearly: 3990,
      currency: '€',
    },
    features: [
      'Everything in production',
      'Reserved compute instances',
      'Team management and roles',
      'Private networking options',
      'Early access to new features',
      'Custom IP ranges',
      'Audit logs & compliance reports',
      'Advanced metrics & monitoring',
    ],
    buttonText: 'Go business',
    buttonUrl: '#',
    highlighted: false,
  },
]

export const PricingComponent = ({
  heading = 'Plans for every stage of growth',
  subheading = "Whether you're building a side project or scaling a business, choose a plan that fits your needs.",
  plans = defaultPlans,
}: PricingComponentProps) => {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {heading}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              {subheading}
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center gap-3 rounded-full bg-muted p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                !isYearly
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                isYearly
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = isYearly ? plan.price.yearly : plan.price.monthly

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.highlighted
                    ? 'border-primary shadow-lg ring-1 ring-primary/20'
                    : 'border-border'
                }`}
              >
                <CardHeader className="space-y-4 pb-8">
                  {/* Plan Name & Description */}
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      {plan.price.currency} {price}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Features List */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="text-primary mt-0.5 size-4 flex-shrink-0" />
                        <span className="text-foreground text-sm leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto pt-6">
                  <Button
                    asChild
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }`}
                  >
                    <a href={plan.buttonUrl}>{plan.buttonText}</a>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
