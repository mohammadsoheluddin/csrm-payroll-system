import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { SimpleDataTable } from '@/components/data-table/SimpleDataTable'
import type { SimpleDataTableColumn } from '@/components/data-table/SimpleDataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import { getAuditFilterOptions, getAuditLogs, getAuditSummary, getAuditTimeline } from '@/features/audit/api/audit.api'
import { AuditLogDetailDrawer } from '@/features/audit/components/AuditLogDetailDrawer'
import { AuditLogToolbar } from '@/features/audit/components/AuditLogToolbar'
import { AuditMetricCards } from '@/features/audit/components/AuditMetricCards'
import type { AuditLogFilters, AuditLogRecord } from '@/features/audit/types/audit.types'
import { DEFAULT_AUDIT_FILTERS, getAuditLogId, getRiskBadgeVariant, getTopSummaryRows, summarizeAuditMetrics } from '@/features/audit/utils/audit.utils'
import { formatDateTime, toTitleCase } from '@/lib/format/record.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

const auditColumns: SimpleDataTableColumn<AuditLogRecord>[] = [
  {
    key: 'createdAt',
    label: 'Time',
    render: (record) => formatDateTime(record.createdAt),
  },
  {
    key: 'module',
    label: 'Module / Action',
    render: (record) => (
      <div>
        <p className="font-medium text-foreground">{record.module ? toTitleCase(record.module) : 'System'}</p>
        <p className="text-xs text-muted-foreground">{record.action ? toTitleCase(record.action) : 'Event'}</p>
      </div>
    ),
  },
  {
    key: 'riskLevel',
    label: 'Risk',
    render: (record) => <Badge variant={getRiskBadgeVariant(record.riskLevel)}>{record.riskLevel ? toTitleCase(record.riskLevel) : 'Unknown'}</Badge>,
  },
  {
    key: 'actorEmail',
    label: 'Actor',
    render: (record) => (
      <div>
        <p className="font-medium text-foreground">{record.actorName ?? record.actorEmail ?? 'System'}</p>
        <p className="text-xs text-muted-foreground">{record.actorRole ? toTitleCase(record.actorRole) : record.actorEmail ?? '—'}</p>
      </div>
    ),
  },
  {
    key: 'entityName',
    label: 'Entity',
    render: (record) => (
      <div>
        <p className="font-medium text-foreground">{record.entityName ?? '—'}</p>
        <p className="text-xs text-muted-foreground">{record.entityId ?? '—'}</p>
      </div>
    ),
  },
  {
    key: 'description',
    label: 'Description',
    render: (record) => <span className="line-clamp-2 text-sm">{record.description ?? '—'}</span>,
  },
]

export const AuditLogsPage = () => {
  const canAccess = useAuthStore((state) => state.canAccess)
  const role = useAuthStore((state) => state.user?.role)
  const canRead = canAccess([PERMISSIONS.AUDIT_LOG_READ])
  const [filters, setFilters] = useState<AuditLogFilters>(DEFAULT_AUDIT_FILTERS)
  const [selectedRecord, setSelectedRecord] = useState<AuditLogRecord | null>(null)

  const baseSummaryFilters = {
    module: filters.module,
    action: filters.action,
    riskLevel: filters.riskLevel,
    category: filters.category,
    actorRole: filters.actorRole,
    actorEmail: filters.actorEmail,
    entityId: filters.entityId,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  }

  const filterOptionsQuery = useQuery({
    queryKey: queryKeys.audit.filterOptions({ fromDate: filters.fromDate, toDate: filters.toDate }),
    queryFn: () => getAuditFilterOptions({ fromDate: filters.fromDate, toDate: filters.toDate }),
    enabled: canRead,
  })

  const logsQuery = useQuery({
    queryKey: queryKeys.audit.logs(filters),
    queryFn: () => getAuditLogs(filters),
    enabled: canRead,
  })

  const summaryQuery = useQuery({
    queryKey: queryKeys.audit.summary(baseSummaryFilters),
    queryFn: () => getAuditSummary(baseSummaryFilters),
    enabled: canRead,
  })

  const timelineQuery = useQuery({
    queryKey: queryKeys.audit.timeline({ ...baseSummaryFilters, groupBy: 'day' }),
    queryFn: () => getAuditTimeline({ ...baseSummaryFilters, groupBy: 'day' }),
    enabled: canRead,
  })

  if (!canRead) {
    return <PermissionDeniedInline message={`Role ${role ?? 'guest'} cannot access audit logs.`} />
  }

  const logs = logsQuery.data?.data ?? []
  const meta = logsQuery.data?.meta
  const page = Number(filters.page ?? 1)
  const totalPage = meta?.totalPage ?? 1
  const timelineRows = timelineQuery.data?.data ?? []
  const topModules = getTopSummaryRows(summaryQuery.data)

  const refreshAll = () => {
    void filterOptionsQuery.refetch()
    void logsQuery.refetch()
    void summaryQuery.refetch()
    void timelineQuery.refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F12</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Audit Logs</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Backend-connected audit trail viewer for sensitive actions, approvals, exports, permission denials, and request metadata.
          </p>
        </div>
        <Button variant="outline" onClick={refreshAll} disabled={logsQuery.isFetching || summaryQuery.isFetching}>
          <RefreshCw className="h-4 w-4" />
          Refresh Audit
        </Button>
      </div>

      <AuditLogToolbar
        filters={filters}
        options={filterOptionsQuery.data}
        onChange={setFilters}
        onRefresh={refreshAll}
        isLoading={logsQuery.isFetching || summaryQuery.isFetching}
      />

      {summaryQuery.isLoading ? (
        <LoadingState title="Loading audit summary" />
      ) : summaryQuery.isError ? (
        <ApiErrorState error={summaryQuery.error} onRetry={() => void summaryQuery.refetch()} />
      ) : (
        <AuditMetricCards metrics={summarizeAuditMetrics(summaryQuery.data)} />
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Modules</CardTitle>
            <CardDescription>Most active modules based on current audit filters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topModules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No module summary available for current filters.</p>
            ) : (
              topModules.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <Badge variant="muted">{item.count}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Daily activity trend from /audit-logs/timeline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {timelineQuery.isLoading ? (
              <LoadingState title="Loading timeline" />
            ) : timelineQuery.isError ? (
              <ApiErrorState error={timelineQuery.error} onRetry={() => void timelineQuery.refetch()} />
            ) : timelineRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No timeline rows available.</p>
            ) : (
              timelineRows.slice(-8).map((item) => (
                <div key={item.period} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{item.period ?? 'Unknown period'}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.totalLogs ?? 0} logs / {item.uniqueActorCount ?? 0} actors / {item.moduleCount ?? 0} modules
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>Use detail view to inspect request metadata and before/after data when loaded.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logsQuery.isLoading ? (
            <LoadingState title="Loading audit logs" />
          ) : logsQuery.isError ? (
            <ApiErrorState error={logsQuery.error} onRetry={() => void logsQuery.refetch()} />
          ) : (
            <SimpleDataTable
              records={logs}
              columns={auditColumns}
              getRowKey={getAuditLogId}
              emptyMessage="No audit logs found for current filters."
              actions={(record) => (
                <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              )}
            />
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPage} · Total {meta?.total ?? logs.length} logs · Limit {meta?.limit ?? filters.limit}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || logsQuery.isFetching} onClick={() => setFilters({ ...filters, page: page - 1 })}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPage || logsQuery.isFetching} onClick={() => setFilters({ ...filters, page: page + 1 })}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AuditLogDetailDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  )
}
