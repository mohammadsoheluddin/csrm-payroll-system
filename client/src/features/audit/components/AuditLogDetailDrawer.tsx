import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getAuditLogDetail } from '@/features/audit/api/audit.api'
import type { AuditLogRecord } from '@/features/audit/types/audit.types'
import { getAuditLogId, getAuditLogTitle, getRiskBadgeVariant, stringifyJsonPreview } from '@/features/audit/utils/audit.utils'
import { formatDateTime, toTitleCase } from '@/lib/format/record.utils'
import { queryKeys } from '@/lib/query/queryKeys'

type AuditLogDetailDrawerProps = {
  record: AuditLogRecord | null
  onClose: () => void
}

const DetailRow = ({ label, value }: { label: string; value?: unknown }) => (
  <div className="rounded-xl border border-border bg-muted/20 p-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 break-words text-sm text-foreground">{value === undefined || value === null || value === '' ? '—' : String(value)}</p>
  </div>
)

export const AuditLogDetailDrawer = ({ record, onClose }: AuditLogDetailDrawerProps) => {
  const id = record ? getAuditLogId(record) : ''
  const detailQuery = useQuery({
    queryKey: queryKeys.audit.detail(id),
    queryFn: () => getAuditLogDetail(id),
    enabled: Boolean(id),
  })

  if (!record) {
    return null
  }

  const detail = detailQuery.data ?? record

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-sm">
      <div className="h-full w-full max-w-3xl overflow-y-auto border-l border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card/95 p-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Audit Detail</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">{getAuditLogTitle(detail)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{detail.description ?? 'No audit description available.'}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close audit detail">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-5 p-5">
          {detailQuery.isLoading ? (
            <LoadingState title="Loading audit detail" />
          ) : detailQuery.isError ? (
            <ApiErrorState error={detailQuery.error} onRetry={() => void detailQuery.refetch()} />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge>{detail.module ? toTitleCase(detail.module) : 'Unknown module'}</Badge>
                <Badge variant="muted">{detail.action ? toTitleCase(detail.action) : 'Unknown action'}</Badge>
                <Badge variant={getRiskBadgeVariant(detail.riskLevel)}>{detail.riskLevel ? toTitleCase(detail.riskLevel) : 'Risk unknown'}</Badge>
                {detail.category && <Badge variant="muted">{toTitleCase(detail.category)}</Badge>}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <DetailRow label="Created At" value={formatDateTime(detail.createdAt)} />
                <DetailRow label="Request ID" value={detail.requestId} />
                <DetailRow label="Actor" value={[detail.actorName, detail.actorEmail].filter(Boolean).join(' / ')} />
                <DetailRow label="Actor Role" value={detail.actorRole ? toTitleCase(detail.actorRole) : undefined} />
                <DetailRow label="Entity" value={[detail.entityName, detail.entityId].filter(Boolean).join(' / ')} />
                <DetailRow label="Request" value={[detail.requestMethod, detail.requestPath ?? detail.requestUrl].filter(Boolean).join(' ')} />
                <DetailRow label="IP / Network" value={[detail.ipAddress, detail.networkType].filter(Boolean).join(' / ')} />
                <DetailRow label="Device" value={[detail.deviceType, detail.browser, detail.operatingSystem].filter(Boolean).join(' / ')} />
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Previous Data</p>
                  <pre className="max-h-72 overflow-auto rounded-2xl border border-border bg-muted/30 p-4 text-xs text-foreground">{stringifyJsonPreview(detail.previousData)}</pre>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">New Data</p>
                  <pre className="max-h-72 overflow-auto rounded-2xl border border-border bg-muted/30 p-4 text-xs text-foreground">{stringifyJsonPreview(detail.newData)}</pre>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Metadata</p>
                  <pre className="max-h-72 overflow-auto rounded-2xl border border-border bg-muted/30 p-4 text-xs text-foreground">{stringifyJsonPreview(detail.metadata)}</pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
