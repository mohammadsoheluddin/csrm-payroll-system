import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { dashboardWidgetSizeClasses } from '@/features/dashboard/config/dashboardWidgets'
import { DashboardWidgetContent } from '@/features/dashboard/components/DashboardWidgetContent'
import { cn } from '@/lib/utils/cn'
import type { AuthUser } from '@/types/auth.types'
import type { DashboardDensity, DashboardWidgetDefinition } from '@/types/dashboard.types'

type DashboardWidgetGridProps = {
  widgets: DashboardWidgetDefinition[]
  user: AuthUser | null
  density: DashboardDensity
}

export const DashboardWidgetGrid = ({ widgets, user, density }: DashboardWidgetGridProps) => {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      {widgets.map((widget) => {
        const Icon = widget.icon

        return (
          <Card
            key={widget.id}
            className={cn(
              'overflow-hidden',
              dashboardWidgetSizeClasses[widget.size],
              density === 'compact' && 'rounded-xl',
            )}
          >
            <CardHeader className={cn(density === 'compact' && 'p-4')}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2">
                    <span className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    {widget.title}
                  </CardTitle>
                  <CardDescription>{widget.description}</CardDescription>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <Badge>{widget.category}</Badge>
                  {widget.badge && <Badge variant="success">{widget.badge}</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className={cn(density === 'compact' && 'p-4 pt-0')}>
              <DashboardWidgetContent widgetId={widget.id} user={user} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
