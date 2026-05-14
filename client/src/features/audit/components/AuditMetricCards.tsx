import { Activity, AlertTriangle, Database, ShieldAlert } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'

export type AuditMetric = {
  label: string
  value: string | number
  helper: string
}

const icons = [Database, AlertTriangle, ShieldAlert, Activity]

export const AuditMetricCards = ({ metrics }: { metrics: AuditMetric[] }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = icons[index % icons.length]

        return (
          <Card key={metric.label}>
            <CardContent className="flex items-center gap-4 pt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.helper}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
