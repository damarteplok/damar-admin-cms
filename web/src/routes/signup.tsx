import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignupForm } from '@/components/features/auth'
import { getAccessToken } from '@/lib/auth'

export const Route = createFileRoute('/signup')({
  beforeLoad: async () => {
    if (typeof window !== 'undefined') {
      const accessToken = getAccessToken()
      if (accessToken) {
        throw redirect({ to: '/' })
      }
    }
  },
  component: SignupPage,
})

function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="container px-4">
        <SignupForm />
      </div>
    </div>
  )
}
