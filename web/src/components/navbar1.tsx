'use client'

import { Book, Menu, Sunset, Trees, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import ThemeToggle from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: React.ReactNode
  items?: MenuItem[]
  // optional i18n keys
  titleKey?: string
  descriptionKey?: string
}

interface Navbar1Props {
  logo?: {
    url: string
    src: string
    alt: string
    title: string
  }
  menu?: MenuItem[]
  auth?: {
    login: {
      title: string
      url: string
    }
    signup: {
      title: string
      url: string
    }
  }
  authComponent?: React.ReactNode
}

const Navbar1 = ({
  logo = {
    url: 'https://www.shadcnblocks.com',
    src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg',
    alt: 'logo',
    title: 'Shadcnblocks.com',
  },
  authComponent,
  menu,
  auth = {
    login: { title: 'Login', url: '#' },
    signup: { title: 'Sign up', url: '#' },
  },
}: Navbar1Props) => {
  const { t } = useTranslation()

  // If no menu provided, build a default menu with i18n keys
  const resolvedMenu: MenuItem[] =
    menu && menu.length
      ? menu
      : [
          { title: 'Home', titleKey: 'navbar.home', url: '#' },
          {
            title: 'Products',
            titleKey: 'navbar.products',
            url: '#',
            items: [
              {
                title: 'Blog',
                titleKey: 'navbar.products.blog',
                descriptionKey: 'navbar.products.blog_desc',
                icon: <Book className="size-5 shrink-0" />,
                url: '#',
              },
              {
                title: 'Company',
                titleKey: 'navbar.products.company',
                descriptionKey: 'navbar.products.company_desc',
                icon: <Trees className="size-5 shrink-0" />,
                url: '#',
              },
              {
                title: 'Careers',
                titleKey: 'navbar.products.careers',
                descriptionKey: 'navbar.products.careers_desc',
                icon: <Sunset className="size-5 shrink-0" />,
                url: '#',
              },
              {
                title: 'Support',
                titleKey: 'navbar.products.support',
                descriptionKey: 'navbar.products.support_desc',
                icon: <Zap className="size-5 shrink-0" />,
                url: '#',
              },
            ],
          },
          {
            title: 'Resources',
            titleKey: 'navbar.resources',
            url: '#',
            items: [
              {
                title: 'Help Center',
                titleKey: 'navbar.resources.help_center',
                descriptionKey: 'navbar.resources.help_center_desc',
                icon: <Zap className="size-5 shrink-0" />,
                url: '#',
              },
              {
                title: 'Contact Us',
                titleKey: 'navbar.resources.contact_us',
                descriptionKey: 'navbar.resources.contact_us_desc',
                icon: <Sunset className="size-5 shrink-0" />,
                url: '#',
              },
              {
                title: 'Status',
                titleKey: 'navbar.resources.status',
                descriptionKey: 'navbar.resources.status_desc',
                icon: <Trees className="size-5 shrink-0" />,
                url: '#',
              },
              {
                title: 'Terms of Service',
                titleKey: 'navbar.resources.terms',
                descriptionKey: 'navbar.resources.terms_desc',
                icon: <Book className="size-5 shrink-0" />,
                url: '#',
              },
            ],
          },
          {
            title: 'Pricing',
            titleKey: 'navbar.pricing',
            url: '#',
          },
          {
            title: 'Blog',
            titleKey: 'navbar.blog',
            url: '#',
          },
        ]

  const tOr = (key?: string, fallback?: string) =>
    key ? t(key) : fallback || ''

  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {resolvedMenu.map((item) => renderMenuItem(item, tOr))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {authComponent ? (
              authComponent
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <a href={auth.login.url}>
                    {t('navbar.login', { defaultValue: auth.login.title })}
                  </a>
                </Button>
                <Button asChild size="sm">
                  <a href={auth.signup.url}>
                    {t('navbar.signup', { defaultValue: auth.signup.title })}
                  </a>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <img
                        src={logo.src}
                        className="max-h-8 dark:invert"
                        alt={logo.alt}
                      />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {resolvedMenu.map((item) =>
                      renderMobileMenuItem(item, tOr),
                    )}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-center">
                      <ThemeToggle />
                    </div>
                    {authComponent ? (
                      <div className="flex justify-center">{authComponent}</div>
                    ) : (
                      <>
                        <Button asChild variant="outline">
                          <a href={auth.login.url}>
                            {t('navbar.login', {
                              defaultValue: auth.login.title,
                            })}
                          </a>
                        </Button>
                        <Button asChild>
                          <a href={auth.signup.url}>
                            {t('navbar.signup', {
                              defaultValue: auth.signup.title,
                            })}
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  )
}

const renderMenuItem = (
  item: MenuItem,
  tOr: (k?: string, f?: string) => string,
) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>
          {item.titleKey ? tOr(item.titleKey, item.title) : item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} tOr={tOr} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {item.titleKey ? tOr(item.titleKey, item.title) : item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

const renderMobileMenuItem = (
  item: MenuItem,
  tOr: (k?: string, f?: string) => string,
) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.titleKey ? tOr(item.titleKey, item.title) : item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} tOr={tOr} />
          ))}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.titleKey ? tOr(item.titleKey, item.title) : item.title}
    </a>
  )
}

const SubMenuLink = ({
  item,
  tOr,
}: {
  item: MenuItem
  tOr?: (k?: string, f?: string) => string
}) => {
  return (
    <a
      className="hover:bg-muted hover:text-accent-foreground flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">
          {item.titleKey
            ? tOr
              ? tOr(item.titleKey, item.title)
              : item.title
            : item.title}
        </div>
        {(item.descriptionKey || item.description) && (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.descriptionKey
              ? tOr
                ? tOr(item.descriptionKey, item.description)
                : item.description
              : item.description}
          </p>
        )}
      </div>
    </a>
  )
}

export { Navbar1 }
