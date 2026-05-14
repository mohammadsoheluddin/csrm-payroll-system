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
import { cleanupQueryParams } from '@/features/audit/utils/audit.utils'
import { apiClient } from '@/lib/api/httpClient'
import { unwrapApiData, unwrapApiResult } from '@/lib/api/apiResponse'

export const getAuditLogs = async (params: AuditLogFilters) => {
  const response = await apiClient.get(apiRoutes.auditLogs.root, {
    params: cleanupQueryParams(params),
  })

  return unwrapApiResult<AuditLogRecord[]>(response)
}

export const getSensitiveAuditLogs = async (params: AuditLogFilters) => {
  const response = await apiClient.get(apiRoutes.auditLogs.sensitive, {
    params: cleanupQueryParams(params),
  })

  return unwrapApiResult<AuditLogRecord[]>(response)
}

export const getAuditSummary = async (params: AuditLogFilters) => {
  const response = await apiClient.get(apiRoutes.auditLogs.summary, {
    params: cleanupQueryParams(params),
  })

  return unwrapApiData<AuditSummary>(response)
}

export const getAuditTimeline = async (params: AuditLogFilters & { groupBy?: string }) => {
  const response = await apiClient.get(apiRoutes.auditLogs.timeline, {
    params: cleanupQueryParams({ ...params, groupBy: params.groupBy ?? 'day', limit: 60 }),
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
    params: cleanupQueryParams(params),
  })

  return unwrapApiData<RbacModuleDefinition[]>(response)
}

export const getRbacPermissions = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.permissions, {
    params: cleanupQueryParams(params),
  })

  return unwrapApiData<RbacPermissionDefinition[]>(response)
}

export const getRbacRoles = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.roles, {
    params: cleanupQueryParams(params),
  })

  return unwrapApiData<RbacRoleSummary[]>(response)
}

export const getRbacMatrix = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.matrix, {
    params: cleanupQueryParams(params),
  })

  return unwrapApiData<RbacMatrixRow[]>(response)
}

export const getRbacCoverage = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.coverage, {
    params: cleanupQueryParams(params),
  })

  return unwrapApiData<RbacCoverageSummary>(response)
}

export const getRbacRouteCoverage = async (params: RbacAuditFilters) => {
  const response = await apiClient.get(apiRoutes.rbacAudit.routeCoverage, {
    params: cleanupQueryParams(params),
  })

  return unwrapApiData<RbacRouteCoverageItem[]>(response)
}
