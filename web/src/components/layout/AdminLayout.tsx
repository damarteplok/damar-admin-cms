import { Outlet, useNavigate } from '@tanstack/react-router'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useAuth } from '@/lib/auth-hooks'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useEffect } from 'react'
import { AdminLayoutSkeleton } from './AdminLayoutSkeleton'
import { StatusPage } from './StatusPage'

export function AdminLayout({ children }: { children?: React.ReactNode }) {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isHydrated && !auth.isLoading) {
      if (!auth.isAuthenticated) {
        navigate({
          to: '/login',
          search: { redirect: window.location.pathname },
        })
      } else if (!auth.isAdmin) {
        navigate({ to: '/' })
      }
    }
  }, [
    auth.isHydrated,
    auth.isLoading,
    auth.isAuthenticated,
    auth.isAdmin,
    navigate,
  ])

  if (!auth.isHydrated || auth.isLoading) {
    return <AdminLayoutSkeleton />
  }

  if (!auth.isAdmin) {
    return (
      <StatusPage
        code={403}
        message="Access Denied"
        description="You don't have permission to access this page."
        action={
          <a href="/" className="text-primary hover:underline">
            Go back home
          </a>
        }
      />
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {auth.user && auth.user.emailVerified === false && (
          <div className="p-4">
            <Alert>
              <AlertTitle>Please verify your email</AlertTitle>
              <AlertDescription>
                Your email is not verified. Check your inbox for the
                verification link to unlock full access.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children || <Outlet />}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
