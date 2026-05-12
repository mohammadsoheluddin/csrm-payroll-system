export type LoadingStateProps = {
  title?: string
  message?: string
}

export const LoadingState = ({
  title = 'Loading...',
  message = 'Please wait while the system prepares the data.',
}: LoadingStateProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
