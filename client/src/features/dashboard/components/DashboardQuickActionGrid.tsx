import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { dashboardQuickActions } from '@/features/dashboard/data/dashboardFoundationData'
import { canUserAccess } from '@/lib/auth/permission.utils'
import type { AuthUser } from '@/types/auth.types'

type DashboardQuickActionGridProps = {
  user: AuthUser | null
}

export const DashboardQuickActionGrid = ({ user }: DashboardQuickActionGridProps) => {
  const visibleActions = dashboardQuickActions.filter((action) =>
    canUserAccess(user, action.requiredPermissions),
  )

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {visibleActions.map((action) => {
        const Icon = action.icon

        return (
          <Link
            key={action.label}
            to={action.href}
            className="group rounded-2xl border border-border bg-background p-4 transition hover:border-primary/40 hover:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              {action.badge && <Badge>{action.badge}</Badge>}
            </div>
            <p className="mt-3 font-semibold text-foreground">{action.label}</p>
            <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{action.description}</p>
            <Button size="sm" variant="ghost" className="mt-3 px-0 text-primary group-hover:gap-3">
              Open
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )
      })}
    </div>
  )
}
