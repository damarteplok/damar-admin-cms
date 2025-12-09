interface Stat {
  id: string
  value: string
  label: string
}

interface StatsComponentProps {
  heading?: string
  description?: string
  stats?: Stat[]
}

const defaultStats: Stat[] = [
  {
    id: 'stat-1',
    value: '99.9%',
    label: 'Uptime guarantee with enterprise SLA',
  },
  {
    id: 'stat-2',
    value: '1000+',
    label: 'Active tenants across all deployments',
  },
  {
    id: 'stat-3',
    value: '< 100ms',
    label: 'Average API response time globally',
  },
  {
    id: 'stat-4',
    value: '24/7',
    label: 'Support with dedicated engineering team',
  },
]

export const StatsComponent = ({
  heading = 'Platform performance metrics',
  description = 'Built for reliability and scale from day one',
  stats = defaultStats,
}: StatsComponentProps) => {
  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-muted/50 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative flex flex-col gap-3">
                  {/* Value */}
                  <div className="text-primary break-words text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {stat.label}
                  </p>

                  {/* Index number */}
                  <div className="text-muted-foreground/30 absolute right-4 top-4 text-sm font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
