import { LockKeyhole } from 'lucide-react'

import { cn } from '@/lib/utils/cn'

export type PermissionDeniedInlineProps = {
  title?: string
  message?: string
  className?: string
}

export const PermissionDeniedInline = ({
  title = 'Permission required',
  message = 'Your current role does not have permission to view or use this action.',
  className,
}: PermissionDeniedInlineProps) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
          <LockKeyhole className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 leading-5">{message}</p>
        </div>
      </div>
    </div>
  )
}
