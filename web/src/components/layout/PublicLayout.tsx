import { Outlet } from '@tanstack/react-router'
import { Navbar1 } from '@/components/navbar1'
import { Footer1 } from '@/components/footer1'
import { useAuth } from '@/lib/auth-hooks'
import { UserNav } from './UserNav'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function PublicLayout({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuth()

  const menuItems = [
    { title: 'Home', url: '/' },
    { title: 'Features', url: '/features' },
    { title: 'Pricing', url: '/pricing' },
    { title: 'Blog', url: '/blog' },
    { title: 'Contact', url: '/contact' },
    ...(isAuthenticated ? [{ title: 'Workspace', url: '/workspace' }] : []),
  ]

  const authConfig = {
    login: { title: 'Login', url: '/login' },
    signup: { title: 'Sign Up', url: '/signup' },
  }

  const renderAuthComponent = () => {
    if (!isHydrated) {
      return (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
        </div>
      )
    }

    // After hydration, show appropriate UI
    if (isAuthenticated) {
      return <UserNav />
    }

    return (
      <>
        <Button asChild variant="outline" size="sm">
          <a href="/login">Login</a>
        </Button>
        <Button asChild size="sm">
          <a href="/signup">Sign Up</a>
        </Button>
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
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

      {/* Main Content with Container */}
      <main className="flex-1">
        <div className="container mx-auto px-4">{children || <Outlet />}</div>
      </main>

      {/* Footer */}
      <Footer1 />
    </div>
  )
}
