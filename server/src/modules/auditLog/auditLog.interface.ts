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
  | "branch"
  | "department"
  | "employee"
  | "attendance"
  | "leave"
  | "holiday"
  | "salary_structure"
  | "payroll"
  | "payroll_report"
  | "payslip"
  | "rbac"
  | "system";

export type TAuditLogAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "soft_delete"
  | "login"
  | "logout"
  | "process"
  | "approve"
  | "reject"
  | "pay"
  | "lock"
  | "unlock"
  | "export"
  | "download"
  | "role_change"
  | "permission_denied"
  | "status_change"
  | "system_event";

export type TAuditDeviceType =
  | "desktop"
  | "mobile"
  | "tablet"
  | "bot"
  | "unknown";

export type TAuditNetworkType = "loopback" | "private" | "public" | "unknown";

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

  entityId?: string;
  entityName?: string;

  description: string;

  previousData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;

  // Added: Request, device and network audit metadata
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
  actorId?: string;
  actorRole?: string;
  entityId?: string;

  ipAddress?: string;
  networkType?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;

  fromDate?: string;
  toDate?: string;
  page?: string;
  limit?: string;
}
