import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

export type EmployeeProfileEmptyStateProps = {
  icon?: ReactNode
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmployeeProfileEmptyState = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  className,
}: EmployeeProfileEmptyStateProps) => {
  return (
    <div className={cn('rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center', className)}>
      {icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-primary ring-1 ring-border">
          {icon}
        </div>
      )}
      <h4 className="mt-3 text-sm font-bold text-foreground">{title}</h4>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{message}</p>
      {actionLabel && onAction && (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
