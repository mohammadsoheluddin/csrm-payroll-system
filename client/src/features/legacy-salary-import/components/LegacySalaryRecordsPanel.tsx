import { Download } from 'lucide-react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { LegacySalaryRecord, LegacySalarySummaryResult } from '@/features/legacy-salary-import/types/legacySalaryImport.types'
import {
  formatMoney,
  getLegacyStatusVariant,
  getRecordEmployeeLabel,
  normalizeSummaryRows,
} from '@/features/legacy-salary-import/utils/legacySalaryImport.utils'

export type LegacySalaryRecordsPanelProps = {
  records: LegacySalaryRecord[]
  summary?: LegacySalarySummaryResult | null
  isLoading?: boolean
  isSummaryLoading?: boolean
  error?: unknown
  canExport?: boolean
  isExporting?: boolean
  onRetry: () => void
  onExport: (type: 'csv' | 'excel') => void
}

export const LegacySalaryRecordsPanel = ({
  records,
  summary,
  isLoading,
  isSummaryLoading,
  error,
  canExport,
  isExporting,
  onRetry,
  onExport,
}: LegacySalaryRecordsPanelProps) => {
  const summaryRows = normalizeSummaryRows(summary)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Archive Records</CardTitle>
              <CardDescription>Search and export imported salary sheet records without changing native payroll data.</CardDescription>
            </div>
            {canExport && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => onExport('excel')} disabled={isExporting}>
                  <Download className="h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" onClick={() => onExport('csv')} disabled={isExporting}>
                  CSV
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState title="Loading legacy salary records" />
          ) : error ? (
            <ApiErrorState error={error} onRetry={onRetry} />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/60 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Gross</th>
                      <th className="px-4 py-3 text-right">Bank</th>
                      <th className="px-4 py-3 text-right">Cash</th>
                      <th className="px-4 py-3 text-right">Suspense</th>
                      <th className="px-4 py-3 text-right">AIT</th>
                      <th className="px-4 py-3 text-right">Loan</th>
                      <th className="px-4 py-3 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/80">
                    {records.map((record) => (
                      <tr key={record._id ?? record.id ?? `${record.rowNo}-${record.employeeIdentifier}`} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{getRecordEmployeeLabel(record)}</div>
                          <div className="text-xs text-muted-foreground">Row {record.rowNo ?? '—'} • {record.payrollMonth ?? '—'}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{record.departmentName ?? record.majorDepartmentName ?? '—'}</td>
                        <td className="px-4 py-3"><Badge variant={getLegacyStatusVariant(record.status)}>{record.status ?? 'unknown'}</Badge></td>
                        <td className="px-4 py-3 text-right">৳ {formatMoney(record.grossAmount)}</td>
                        <td className="px-4 py-3 text-right">৳ {formatMoney(record.bankAmount)}</td>
                        <td className="px-4 py-3 text-right">৳ {formatMoney(record.cashAmount)}</td>
                        <td className="px-4 py-3 text-right">৳ {formatMoney(record.suspenseAmount)}</td>
                        <td className="px-4 py-3 text-right">৳ {formatMoney(record.aitAmount)}</td>
                        <td className="px-4 py-3 text-right">৳ {formatMoney(record.loanAmount)}</td>
                        <td className="px-4 py-3 text-right font-semibold">৳ {formatMoney(record.netAmount)}</td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                          No imported legacy salary records found for current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Archive Summary</CardTitle>
          <CardDescription>Backend-grouped summary from imported external salary archive.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSummaryLoading ? (
            <LoadingState title="Loading legacy salary summary" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {summaryRows.map((row) => (
                <div key={row.id} className="rounded-3xl border border-border bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">{row.groupLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Employees: {row.employeeCount}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Gross</span><strong className="text-right text-foreground">৳ {formatMoney(row.grossAmount)}</strong>
                    <span>Net</span><strong className="text-right text-foreground">৳ {formatMoney(row.netAmount)}</strong>
                    <span>Payable</span><strong className="text-right text-foreground">৳ {formatMoney(row.payableAmount)}</strong>
                  </div>
                </div>
              ))}
              {summaryRows.length === 0 && (
                <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
                  No summary data returned yet.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
