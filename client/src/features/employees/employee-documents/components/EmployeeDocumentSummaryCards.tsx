import { AlertTriangle, Archive, FileCheck2, FileText, LockKeyhole, ShieldCheck } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import type { EmployeeDocumentSummary } from '@/features/employees/employee-documents/types/employeeDocument.types'

const summaryCards = [
  { key: 'total', label: 'Total Docs', icon: FileText },
  { key: 'pending', label: 'Pending', icon: Archive },
  { key: 'verified', label: 'Verified', icon: FileCheck2 },
  { key: 'rejected', label: 'Rejected', icon: AlertTriangle },
  { key: 'expired', label: 'Expired', icon: AlertTriangle },
  { key: 'highlyConfidential', label: 'High Confidential', icon: LockKeyhole },
] as const

export const EmployeeDocumentSummaryCards = ({ summary }: { summary?: EmployeeDocumentSummary }) => {
  if (!summary) {
    return null
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {summaryCards.map((item) => {
        const Icon = item.icon
        const value = summary.counters[item.key]

        return (
          <Card key={item.key} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
              </div>
              <span className="rounded-2xl bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        )
      })}

      <Card className="p-4 sm:col-span-2 lg:col-span-3 2xl:col-span-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Digital document profile readiness</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The profile is considered ready when documents exist and no active rejected document is pending.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-muted px-4 py-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {summary.documentProfileReady ? 'Ready' : 'Needs HR follow-up'}
          </div>
        </div>
      </Card>
    </div>
  )
}
