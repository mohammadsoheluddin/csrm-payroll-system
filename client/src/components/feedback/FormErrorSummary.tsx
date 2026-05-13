import type { FieldErrors, FieldValues } from 'react-hook-form'

import { getFirstFormErrorMessage } from '@/lib/api/apiError'

export type FormErrorSummaryProps<TFieldValues extends FieldValues> = {
  errors: FieldErrors<TFieldValues>
  serverError?: string | null
}

export const FormErrorSummary = <TFieldValues extends FieldValues>({
  errors,
  serverError,
}: FormErrorSummaryProps<TFieldValues>) => {
  const firstClientError = getFirstFormErrorMessage(errors)
  const message = serverError ?? firstClientError

  if (!message) {
    return null
  }

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
      {message}
    </div>
  )
}
