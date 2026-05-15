import { Inbox } from 'lucide-react'

export type EmptyStateProps = {
  title?: string
  message?: string
}

export const EmptyState = ({
  title = 'No data found',
  message = 'There is no information to show here yet.',
}: EmptyStateProps) => {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/80 p-8 text-center shadow-sm backdrop-blur-xl">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Inbox className="h-6 w-6" />
      </div>
      <p className="text-base font-bold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">{message}</p>
    </div>
  )
}
