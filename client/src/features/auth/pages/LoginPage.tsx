import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { FormErrorSummary } from '@/components/feedback/FormErrorSummary'
import { Button } from '@/components/ui/Button'
import { routePaths } from '@/config/routePaths'
import { loginUser, getMyProfile } from '@/features/auth/api/auth.api'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema'
import { applyApiFieldErrors, normalizeApiError } from '@/lib/api/apiError'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/stores/auth.store'

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const from = location.state?.from as string | undefined

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)

    try {
      const { accessToken } = await loginUser(values)
      useAuthStore.getState().setAccessToken(accessToken)
      const user = await getMyProfile()
      setAuthenticated({ accessToken, user })
      toast.success('Login successful')
      navigate(from ?? routePaths.dashboard, { replace: true })
    } catch (error) {
      const normalizedError = normalizeApiError(error)
      applyApiFieldErrors<LoginFormValues>(error, setError)
      setServerError(normalizedError.message)
      toast.error(normalizedError.message)
    }
  }

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden border-r border-border bg-muted/40 p-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">CSRM</p>
              <h1 className="text-2xl font-bold tracking-tight">Payroll System</h1>
            </div>
          </div>

          <div className="mt-24 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Part-F3 Auth Foundation
            </p>
            <h2 className="mt-5 text-4xl font-bold tracking-tight">
              Secure payroll access for HR, Accounts, Managers, and Employees.
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Login connects with the locked backend auth routes, stores the short-lived access
              token in frontend state, uses the HTTP-only refresh cookie, and protects ERP routes
              by session and permission.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          {['JWT Login', 'Protected Routes', 'Role Permissions'].map((item) => (
            <div key={item} className="rounded-2xl border border-border bg-card p-4 font-semibold shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">CSRM Payroll System</p>
              <h1 className="text-2xl font-bold tracking-tight">Login</h1>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold text-primary">Welcome back</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Sign in to continue</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use an existing backend user account created during backend testing.
              </p>
            </div>

            <div className="mt-6">
              <FormErrorSummary<LoginFormValues> errors={errors} serverError={serverError} />
            </div>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email address
                </label>
                <div
                  className={cn(
                    'mt-2 flex items-center gap-2 rounded-2xl border bg-background px-3 py-2.5 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10',
                    errors.email ? 'border-destructive' : 'border-border',
                  )}
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@example.com"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-xs font-medium text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </label>
                <div
                  className={cn(
                    'mt-2 flex items-center gap-2 rounded-2xl border bg-background px-3 py-2.5 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10',
                    errors.password ? 'border-destructive' : 'border-border',
                  )}
                >
                  <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-xs font-medium text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-xs leading-5 text-muted-foreground">
              Refresh token is handled through backend HTTP-only cookie. The frontend only keeps
              the active access token in app state.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
