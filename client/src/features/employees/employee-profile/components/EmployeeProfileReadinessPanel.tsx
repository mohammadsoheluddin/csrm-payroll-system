import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/Badge'
import type { EmployeeProfileDataGap } from '@/features/employees/employee-profile/types/employeeProfile.types'
import { getGapVariant } from '@/features/employees/employee-profile/utils/employeeProfile.utils'

import { EmployeeProfileEmptyState } from './EmployeeProfileEmptyState'

export type EmployeeProfileReadinessPanelProps = {
  gaps: EmployeeProfileDataGap[]
}

const severityOrder: Record<EmployeeProfileDataGap['severity'], number> = {
  critical: 1,
  warning: 2,
  info: 3,
}

export const EmployeeProfileReadinessPanel = ({ gaps }: EmployeeProfileReadinessPanelProps) => {
  const sortedGaps = useMemo(
    () => [...gaps].sort((first, second) => severityOrder[first.severity] - severityOrder[second.severity]),
    [gaps],
  )

  const criticalCount = gaps.filter((gap) => gap.severity === 'critical').length
  const warningCount = gaps.filter((gap) => gap.severity === 'warning').length
  const infoCount = gaps.filter((gap) => gap.severity === 'info').length

  if (!gaps.length) {
    return (
      <EmployeeProfileEmptyState
        icon={<CheckCircle2 className="h-5 w-5" />}
        title="Profile looks ready"
        message="No major profile readiness gap was returned by the backend service book aggregator for this employee."
        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Critical</p>
          <p className="mt-1 text-2xl font-black text-destructive">{criticalCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Warning</p>
          <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-300">{warningCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Info</p>
          <p className="mt-1 text-2xl font-black text-primary">{infoCount}</p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedGaps.map((gap) => (
          <div key={gap.key} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getGapVariant(gap.severity)}>{gap.severity}</Badge>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              <p className="font-semibold text-foreground">{gap.label}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{gap.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
