import { ArrowDown, ArrowUp, Eye, EyeOff } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { dashboardCategoryIconMap } from '@/features/dashboard/config/dashboardWidgets'
import { useDashboardStore } from '@/stores/dashboard.store'
import type { DashboardWidgetDefinition } from '@/types/dashboard.types'

type DashboardWidgetSettingsPanelProps = {
  widgets: DashboardWidgetDefinition[]
}

export const DashboardWidgetSettingsPanel = ({ widgets }: DashboardWidgetSettingsPanelProps) => {
  const hiddenWidgetIds = useDashboardStore((state) => state.hiddenWidgetIds)
  const density = useDashboardStore((state) => state.density)
  const setDensity = useDashboardStore((state) => state.setDensity)
  const toggleWidgetVisibility = useDashboardStore((state) => state.toggleWidgetVisibility)
  const moveWidget = useDashboardStore((state) => state.moveWidget)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard widget settings</CardTitle>
        <CardDescription>
          This is local frontend preference storage. Later, these preferences can be saved per user in backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background p-3">
          <span className="text-sm font-medium text-muted-foreground">Density</span>
          <Button
            size="sm"
            variant={density === 'comfortable' ? 'primary' : 'outline'}
            onClick={() => setDensity('comfortable')}
          >
            Comfortable
          </Button>
          <Button
            size="sm"
            variant={density === 'compact' ? 'primary' : 'outline'}
            onClick={() => setDensity('compact')}
          >
            Compact
          </Button>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          {widgets.map((widget, index) => {
            const isHidden = hiddenWidgetIds.includes(widget.id)
            const CategoryIcon = dashboardCategoryIconMap[widget.category]

            return (
              <div
                key={widget.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryIcon className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-foreground">{widget.title}</p>
                    {widget.badge && <Badge>{widget.badge}</Badge>}
                    {widget.isRequired && <Badge variant="success">Required</Badge>}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{widget.description}</p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => moveWidget(widget.id, 'up')}
                    disabled={index === 0}
                    aria-label={`Move ${widget.title} up`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => moveWidget(widget.id, 'down')}
                    disabled={index === widgets.length - 1}
                    aria-label={`Move ${widget.title} down`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={isHidden ? 'outline' : 'secondary'}
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    disabled={widget.isRequired}
                  >
                    {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {isHidden ? 'Show' : 'Hide'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
