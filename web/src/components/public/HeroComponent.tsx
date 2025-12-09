import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface HeroComponentProps {
  badge?: {
    text: string
    link?: string
  }
  heading?: string
  description?: string
  buttons?: {
    primary?: {
      text: string
      url: string
    }
    secondary?: {
      text: string
      url: string
    }
  }
  previewImage?: string
}

export const HeroComponent = ({
  badge = {
    text: 'Quick guide to get started',
    link: '/docs',
  },
  heading = 'The fastest way to deploy and scale web applications',
  description = 'Deploy and scale web applications with a streamlined workflow that supports any modern framework for fast and reliable performance.',
  buttons = {
    primary: {
      text: 'Get started',
      url: '/signup',
    },
    secondary: {
      text: 'Request a demo',
      url: '/contact',
    },
  },
  previewImage = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=900&fit=crop',
}: HeroComponentProps) => {
  return (
    <section className="w-full bg-background py-20 md:py-32 lg:py-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Content */}
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          {badge && (
            <a
              href={badge.link || '#'}
              className="bg-muted hover:bg-muted/80 mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              {badge.text}
              <ArrowRight className="size-3" />
            </a>
          )}

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
            {heading}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mx-auto mb-10 max-w-3xl text-base leading-relaxed md:text-lg lg:text-xl">
            {description}
          </p>

          {/* Buttons */}
          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {buttons.primary && (
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full px-8 sm:w-auto"
              >
                <a href={buttons.primary.url}>{buttons.primary.text}</a>
              </Button>
            )}
            {buttons.secondary && (
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <a href={buttons.secondary.url}>{buttons.secondary.text}</a>
              </Button>
            )}
          </div>

          {/* Preview Image */}
          <div className="relative">
            <div className="bg-muted/50 overflow-hidden rounded-2xl border border-border p-4 shadow-2xl md:p-6">
              <div className="bg-background overflow-hidden rounded-lg border border-border">
                <img
                  src={previewImage}
                  alt="Dashboard preview"
                  className="w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
