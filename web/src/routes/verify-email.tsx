import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useMutation } from 'urql'
import {
  VERIFY_EMAIL_MUTATION,
  type VerifyEmailResponse,
} from '@/lib/graphql/auth.graphql'
import { useAuth } from '@/lib/auth-hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useTranslation } from 'react-i18next'
import { CheckCircle2Icon } from 'lucide-react'

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const auth = useAuth()
  const { t } = useTranslation()
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState<string | null>(null)

  const [, verify] = useMutation<VerifyEmailResponse>(VERIFY_EMAIL_MUTATION)

  const calledRef = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Verification token not provided')
      return
    }

    if (calledRef.current) return
    calledRef.current = true

    let mounted = true

    ;(async () => {
      setStatus('loading')
      try {
        const res = await verify({ token })
        if (!mounted) return

        if (res.error) {
          setStatus('error')
          setMessage(res.error.message)
          return
        }

        const ok = res.data?.verifyEmail?.success
        const msg = res.data?.verifyEmail?.message || null

        if (ok) {
          setStatus('success')
          setMessage(msg || 'Email verified successfully')

          if (auth.isAuthenticated) {
            try {
              await auth.refreshAuth()
            } catch (e) {
              console.warn('Failed to refresh auth after verification', e)
            }
          }
        } else {
          setStatus('error')
          setMessage(msg || 'Verification failed')
        }
      } catch (err) {
        if (!mounted) return
        setStatus('error')
        setMessage(err instanceof Error ? err.message : String(err))
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="container px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              {status === 'loading' && <div>Verifying your email…</div>}

              {status === 'error' && (
                <Alert variant="destructive">
                  <AlertTitle>Verification Failed</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {status === 'success' && (
                <Alert>
                  <CheckCircle2Icon />
                  <AlertTitle>Verified!</AlertTitle>
                  <AlertDescription>
                    {message || 'Your email has been successfully verified.'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-6 flex gap-3">
                <Link to="/">
                  <Button variant="outline">
                    {t('navbar.home', { defaultValue: 'Home' })}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
