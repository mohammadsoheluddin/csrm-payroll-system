import { CheckCircle2, Database, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { LegacySalaryImportPayload, LegacySalaryPreviewResult } from '@/features/legacy-salary-import/types/legacySalaryImport.types'
import { formatMoney, getLegacyStatusVariant, totalsToMetrics } from '@/features/legacy-salary-import/utils/legacySalaryImport.utils'

export type LegacySalaryPreviewPanelProps = {
  preview?: LegacySalaryPreviewResult | null
  pendingPayload?: LegacySalaryImportPayload | null
  isCommitting?: boolean
  canCommit?: boolean
  onCommit: () => void
}

export const LegacySalaryPreviewPanel = ({
  preview,
  pendingPayload,
  isCommitting,
  canCommit,
  onCommit,
}: LegacySalaryPreviewPanelProps) => {
  if (!preview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview Result</CardTitle>
          <CardDescription>Parse an Excel file or provide manual rows, then generate preview before committing.</CardDescription>
        </CardHeader>
        <CardContent className="rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          No preview generated yet. Preview is mandatory before legacy salary data is archived.
        </CardContent>
      </Card>
    )
  }

  const metrics = totalsToMetrics(preview.totals)
  const sampleRows = preview.rows.slice(0, 8)
  const rejectedRows = preview.rejectedRows.slice(0, 5)
  const canCommitPreview = Boolean(canCommit && pendingPayload && preview.validRows > 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Preview Result</CardTitle>
            <CardDescription>
              Review validation result before committing imported salary sheet as external archive.
            </CardDescription>
          </div>
          <Button onClick={onCommit} disabled={!canCommitPreview || isCommitting}>
            <Database className="h-4 w-4" />
            {isCommitting ? 'Committing...' : 'Commit Archive'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-border bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Rows</p>
            <p className="mt-2 text-xl font-bold text-foreground">{preview.totalRows}</p>
          </div>
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Valid</p>
            <p className="mt-2 text-xl font-bold text-emerald-700 dark:text-emerald-300">{preview.validRows}</p>
          </div>
          <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-destructive">Invalid</p>
            <p className="mt-2 text-xl font-bold text-destructive">{preview.invalidRows}</p>
          </div>
          <div className="rounded-3xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Matched</p>
            <p className="mt-2 text-xl font-bold text-primary">{preview.matchedRows}</p>
          </div>
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Unmatched</p>
            <p className="mt-2 text-xl font-bold text-amber-700 dark:text-amber-300">{preview.unmatchedRows}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="border-b border-border bg-muted/50 px-4 py-3 text-sm font-semibold text-foreground">
            Preview Rows Sample
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/60 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3 text-right">Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card/70">
                {sampleRows.map((row) => (
                  <tr key={`${row.rowNo}-${row.employeeIdentifier ?? row.employeeId ?? row.employeeName}`}>
                    <td className="px-4 py-3">{row.rowNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{row.employeeName ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">{row.employeeIdentifier ?? row.employeeId ?? row.officeId ?? '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.departmentName ?? row.majorDepartmentName ?? '—'}</td>
                    <td className="px-4 py-3"><Badge variant={getLegacyStatusVariant(row.status)}>{row.status ?? 'unknown'}</Badge></td>
                    <td className="px-4 py-3 text-right">৳ {formatMoney(row.grossAmount)}</td>
                    <td className="px-4 py-3 text-right">৳ {formatMoney(row.netAmount)}</td>
                    <td className="px-4 py-3 text-right font-semibold">৳ {formatMoney(row.payableAmount)}</td>
                  </tr>
                ))}
                {sampleRows.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>No valid rows returned.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {rejectedRows.length > 0 && (
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <XCircle className="h-4 w-4" />
              Rejected Rows
            </div>
            <div className="mt-3 grid gap-2">
              {rejectedRows.map((row) => (
                <div key={`${row.rowNo}-${row.reason}`} className="rounded-2xl bg-background/80 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Row {row.rowNo}:</span> {row.reason}
                </div>
              ))}
            </div>
          </div>
        )}

        {canCommitPreview && (
          <div className="flex items-start gap-2 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4" />
            Preview has valid rows and can be committed as external archive. It will not alter native payroll calculations.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
