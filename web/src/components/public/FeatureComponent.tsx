import {
  Cloud,
  Code2,
  Gauge,
  Globe,
  Lock,
  RefreshCcw,
  Server,
  Zap,
} from 'lucide-react'

interface Feature {
  id: string
  icon: React.ReactNode
  title: string
  description: string
}

interface FeatureComponentProps {
  heading?: string
  subheading?: string
  previewImage?: string
  features?: Feature[]
}

const defaultFeatures: Feature[] = [
  {
    id: '1',
    icon: <Zap className="size-5" />,
    title: 'One-click deployment',
    description: 'Deploy your apps instantly to the cloud with zero configuration.',
  },
  {
    id: '2',
    icon: <Gauge className="size-5" />,
    title: 'Auto-scaling',
    description: 'Scale automatically based on demand without lifting a finger.',
  },
  {
    id: '3',
    icon: <Globe className="size-5" />,
    title: 'Global edge network',
    description: 'Serve content and functions from edge locations close to your users.',
  },
  {
    id: '4',
    icon: <Code2 className="size-5" />,
    title: 'Git integration',
    description: 'Connect your Git provider and deploy every push with no downtime.',
  },
  {
    id: '5',
    icon: <Lock className="size-5" />,
    title: 'Built-in security',
    description: 'All deployments are secured with SSL, firewalls, and isolated environments.',
  },
  {
    id: '6',
    icon: <RefreshCcw className="size-5" />,
    title: 'Zero downtime rollbacks',
    description: 'Revert deployments instantly with zero user disruption.',
  },
  {
    id: '7',
    icon: <Server className="size-5" />,
    title: 'Serverless functions',
    description: 'Run backend logic at the edge without provisioning servers.',
  },
  {
    id: '8',
    icon: <Cloud className="size-5" />,
    title: 'Performance monitoring',
    description: 'Track app performance, errors, and latency in real time.',
  },
]

export const FeatureComponent = ({
  heading = 'Everything you need to deploy fast',
  subheading = 'From instant previews to global scaling, deploy your apps with confidence using a powerful developer-first platform.',
  previewImage = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
  features = defaultFeatures,
}: FeatureComponentProps) => {
  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {heading}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed md:text-lg">
            {subheading}
          </p>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/* Left Column - Preview Image/Dashboard */}
          <div className="order-2 lg:order-1">
            <div className="bg-muted/50 overflow-hidden rounded-2xl border border-border p-6 shadow-lg">
              <div className="bg-background overflow-hidden rounded-lg border border-border shadow-sm">
                <img
                  src={previewImage}
                  alt="Dashboard preview"
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Features List */}
          <div className="order-1 space-y-8 lg:order-2">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-start gap-4">
                {/* Icon */}
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold leading-tight">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
