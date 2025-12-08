import { Outlet } from '@tanstack/react-router'
import { Navbar1 } from '@/components/navbar1'
import { Footer1 } from '@/components/footer1'
import { useAuth } from '@/lib/auth-hooks'
import { UserNav } from './UserNav'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import i18n from '@/i18n'

export function PublicLayout({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuth()
  const { t } = useTranslation()

  const menuItems = [
    { title: 'Home', titleKey: 'navbar.home', url: '/' },
    { title: 'Features', titleKey: 'navbar.features', url: '/features' },
    { title: 'Pricing', titleKey: 'navbar.pricing', url: '/pricing' },
    { title: 'Blog', titleKey: 'navbar.blog', url: '/blog' },
    { title: 'Contact', titleKey: 'navbar.contact', url: '/contact' },
    ...(isAuthenticated
      ? [
          {
            title: 'Workspace',
            titleKey: 'navbar.workspace',
            url: '/workspace',
          },
        ]
      : []),
  ]

  const authConfig = {
    login: {
      title: t('navbar.login', { defaultValue: 'Login' }),
      url: '/login',
    },
    signup: {
      title: t('navbar.signup', { defaultValue: 'Sign Up' }),
      url: '/signup',
    },
  }

  const renderAuthComponent = () => {
    if (!isHydrated) {
      return (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
        </div>
      )
    }

    if (isAuthenticated) {
      return <UserNav />
    }

    return (
      <>
        <Button asChild variant="outline" size="sm">
          <a href="/login">{authConfig.login.title}</a>
        </Button>
        <Button asChild size="sm">
          <a href="/signup">{authConfig.signup.title}</a>
        </Button>
      </>
    )
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('i18nextLng')
    if (stored && i18n.language !== stored) {
      void i18n.changeLanguage(stored)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar1
        logo={{
          url: '/',
          src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg',
          alt: 'Damar CMS',
          title: 'Damar CMS',
        }}
        menu={menuItems}
        auth={authConfig}
        authComponent={renderAuthComponent()}
      />

      <main className="flex-1">
        <div className="container mx-auto px-4">
          {isHydrated &&
            isAuthenticated &&
            (() => {
              const { user } = useAuth()
              if (user && user.emailVerified === false) {
                return (
                  <div className="mb-4">
                    <Alert>
                      <AlertTitle>
                        {t('auth.verify_email_title', {
                          defaultValue: 'Please verify your email',
                        })}
                      </AlertTitle>
                      <AlertDescription>
                        {t('auth.verify_email_desc', {
                          defaultValue:
                            'We sent a verification link to your email — please check your inbox and verify your address to access all features.',
                        })}
                      </AlertDescription>
                    </Alert>
                  </div>
                )
              }
              return null
            })()}
          {children || <Outlet />}
        </div>
      </main>

      <Footer1 />
    </div>
  )
}
