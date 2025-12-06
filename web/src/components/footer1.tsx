interface FooterLink {
  title: string
  url: string
}

interface Footer1Props {
  copyright?: string
  links?: FooterLink[]
}

export function Footer1({
  copyright = '© 2025 Damar CMS. All rights reserved.',
  links = [
    { title: 'Privacy', url: '#' },
    { title: 'Terms', url: '#' },
    { title: 'Support', url: '#' },
  ],
}: Footer1Props) {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{copyright}</p>
          <div className="flex gap-6">
            {links.map((link) => (
              <a
                key={link.title}
                href={link.url}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
