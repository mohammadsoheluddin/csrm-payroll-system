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

  ipAddress?: string;
  userAgent?: string;

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

  ipAddress?: string;
  userAgent?: string;
}

export interface TAuditLogQuery {
  module?: string;
  action?: string;
  actorId?: string;
  actorRole?: string;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
  page?: string;
  limit?: string;
}
