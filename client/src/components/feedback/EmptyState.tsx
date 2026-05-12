export type EmptyStateProps = {
  title?: string
  message?: string
}

export const EmptyState = ({
  title = 'No data found',
  message = 'There is no information to show here yet.',
}: EmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
