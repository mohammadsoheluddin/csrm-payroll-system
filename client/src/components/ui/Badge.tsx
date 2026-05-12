import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'muted' | 'danger'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary ring-primary/20',
  success: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
  muted: 'bg-muted text-muted-foreground ring-border',
  danger: 'bg-destructive/10 text-destructive ring-destructive/20',
}

export const Badge = ({
  className,
  variant = 'default',
  ...props
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
