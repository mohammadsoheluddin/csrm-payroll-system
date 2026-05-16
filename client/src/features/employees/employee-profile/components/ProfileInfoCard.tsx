import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

export type ProfileInfoCardProps = {
  title: string
  description?: string
  icon?: ReactNode
  badge?: string
  className?: string
  children: ReactNode
}

export const ProfileInfoCard = ({
  title,
  description,
  icon,
  badge,
  className,
  children,
}: ProfileInfoCardProps) => {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="border-b border-border bg-muted/30 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
              {description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>}
            </div>
          </div>
          {badge && <Badge variant="muted">{badge}</Badge>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  )
}

export const ProfileField = ({ label, value }: { label: string; value?: ReactNode }) => {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 break-words text-sm font-semibold text-foreground">{value || '—'}</div>
    </div>
  )
}
