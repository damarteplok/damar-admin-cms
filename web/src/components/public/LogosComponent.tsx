import { Star } from 'lucide-react'

interface Logo {
  name: string
  logo: string
  className: string
}

interface LogosComponentProps {
  title?: string
  subtitle?: string
  logos?: Logo[]
}

const defaultLogos: Logo[] = [
  {
    name: 'Vercel',
    logo: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/vercel-wordmark.svg',
    className: 'h-7 w-auto',
  },
  {
    name: 'Tailwind',
    logo: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-wordmark.svg',
    className: 'h-5 w-auto',
  },
  {
    name: 'Supabase',
    logo: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/supabase-wordmark.svg',
    className: 'h-6 w-auto',
  },
  {
    name: 'Figma',
    logo: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/figma-wordmark.svg',
    className: 'h-5 w-auto',
  },
  {
    name: 'Astro',
    logo: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/astro-wordmark.svg',
    className: 'h-6 w-auto',
  },
]

export const LogosComponent = ({
  title = 'Trusted by industry leaders',
  subtitle = 'Join thousands of companies building with our platform',
  logos = defaultLogos,
}: LogosComponentProps) => {
  return (
    <section className="w-full border-t border-border bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Rating Stars */}
          <div className="mb-4 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="text-primary size-5 fill-current" />
            ))}
          </div>

          {/* Title */}
          <h2 className="mb-2 text-2xl font-bold md:text-3xl">{title}</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl text-sm md:text-base">
            {subtitle}
          </p>

          {/* Logos Grid */}
          <div className="flex w-full flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 lg:gap-x-16">
            {logos.map((logo, index) => (
              <div
                key={index}
                className="transition-transform hover:scale-110"
              >
                <img
                  src={logo.logo}
                  alt={`${logo.name} logo`}
                  className={logo.className}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
