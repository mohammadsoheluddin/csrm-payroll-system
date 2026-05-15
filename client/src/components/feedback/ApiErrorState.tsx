import { AlertTriangle, CircleAlert, ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { getErrorDisplayVariant, normalizeApiError } from '@/lib/api/apiError'
import { cn } from '@/lib/utils/cn'

export type ApiErrorStateProps = {
  error: unknown
  onRetry?: () => void
  className?: string
}

const variantStyles = {
  destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  info: 'border-primary/30 bg-primary/10 text-primary',
}

export const ApiErrorState = ({ error, onRetry, className }: ApiErrorStateProps) => {
  const normalizedError = normalizeApiError(error)
  const variant = getErrorDisplayVariant(normalizedError)
  const Icon =
    normalizedError.status === 403
      ? ShieldAlert
      : normalizedError.status === 409
        ? CircleAlert
        : AlertTriangle

  return (
    <div className={cn('rounded-3xl border p-5 shadow-sm backdrop-blur-xl', variantStyles[variant], className)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-background/70">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">{normalizedError.title}</p>
            {normalizedError.status && (
              <span className="rounded-full bg-background/70 px-2 py-0.5 text-xs font-bold">
                HTTP {normalizedError.status}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-6 opacity-90">{normalizedError.message}</p>

          {normalizedError.errorSources.length > 0 && (
            <ul className="mt-3 grid gap-1 text-sm opacity-90">
              {normalizedError.errorSources.map((source) => (
                <li key={`${source.path}-${source.message}`} className="rounded-xl bg-background/45 px-3 py-2">
                  <span className="font-bold">{source.path}:</span> {source.message}
                </li>
              ))}
            </ul>
          )}

          {onRetry && (
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
