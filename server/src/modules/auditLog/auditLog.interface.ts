export type TAuditLogActorRole =
  | "super_admin"
  | "admin"
  | "hr"
  | "accounts"
  | "manager"
  | "employee"
  | "system";

export type TAuditLogModule =
  | "auth"
  | "user"
  | "company"
  | "company_bank_account"
  | "major_department"
  | "designation"
  | "employee_bank_info"
  | "employee_movement"
  | "bank_sheet"
  | "bank_sheet_history"
  | "branch"
  | "department"
  | "employee"
  | "employee_document"
  | "employee_bulk_import"
  | "attendance"
  | "attendance_import"
  | "attendance_finalization"
  | "leave"
  | "leave_balance"
  | "holiday"
  | "salary_structure"
  | "salary_sheet"
  | "salary_statement"
  | "salary_payment_distribution"
  | "salary_summary"
  | "legacy_salary_import"
  | "payroll"
  | "payroll_report"
  | "report_center"
  | "time_bill"
  | "ot_statement"
  | "ot_payment_distribution"
  | "month_end_process_control"
  | "bonus_sheet"
  | "bonus_statement"
  | "bonus_payment_distribution"
  | "payslip"
  | "rbac"
  | "system";

export type TAuditLogAction =
  | "create"
  | "created"
  | "read"
  | "update"
  | "delete"
  | "soft_delete"
  | "restore"
  | "login"
  | "logout"
  | "process"
  | "processed"
  | "approve"
  | "approved"
  | "reject"
  | "pay"
  | "generate"
  | "generated"
  | "regenerated"
  | "finalize"
  | "finalized"
  | "lock"
  | "locked"
  | "unlock"
  | "unlocked"
  | "export"
  | "download"
  | "role_change"
  | "permission_denied"
  | "status_change"
  | "system_event"
  | "applied"
  | "blocked"
  | "set_opening_balance"
  | "skip_already_deleted";

export type TAuditRiskLevel = "low" | "medium" | "high" | "critical";

export type TAuditLogCategory =
  | "authentication"
  | "authorization"
  | "data_access"
  | "data_mutation"
  | "approval"
  | "lock_control"
  | "export"
  | "payroll_process"
  | "system"
  | "general";

export type TAuditDeviceType =
  | "desktop"
  | "mobile"
  | "tablet"
  | "bot"
  | "unknown";

export type TAuditNetworkType = "loopback" | "private" | "public" | "unknown";

export type TAuditLogSortBy =
  | "createdAt"
  | "updatedAt"
  | "module"
  | "action"
  | "actorRole"
  | "actorEmail"
  | "entityName"
  | "ipAddress"
  | "deviceType"
  | "riskLevel"
  | "category";

export type TAuditLogSortOrder = "asc" | "desc";

export type TAuditLogTimelineGroupBy = "hour" | "day" | "month";

export interface TAuditLogLocation {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

export interface TAuditLog {
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: TAuditLogActorRole;

  module: TAuditLogModule;
  action: TAuditLogAction;
  riskLevel?: TAuditRiskLevel;
  category?: TAuditLogCategory;

  entityId?: string;
  entityName?: string;
  description: string;

  previousData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;

  requestId?: string;
  requestMethod?: string;
  requestUrl?: string;
  requestOriginalUrl?: string;
  requestPath?: string;
  requestQuery?: Record<string, unknown> | null;

  ipAddress?: string;
  forwardedFor?: string;
  realIp?: string;
  networkType?: TAuditNetworkType;

  userAgent?: string;
  browser?: string;
  operatingSystem?: string;
  deviceType?: TAuditDeviceType;

  clientName?: string;
  clientId?: string;
  sessionId?: string;

  location?: TAuditLogLocation | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface TCreateAuditLogPayload {
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: TAuditLogActorRole;

  module: TAuditLogModule;
  action: TAuditLogAction;
  riskLevel?: TAuditRiskLevel;
  category?: TAuditLogCategory;

  entityId?: string;
  entityName?: string;
  description: string;

  previousData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;

  requestId?: string;
  requestMethod?: string;
  requestUrl?: string;
  requestOriginalUrl?: string;
  requestPath?: string;
  requestQuery?: Record<string, unknown> | null;

  ipAddress?: string;
  forwardedFor?: string;
  realIp?: string;
  networkType?: TAuditNetworkType;

  userAgent?: string;
  browser?: string;
  operatingSystem?: string;
  deviceType?: TAuditDeviceType;

  clientName?: string;
  clientId?: string;
  sessionId?: string;

  location?: TAuditLogLocation | null;
}

export interface TAuditLogQuery {
  module?: string;
  action?: string;
  riskLevel?: string;
  category?: string;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  entityId?: string;
  entityName?: string;
  requestId?: string;
  requestMethod?: string;
  requestPath?: string;
  ipAddress?: string;
  networkType?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  clientName?: string;
  clientId?: string;
  sessionId?: string;
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
  includeData?: string;
  sensitiveOnly?: string;
  hasPreviousData?: string;
  hasNewData?: string;
  hasMetadata?: string;
  sortBy?: TAuditLogSortBy | string;
  sortOrder?: TAuditLogSortOrder | string;
  page?: string | number;
  limit?: string | number;
}

export interface TAuditLogSummaryQuery {
  module?: string;
  action?: string;
  riskLevel?: string;
  category?: string;
  actorRole?: string;
  actorEmail?: string;
  entityId?: string;
  ipAddress?: string;
  networkType?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  clientId?: string;
  sessionId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface TAuditLogTimelineQuery extends TAuditLogSummaryQuery {
  groupBy?: TAuditLogTimelineGroupBy | string;
  limit?: string | number;
}

export interface TAuditLogFilterOptionsQuery {
  fromDate?: string;
  toDate?: string;
}

export interface TAuditLogEntityTrailQuery {
  module?: string;
  action?: string;
  riskLevel?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  includeData?: string;
  page?: string | number;
  limit?: string | number;
}

export interface TAuditLogSensitiveQuery {
  module?: string;
  action?: string;
  riskLevel?: string;
  category?: string;
  actorRole?: string;
  actorEmail?: string;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
  includeData?: string;
  page?: string | number;
  limit?: string | number;
}
