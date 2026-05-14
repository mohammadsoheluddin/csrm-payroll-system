import { Card, CardContent } from '@/components/ui/Card'
import type { ReportMetric } from '@/features/reports/types/report.types'

export type ReportMetricCardsProps = {
  metrics: ReportMetric[]
  fallback?: string
}

export const ReportMetricCards = ({ metrics, fallback = 'No report metrics available yet.' }: ReportMetricCardsProps) => {
  if (metrics.length === 0) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-muted-foreground">{fallback}</CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{metric.value}</p>
            {metric.description && <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
