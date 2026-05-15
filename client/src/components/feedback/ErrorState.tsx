import { AlertTriangle } from 'lucide-react'

export type ErrorStateProps = {
  title?: string
  message?: string
}

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Please try again. If the problem continues, contact the system administrator.',
}: ErrorStateProps) => {
  return (
    <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-6 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-base font-bold text-destructive">{title}</p>
      <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-muted-foreground">{message}</p>
    </div>
  )
}
