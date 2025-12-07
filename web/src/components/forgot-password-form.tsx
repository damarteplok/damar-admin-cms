import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link } from '@tanstack/react-router'
import { useMutation } from 'urql'
import { useForm } from '@tanstack/react-form'
import {
  FORGOT_PASSWORD_MUTATION,
  type ForgotPasswordResponse,
} from '@/lib/graphql/auth.graphql'
import { useState } from 'react'

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [result, send] = useMutation<ForgotPasswordResponse>(
    FORGOT_PASSWORD_MUTATION,
  )
  const [serverMessage, setServerMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      setServerMessage(null)
      const res = await send({ email: value.email })
      if (res.error) {
        setServerMessage({ type: 'error', text: res.error.message })
        return
      }
      if (!res.data?.forgotPassword.success) {
        setServerMessage({
          type: 'error',
          text: res.data?.forgotPassword.message || 'Request failed',
        })
        return
      }
      setServerMessage({
        type: 'success',
        text:
          res.data.forgotPassword.message ||
          'Check your email for reset instructions.',
      })
    },
  })

  return (
    <div
      className={cn('flex flex-col gap-6 max-w-md mx-auto w-full', className)}
      {...props}
    >
      {serverMessage && (
        <Alert
          variant={serverMessage.type === 'error' ? 'destructive' : undefined}
        >
          <AlertTitle>
            {serverMessage.type === 'error' ? 'Error' : 'Success'}
          </AlertTitle>
          <AlertDescription>{serverMessage.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="grid gap-4"
          >
            <FieldGroup>
              <div className="text-center">
                <h1 className="text-2xl font-bold">Forgot your password?</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send reset instructions.
                </p>
              </div>

              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Email is required'
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                      return 'Invalid email address'
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <div className="text-sm text-red-600">
                        {String(field.state.meta.errors[0])}
                      </div>
                    )}
                  </Field>
                )}
              </form.Field>

              <Field>
                <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!canSubmit || isSubmitting || result.fetching}
                    >
                      {isSubmitting || result.fetching
                        ? 'Submitting...'
                        : 'Send reset email'}
                    </Button>
                  )}
                </form.Subscribe>
              </Field>

              <FieldSeparator>Back to</FieldSeparator>
              <FieldDescription className="text-center">
                <Link
                  to="/login"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Login
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
