import { ArchiveRestore, Eye, Trash2 } from 'lucide-react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { ApiMeta } from '@/types/api.types'
import type { LegacySalaryBatch, LegacySalaryListMode } from '@/features/legacy-salary-import/types/legacySalaryImport.types'
import {
  formatLegacyDate,
  formatMoney,
  formatSource,
  getBatchFileInfo,
  getLegacySalaryRecordId,
  getLegacyStatusVariant,
} from '@/features/legacy-salary-import/utils/legacySalaryImport.utils'

export type LegacySalaryArchivePanelProps = {
  mode: LegacySalaryListMode
  onModeChange: (mode: LegacySalaryListMode) => void
  batches: LegacySalaryBatch[]
  meta?: ApiMeta
  isLoading?: boolean
  error?: unknown
  canDelete?: boolean
  canProcess?: boolean
  deletingId?: string
  restoringId?: string
  onRetry: () => void
  onView: (batch: LegacySalaryBatch) => void
  onDelete: (batch: LegacySalaryBatch) => void
  onRestore: (batch: LegacySalaryBatch) => void
}

export const LegacySalaryArchivePanel = ({
  mode,
  onModeChange,
  batches,
  meta,
  isLoading,
  error,
  canDelete,
  canProcess,
  deletingId,
  restoringId,
  onRetry,
  onView,
  onDelete,
  onRestore,
}: LegacySalaryArchivePanelProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Legacy Salary Archive Batches</CardTitle>
            <CardDescription>Committed external salary sheets are archived here separately from native payroll engine.</CardDescription>
          </div>
          <div className="flex rounded-2xl border border-border bg-background/70 p-1">
            <Button size="sm" variant={mode === 'active' ? 'primary' : 'ghost'} onClick={() => onModeChange('active')}>
              Active
            </Button>
            <Button size="sm" variant={mode === 'deleted' ? 'primary' : 'ghost'} onClick={() => onModeChange('deleted')}>
              Deleted
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState title="Loading archive batches" />
        ) : error ? (
          <ApiErrorState error={error} onRetry={onRetry} />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/60 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Rows</th>
                    <th className="px-4 py-3 text-right">Payable</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Committed</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card/80">
                  {batches.map((batch) => {
                    const id = getLegacySalaryRecordId(batch)
                    return (
                      <tr key={id} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{batch.batchNo ?? id}</div>
                          <div className="text-xs text-muted-foreground">{batch.payrollMonth ?? '—'} • {getBatchFileInfo(batch)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground">{formatSource(batch.source)}</div>
                          <div className="text-xs text-muted-foreground">{formatSource(batch.sheetType)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{batch.validRows ?? 0} valid / {batch.totalRows ?? 0} total</div>
                          <div className="text-xs text-muted-foreground">{batch.matchedRows ?? 0} matched • {batch.unmatchedRows ?? 0} unmatched</div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">৳ {formatMoney(batch.totals?.payableAmount)}</td>
                        <td className="px-4 py-3"><Badge variant={getLegacyStatusVariant(batch.status)}>{batch.status ?? 'unknown'}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{formatLegacyDate(batch.committedAt ?? batch.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="outline" onClick={() => onView(batch)} title="View batch details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {mode === 'active' && canDelete && (
                              <Button size="icon" variant="danger" onClick={() => onDelete(batch)} disabled={deletingId === id} title="Soft delete batch">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            {mode === 'deleted' && canProcess && (
                              <Button size="icon" variant="outline" onClick={() => onRestore(batch)} disabled={restoringId === id} title="Restore batch">
                                <ArchiveRestore className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {batches.length === 0 && (
                    <tr>
                      <td className="px-4 py-12 text-center text-muted-foreground" colSpan={7}>
                        No legacy salary archive batches found for current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {meta && (
              <div className="border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                Showing {batches.length} of {meta.total ?? batches.length} batch records.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
