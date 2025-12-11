import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmail } from '@/components/features/auth'

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmail,
})
