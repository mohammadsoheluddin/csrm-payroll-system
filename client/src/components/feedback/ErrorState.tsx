export type ErrorStateProps = {
  title?: string
  message?: string
}

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Please try again. If the problem continues, contact the system administrator.',
}: ErrorStateProps) => {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center shadow-sm">
      <p className="text-base font-semibold text-destructive">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
