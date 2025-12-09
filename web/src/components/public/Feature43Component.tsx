import {
  BatteryCharging,
  GitPullRequest,
  Layers,
  RadioTower,
  SquareKanban,
  WandSparkles,
} from 'lucide-react'

interface Feature {
  heading: string
  description: string
  icon: React.ReactNode
}

interface Feature43ComponentProps {
  title?: string
  features?: Feature[]
}

const defaultFeatures: Feature[] = [
  {
    heading: 'Multi-Tenancy',
    description:
      'Enterprise-grade tenant isolation with dedicated data and configuration. Scale from single to thousands of tenants seamlessly with proper authorization.',
    icon: <GitPullRequest className="size-6" />,
  },
  {
    heading: 'User Management',
    description:
      'Complete user lifecycle management with advanced roles and permissions. Manage profiles, authentication, and authorization with ease.',
    icon: <SquareKanban className="size-6" />,
  },
  {
    heading: 'GraphQL API',
    description:
      'Single entry point via GraphQL API Gateway with built-in authentication, rate limiting, and comprehensive security features.',
    icon: <RadioTower className="size-6" />,
  },
  {
    heading: 'Microservices',
    description:
      'Modern microservices architecture with gRPC communication. Each domain operates independently for better scalability.',
    icon: <WandSparkles className="size-6" />,
  },
  {
    heading: 'Cloud-Native',
    description:
      'Kubernetes-ready deployment with container orchestration. Built for modern cloud infrastructure and DevOps workflows.',
    icon: <Layers className="size-6" />,
  },
  {
    heading: 'Subscription & Billing',
    description:
      'Flexible subscription plans with automated billing and payment processing. Support for multiple payment gateways and currencies.',
    icon: <BatteryCharging className="size-6" />,
  },
]

export const Feature43Component = ({
  title = 'Everything you need for modern SaaS',
  features = defaultFeatures,
}: Feature43ComponentProps) => {
  return (
    <section className="w-full bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {title}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-border bg-background p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative flex flex-col">
                {/* Icon */}
                <div className="bg-primary/10 text-primary mb-5 flex size-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold">{feature.heading}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
