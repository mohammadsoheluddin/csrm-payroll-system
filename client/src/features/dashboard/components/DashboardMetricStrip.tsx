import { Card, CardContent } from '@/components/ui/Card'
import { dashboardFoundationMetrics } from '@/features/dashboard/data/dashboardFoundationData'

export const DashboardMetricStrip = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {dashboardFoundationMetrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{metric.value}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{metric.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
