import LangSwitcher from '@/components/lang-switcher'
import { useTranslation } from 'react-i18next'

interface FooterLink {
  title?: string
  titleKey?: string
  url: string
}

interface Footer1Props {
  copyright?: string
  links?: FooterLink[]
}

export function Footer1({
  copyright = '© 2025 Damar CMS. All rights reserved.',
  links = [
    { titleKey: 'footer.privacy', url: '#' },
    { titleKey: 'footer.terms', url: '#' },
    { titleKey: 'footer.support', url: '#' },
  ],
}: Footer1Props) {
  const { t } = useTranslation()

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{copyright}</p>
          <div className="flex items-center gap-6">
            <div className="flex gap-6">
              {links.map((link, idx) => {
                const key = link.titleKey || link.title || String(idx)
                const title = link.titleKey ? t(link.titleKey) : link.title

                return (
                  <a
                    key={key}
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {title}
                  </a>
                )
              })}
            </div>
            <div>
              {/* Language selector in footer */}
              <LangSwitcher className="text-sm" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
