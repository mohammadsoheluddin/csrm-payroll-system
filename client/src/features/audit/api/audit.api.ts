import { apiRoutes } from '@/config/apiRoutes'
import type {
  AuditFilterOptions,
  AuditLogFilters,
  AuditLogRecord,
  AuditSummary,
  AuditTimeline,
  RbacAuditFilters,
  RbacAuditSummary,
  RbacCoverageSummary,
  RbacMatrixRow,
  RbacModuleDefinition,
  RbacPermissionDefinition,
  RbacRoleSummary,
  RbacRouteCoverageItem,
} from '@/features/audit/types/audit.types'
import {
  cleanupQueryParams,
  getAuditListQueryParams,
  getAuditSummaryQueryParams,
  getRbacFilterQueryParams,
  getRbacModuleQueryParams,
  getSensitiveAuditQueryParams,
} from '@/features/audit/utils/audit.utils'
import { apiClient } from '@/lib/api/httpClient'
import { unwrapApiData, unwrapApiResult } from '@/lib/api/apiResponse'

const ensureArray = <TData>(value: unknown): TData[] => (Array.isArray(value) ? value as TData[] : [])

export const getAuditLogs = async (params: AuditLogFilters) => {
  const response = await apiClient.get(apiRoutes.auditLogs.root, {
    params: getAuditListQueryParams(params),
  })
  const result = unwrapApiResult<AuditLogRecord[]>(response)

  return {
    ...result,
    data: ensureArray<AuditLogRecord>(result.data),
  }
}

export const getSensitiveAuditLogs = async (params: AuditLogFilters) => {
  const response = await apiClient.get(apiRoutes.auditLogs.sensitive, {
    params: getSensitiveAuditQueryParams(params),
  })
  const result = unwrapApiResult<AuditLogRecord[]>(response)

  return {
    ...result,
    data: ensureArray<AuditLogRecord>(result.data),
  }
}

export const getAuditSummary = async (params: AuditLogFilters) => {
  const response = await apiClient.get(apiRoutes.auditLogs.summary, {
    params: getAuditSummaryQueryParams(params),
  })

  return unwrapApiData<AuditSummary>(response)
}

export const getAuditTimeline = async (params: AuditLogFilters & { groupBy?: string }) => {
  const response = await apiClient.get(apiRoutes.auditLogs.timeline, {
    params: cleanupQueryParams({ ...getAuditSummaryQueryParams(params), groupBy: params.groupBy ?? 'day', limit: 60 }),
  })

  return unwrapApiData<AuditTimeline>(response)
}

export const getAuditFilterOptions = async (params: Pick<AuditLogFilters, 'fromDate' | 'toDate'>) => {
  const response = await apiClient.get(apiRoutes.auditLogs.filterOptions, {
    params: cleanupQueryParams(params),
  })

  return unwrapApiData<AuditFilterOptions>(response)
}

export const getAuditLogDetail = async (id: string) => {
  const response = await apiClient.get(apiRoutes.auditLogs.detail(id))

  return unwrapApiData<AuditLogRecord>(response)
}

export const getRbacAuditSummary = async () => {
  const response = await apiClient.get(apiRoutes.rbacAudit.summary)

  return unwrapApiData<RbacAuditSummary>(response)
}

export const getRbacModules = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.modules, {
    params: getRbacModuleQueryParams(params),
  })

  return ensureArray<RbacModuleDefinition>(unwrapApiData<RbacModuleDefinition[]>(response))
}

export const getRbacPermissions = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.permissions, {
    params: getRbacFilterQueryParams(params),
  })

  return ensureArray<RbacPermissionDefinition>(unwrapApiData<RbacPermissionDefinition[]>(response))
}

export const getRbacRoles = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.roles, {
    params: getRbacFilterQueryParams(params),
  })

  return ensureArray<RbacRoleSummary>(unwrapApiData<RbacRoleSummary[]>(response))
}

export const getRbacMatrix = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.matrix, {
    params: getRbacFilterQueryParams(params),
  })

  return ensureArray<RbacMatrixRow>(unwrapApiData<RbacMatrixRow[]>(response))
}

export const getRbacCoverage = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.coverage, {
    params: getRbacFilterQueryParams(params),
  })

  return unwrapApiData<RbacCoverageSummary>(response)
}

export const getRbacRouteCoverage = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.routeCoverage, {
    params: getRbacModuleQueryParams(params),
  })

  return ensureArray<RbacRouteCoverageItem>(unwrapApiData<RbacRouteCoverageItem[]>(response))
}
