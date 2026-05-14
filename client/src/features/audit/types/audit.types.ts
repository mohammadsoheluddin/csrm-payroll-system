import type { UserRole } from '@/config/roles'

export type AuditRiskLevel = 'low' | 'medium' | 'high' | 'critical' | string
export type AuditSortOrder = 'asc' | 'desc'

export type AuditLogRecord = Record<string, unknown> & {
  _id?: string
  id?: string
  actorId?: string
  actorName?: string
  actorEmail?: string
  actorRole?: string
  module?: string
  action?: string
  riskLevel?: AuditRiskLevel
  category?: string
  entityId?: string
  entityName?: string
  description?: string
  previousData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  requestId?: string
  requestMethod?: string
  requestPath?: string
  requestUrl?: string
  ipAddress?: string
  networkType?: string
  deviceType?: string
  browser?: string
  operatingSystem?: string
  clientName?: string
  sessionId?: string
  createdAt?: string
  updatedAt?: string
}

export type AuditLogFilters = Record<string, string | number | boolean | undefined> & {
  searchTerm?: string
  module?: string
  action?: string
  riskLevel?: string
  category?: string
  actorRole?: string
  actorEmail?: string
  entityId?: string
  requestId?: string
  requestMethod?: string
  requestPath?: string
  ipAddress?: string
  networkType?: string
  deviceType?: string
  fromDate?: string
  toDate?: string
  includeData?: string
  sensitiveOnly?: string
  sortBy?: string
  sortOrder?: AuditSortOrder
  page?: number
  limit?: number
}

export type AuditFilterOptions = {
  modules?: string[]
  actions?: string[]
  actorRoles?: string[]
  networkTypes?: string[]
  deviceTypes?: string[]
  riskLevels?: string[]
  categories?: string[]
  browsers?: string[]
  operatingSystems?: string[]
  clientNames?: string[]
  sortFields?: string[]
}

export type AuditCountItem = Record<string, unknown> & {
  count?: number
}

export type AuditSummary = {
  totalLogs?: number
  summary?: {
    byModule?: Array<AuditCountItem & { module?: string }>
    byAction?: Array<AuditCountItem & { action?: string }>
    byActorRole?: Array<AuditCountItem & { actorRole?: string }>
    byNetworkType?: Array<AuditCountItem & { networkType?: string }>
    byDeviceType?: Array<AuditCountItem & { deviceType?: string }>
    byRiskLevel?: Array<AuditCountItem & { riskLevel?: string }>
    byCategory?: Array<AuditCountItem & { category?: string }>
  }
  sensitiveActivity?: {
    highRiskCount?: number
    criticalRiskCount?: number
    totalRecentSensitiveLogs?: number
    recentLogs?: AuditLogRecord[]
  }
}

export type AuditTimelineItem = Record<string, unknown> & {
  period?: string
  totalLogs?: number
  uniqueActorCount?: number
  moduleCount?: number
}

export type AuditTimeline = {
  groupBy?: string
  totalPeriods?: number
  data?: AuditTimelineItem[]
}

export type RbacAuditFilters = Record<string, string | undefined> & {
  module?: string
  role?: UserRole | string
  category?: string
  riskLevel?: string
}

export type RbacCoverageStatus = 'covered' | 'partial' | 'uncovered' | string
export type RbacIssueSeverity = 'info' | 'warning' | 'critical' | string

export type RbacAuditSummary = {
  generatedAt?: string
  permissionCount?: number
  roleCount?: number
  moduleCount?: number
  routeCoverageCount?: number
  criticalIssueCount?: number
  warningIssueCount?: number
  infoIssueCount?: number
  coverageStatus?: string
}

export type RbacModuleDefinition = Record<string, unknown> & {
  moduleKey?: string
  moduleName?: string
  category?: string
  routePath?: string
  criticality?: string
  expectedActions?: string[]
}

export type RbacPermissionDefinition = Record<string, unknown> & {
  permission?: string
  moduleKey?: string
  action?: string
  label?: string
  category?: string
  riskLevel?: string
  assignedRoles?: string[]
}

export type RbacMatrixRow = RbacPermissionDefinition & {
  roleCoverage?: Record<string, boolean>
  assignedRoleCount?: number
}

export type RbacRoleSummary = Record<string, unknown> & {
  role?: string
  totalPermissions?: number
  moduleCount?: number
  highRiskPermissions?: number
  permissions?: string[]
  permissionsByCategory?: Record<string, number>
}

export type RbacCoverageIssue = Record<string, unknown> & {
  severity?: RbacIssueSeverity
  type?: string
  moduleKey?: string
  permission?: string
  routePath?: string
  message?: string
  recommendation?: string
}

export type RbacCoverageSummary = {
  totalPermissions?: number
  totalRoles?: number
  totalModules?: number
  totalRouteCoverageItems?: number
  coveredRoutes?: number
  partialRoutes?: number
  uncoveredRoutes?: number
  issues?: RbacCoverageIssue[]
}

export type RbacRouteCoverageItem = Record<string, unknown> & {
  routePath?: string
  moduleKey?: string
  moduleName?: string
  category?: string
  requiredPermissions?: string[]
  availablePermissions?: string[]
  missingPermissions?: string[]
  status?: RbacCoverageStatus
  notes?: string[]
}
