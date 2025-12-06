import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/login-form'

export const Route = createFileRoute('/login')({
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
