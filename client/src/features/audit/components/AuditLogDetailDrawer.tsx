import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getAuditLogDetail } from '@/features/audit/api/audit.api'
import type { AuditLogRecord } from '@/features/audit/types/audit.types'
import { getAuditLogDetailId, getAuditLogTitle, getRiskBadgeVariant, stringifyJsonPreview } from '@/features/audit/utils/audit.utils'
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

const JsonBlock = ({ title, value }: { title: string; value: unknown }) => (
  <div className="rounded-2xl border border-border bg-muted/20 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
    <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-background p-3 text-xs leading-5 text-foreground">
      {stringifyJsonPreview(value)}
    </pre>
  </div>
)

export const AuditLogDetailDrawer = ({ record, onClose }: AuditLogDetailDrawerProps) => {
  const detailId = getAuditLogDetailId(record)
  const detailQuery = useQuery({
    queryKey: queryKeys.audit.detail(detailId),
    queryFn: () => getAuditLogDetail(detailId),
    enabled: Boolean(detailId),
  })

  if (!record) {
    return null
  }

  const detail = detailQuery.data ?? record

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <aside className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Audit Detail</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">{getAuditLogTitle(detail)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(detail.createdAt)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close audit detail drawer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {detailQuery.isLoading ? <LoadingState title="Loading audit detail" /> : null}
          {detailQuery.isError ? <ApiErrorState error={detailQuery.error} onRetry={() => void detailQuery.refetch()} /> : null}
          {!detailId ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              This row does not contain a backend ObjectId, so the drawer is showing the list-row payload only.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getRiskBadgeVariant(detail.riskLevel)}>{detail.riskLevel ? toTitleCase(detail.riskLevel) : 'Unknown risk'}</Badge>
            <Badge variant="muted">{detail.category ? toTitleCase(detail.category) : 'General'}</Badge>
            <Badge variant="muted">{detail.module ? toTitleCase(detail.module) : 'System'}</Badge>
            <Badge variant="muted">{detail.action ? toTitleCase(detail.action) : 'Event'}</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <DetailRow label="Actor" value={detail.actorName ?? detail.actorEmail ?? 'System'} />
            <DetailRow label="Actor Role" value={detail.actorRole ? toTitleCase(detail.actorRole) : '—'} />
            <DetailRow label="Entity" value={detail.entityName ?? detail.entityId} />
            <DetailRow label="Entity ID" value={detail.entityId} />
            <DetailRow label="Request ID" value={detail.requestId} />
            <DetailRow label="Request Method" value={detail.requestMethod} />
            <DetailRow label="Request Path" value={detail.requestPath ?? detail.requestOriginalUrl ?? detail.requestUrl} />
            <DetailRow label="IP Address" value={detail.ipAddress} />
            <DetailRow label="Network" value={detail.networkType} />
            <DetailRow label="Device" value={detail.deviceType} />
            <DetailRow label="Browser" value={detail.browser} />
            <DetailRow label="Operating System" value={detail.operatingSystem} />
            <DetailRow label="Client" value={detail.clientName} />
            <DetailRow label="Session" value={detail.sessionId} />
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{detail.description ?? 'No description available.'}</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <JsonBlock title="Previous Data" value={detail.previousData} />
            <JsonBlock title="New Data" value={detail.newData} />
            <JsonBlock title="Metadata" value={detail.metadata} />
            <JsonBlock title="Request Query" value={detail.requestQuery} />
          </div>

          {detail.userAgent ? <JsonBlock title="User Agent" value={detail.userAgent} /> : null}
        </div>
      </aside>
    </div>
  )
}
