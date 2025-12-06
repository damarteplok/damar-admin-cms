import { Outlet } from '@tanstack/react-router'
import { Navbar1 } from '@/components/navbar1'

export function PublicLayout({ children }: { children?: React.ReactNode }) {
  // Check if user is logged in (simple check, SSR is disabled for this route)
  const isLoggedIn =
    typeof window !== 'undefined' && !!localStorage.getItem('token')

  const menuItems = [
    { title: 'Home', url: '/' },
    { title: 'Features', url: '/features' },
    { title: 'Pricing', url: '/pricing' },
    { title: 'Blog', url: '/blog' },
    { title: 'Contact', url: '/contact' },
    { title: 'Workspace', url: '/workspace' },
  ]

  const authConfig = isLoggedIn
    ? {
        login: { title: 'Dashboard', url: '/admin' },
        signup: { title: 'Logout', url: '#' },
      }
    : {
        login: { title: 'Login', url: '/login' },
        signup: { title: 'Sign Up', url: '/signup' },
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
      />

      {/* Main Content with Container */}
      <main className="flex-1">
        <div className="container mx-auto px-4">{children || <Outlet />}</div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Damar CMS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
