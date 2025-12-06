import { createFileRoute } from '@tanstack/react-router'
import { SignupForm } from '@/components/signup-form'

export const Route = createFileRoute('/signup')({
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
