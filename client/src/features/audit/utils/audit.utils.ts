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

export const pickFilledQueryParams = <TParams extends Record<string, unknown>>(
  params: TParams,
  keys: Array<keyof TParams>,
) => {
  return keys.reduce<Record<string, string | number | boolean>>((acc, key) => {
    const value = params[key]

    if (isFilled(value)) {
      acc[String(key)] = value as string | number | boolean
    }

    return acc
  }, {})
}

export const getAuditListQueryParams = (filters: AuditLogFilters) => {
  return pickFilledQueryParams(filters, [
    'searchTerm',
    'module',
    'action',
    'riskLevel',
    'category',
    'actorEmail',
    'actorRole',
    'entityId',
    'requestId',
    'requestMethod',
    'requestPath',
    'ipAddress',
    'networkType',
    'deviceType',
    'fromDate',
    'toDate',
    'includeData',
    'sensitiveOnly',
    'sortBy',
    'sortOrder',
    'page',
    'limit',
  ])
}

export const getSensitiveAuditQueryParams = (filters: AuditLogFilters) => {
  return pickFilledQueryParams(filters, [
    'module',
    'action',
    'riskLevel',
    'category',
    'actorEmail',
    'actorRole',
    'entityId',
    'fromDate',
    'toDate',
    'includeData',
    'page',
    'limit',
  ])
}

export const getAuditSummaryQueryParams = (filters: AuditLogFilters) => {
  return pickFilledQueryParams(filters, [
    'module',
    'action',
    'riskLevel',
    'category',
    'actorRole',
    'actorEmail',
    'entityId',
    'ipAddress',
    'networkType',
    'deviceType',
    'fromDate',
    'toDate',
  ])
}

export const getRbacFilterQueryParams = (filters: RbacAuditFilters): RbacAuditFilters => {
  return Object.entries(filters).reduce<RbacAuditFilters>((acc, [key, value]) => {
    if (['module', 'role', 'category', 'riskLevel'].includes(key) && typeof value === 'string' && value.trim()) {
      acc[key] = value
    }

    return acc
  }, {})
}

export const getRbacModuleQueryParams = (filters: RbacAuditFilters): RbacAuditFilters => {
  return Object.entries(filters).reduce<RbacAuditFilters>((acc, [key, value]) => {
    if (['module', 'category'].includes(key) && typeof value === 'string' && value.trim()) {
      acc[key] = value
    }

    return acc
  }, {})
}

export const isSensitiveOnlyMode = (filters: AuditLogFilters) => filters.sensitiveOnly === 'true'

export const canUseDedicatedSensitiveAuditRoute = (filters: AuditLogFilters) => {
  return isSensitiveOnlyMode(filters) && !filters.searchTerm && !filters.requestId && !filters.requestPath && !filters.ipAddress && !filters.deviceType
}

export const isValidObjectId = (value?: string) => Boolean(value && /^[0-9a-fA-F]{24}$/.test(value))

export const getAuditLogId = (record: AuditLogRecord) => {
  const value = record._id ?? record.id

  if (typeof value === 'string' && value.trim()) {
    return value
  }

  return `${record.module ?? 'audit'}-${record.action ?? 'event'}-${record.createdAt ?? record.requestId ?? 'row'}`
}

export const getAuditLogDetailId = (record: AuditLogRecord | null) => {
  const value = record?._id ?? record?.id
  return typeof value === 'string' && isValidObjectId(value) ? value : ''
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

  if (riskLevel === 'low') {
    return 'success' as const
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
