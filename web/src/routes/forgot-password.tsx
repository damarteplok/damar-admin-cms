import { createFileRoute, redirect } from '@tanstack/react-router'
import { ForgotPasswordForm } from '@/components/forgot-password-form'

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: async () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('token')

      if (accessToken) {
        throw redirect({ to: '/' })
      }
    }
  },
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="container px-4">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
