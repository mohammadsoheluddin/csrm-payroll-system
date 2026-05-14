import type {
  AuditFilterOptions,
  AuditLogFilters,
  AuditLogRecord,
  AuditRiskLevel,
  AuditSummary,
  RbacAuditFilters,
  RbacCoverageStatus,
  RbacIssueSeverity,
} from '@/features/audit/types/audit.types'
import { toTitleCase } from '@/lib/format/record.utils'

export const DEFAULT_AUDIT_FILTERS: AuditLogFilters = {
  page: 1,
  limit: 20,
  includeData: 'false',
  sensitiveOnly: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

export const DEFAULT_RBAC_FILTERS: RbacAuditFilters = {}

const isFilled = (value: unknown) => value !== undefined && value !== null && value !== ''

export const cleanupQueryParams = <TParams extends Record<string, unknown>>(params: TParams) => {
  return Object.entries(params).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
    if (isFilled(value)) {
      acc[key] = value as string | number | boolean
    }

    return acc
  }, {})
}

export const getAuditLogId = (record: AuditLogRecord) => {
  return record._id ?? record.id ?? `${record.module ?? 'audit'}-${record.action ?? 'event'}-${record.createdAt ?? Math.random()}`
}

export const getAuditLogTitle = (record: AuditLogRecord) => {
  const moduleLabel = record.module ? toTitleCase(record.module) : 'System'
  const actionLabel = record.action ? toTitleCase(record.action) : 'Event'
  return `${moduleLabel} / ${actionLabel}`
}

export const getRiskBadgeVariant = (riskLevel?: AuditRiskLevel) => {
  if (riskLevel === 'critical' || riskLevel === 'high') {
    return 'danger' as const
  }

  if (riskLevel === 'medium') {
    return 'warning' as const
  }

  return 'muted' as const
}

export const getCoverageBadgeVariant = (status?: RbacCoverageStatus) => {
  if (status === 'covered') {
    return 'success' as const
  }

  if (status === 'partial') {
    return 'warning' as const
  }

  return 'danger' as const
}

export const getIssueBadgeVariant = (severity?: RbacIssueSeverity) => {
  if (severity === 'critical') {
    return 'danger' as const
  }

  if (severity === 'warning') {
    return 'warning' as const
  }

  return 'muted' as const
}

export const getAuditSelectOptions = (options: AuditFilterOptions | undefined, key: keyof AuditFilterOptions) => {
  const values = options?.[key]
  return Array.isArray(values) ? values.filter(Boolean) : []
}

export const summarizeAuditMetrics = (summary?: AuditSummary) => [
  {
    label: 'Total Logs',
    value: summary?.totalLogs ?? 0,
    helper: 'Matching audit events',
  },
  {
    label: 'High Risk',
    value: summary?.sensitiveActivity?.highRiskCount ?? 0,
    helper: 'High-risk audit events',
  },
  {
    label: 'Critical Risk',
    value: summary?.sensitiveActivity?.criticalRiskCount ?? 0,
    helper: 'Critical events',
  },
  {
    label: 'Recent Sensitive',
    value: summary?.sensitiveActivity?.totalRecentSensitiveLogs ?? 0,
    helper: 'Latest sensitive activity',
  },
]

export const getTopSummaryRows = (summary?: AuditSummary) => {
  const byModule = summary?.summary?.byModule ?? []
  return byModule.slice(0, 6).map((item) => ({
    label: item.module ? toTitleCase(item.module) : 'Unknown',
    count: item.count ?? 0,
  }))
}

export const stringifyJsonPreview = (value: unknown) => {
  if (!value) {
    return '—'
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
