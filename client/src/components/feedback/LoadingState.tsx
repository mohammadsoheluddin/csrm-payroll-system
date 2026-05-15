export type LoadingStateProps = {
  title?: string
  message?: string
}

export const LoadingState = ({
  title = 'Loading...',
  message = 'Please wait while the system prepares the data.',
}: LoadingStateProps) => {
  return (
    <div className="csrm-premium-surface rounded-3xl p-6 text-center">
      <div className="mx-auto mb-4 grid w-full max-w-sm gap-3">
        <div className="csrm-skeleton mx-auto h-3 w-28" />
        <div className="csrm-skeleton h-2.5 w-full" />
        <div className="csrm-skeleton mx-auto h-2.5 w-4/5" />
      </div>
      <p className="text-base font-bold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{message}</p>
    </div>
  )
}
