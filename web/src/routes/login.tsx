import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAccessToken } from '@/lib/auth'
import { LoginForm } from '@/components/login-form'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    // Run only in the browser: if there's an access token we treat user as authenticated
    if (typeof window !== 'undefined') {
      const accessToken = getAccessToken()

      if (accessToken) {
        throw redirect({ to: '/' })
      }
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="container px-4">
        <LoginForm />
      </div>
    </div>
  )
}
