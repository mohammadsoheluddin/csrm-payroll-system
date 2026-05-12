import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
}

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('space-y-1.5 p-5', className)} {...props} />
}

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn('text-base font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export const CardDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => {
  return <p className={cn('text-sm leading-6 text-muted-foreground', className)} {...props} />
}

export const CardContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('p-5 pt-0', className)} {...props} />
}
