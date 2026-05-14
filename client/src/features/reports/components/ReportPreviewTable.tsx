import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { ReportPreviewRow } from '@/features/reports/types/report.types'
import { formatReportCell } from '@/features/reports/utils/report.utils'
import { toTitleCase } from '@/lib/format/record.utils'

export type ReportPreviewTableProps = {
  title: string
  description?: string
  rows: ReportPreviewRow[]
  totals?: Record<string, unknown>
  emptyMessage?: string
}

const getColumns = (rows: ReportPreviewRow[], totals?: Record<string, unknown>) => {
  const keys = new Set<string>()

  rows.slice(0, 10).forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!key.startsWith('_') && !['id', '_id', '__v'].includes(key)) {
        keys.add(key)
      }
    })
  })

  if (keys.size === 0 && totals) {
    Object.keys(totals).forEach((key) => keys.add(key))
  }

  return Array.from(keys).slice(0, 12)
}

export const ReportPreviewTable = ({
  title,
  description,
  rows,
  totals,
  emptyMessage = 'No preview rows found for selected filters.',
}: ReportPreviewTableProps) => {
  const columns = getColumns(rows, totals)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3">
                      {toTitleCase(column)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {rows.length === 0 || columns.length === 0 ? (
                  <tr>
                    <td colSpan={Math.max(columns.length, 1)} className="px-4 py-10 text-center text-muted-foreground">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={String(row._id ?? row.id ?? index)} className="transition hover:bg-muted/30">
                      {columns.map((column) => (
                        <td key={column} className="max-w-[260px] truncate px-4 py-3 text-foreground">
                          {formatReportCell(row[column], column)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
                {totals && Object.keys(totals).length > 0 && columns.length > 0 && (
                  <tr className="bg-muted/40 font-semibold text-foreground">
                    {columns.map((column, index) => (
                      <td key={column} className="max-w-[260px] truncate px-4 py-3">
                        {index === 0 && totals[column] === undefined ? 'Total' : formatReportCell(totals[column], column)}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
