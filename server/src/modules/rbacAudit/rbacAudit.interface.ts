import type { TPermission, TUserRole } from "../user/user.constant";

export type TRbacAuditCategory =
  | "master_data"
  | "employee"
  | "attendance"
  | "leave"
  | "salary"
  | "ot"
  | "bonus"
  | "payment"
  | "report"
  | "security"
  | "system";

export type TRbacRiskLevel = "low" | "medium" | "high" | "critical";

export type TRbacCoverageStatus = "covered" | "partial" | "uncovered";

export type TRbacIssueSeverity = "info" | "warning" | "critical";

export type TRbacIssueType =
  | "missing_permission"
  | "orphan_permission"
  | "unassigned_permission"
  | "admin_only_permission"
  | "duplicate_permission"
  | "route_without_permission"
  | "route_partial_permission";

export type TRbacAuditQuery = {
  module?: string;
  role?: TUserRole;
  category?: TRbacAuditCategory;
  riskLevel?: TRbacRiskLevel;
};

export type TRbacModuleDefinition = {
  moduleKey: string;
  moduleName: string;
  category: TRbacAuditCategory;
  routePath?: string;
  criticality: TRbacRiskLevel;
  expectedActions: string[];
  notes?: string[];
};

export type TRbacPermissionDefinition = {
  permission: TPermission;
  moduleKey: string;
  action: string;
  label: string;
  category: TRbacAuditCategory;
  riskLevel: TRbacRiskLevel;
  assignedRoles: TUserRole[];
  isAssignedToAdmin: boolean;
  isAssignedToSuperAdmin: boolean;
  isAssignedToOperationalRole: boolean;
};

export type TRbacPermissionMatrixRow = TRbacPermissionDefinition & {
  roleCoverage: Record<TUserRole, boolean>;
  assignedRoleCount: number;
};

export type TRbacRoleSummary = {
  role: TUserRole;
  totalPermissions: number;
  moduleCount: number;
  permissionsByCategory: Record<TRbacAuditCategory, number>;
  highRiskPermissions: number;
  permissions: TPermission[];
};

export type TRbacRouteCoverageItem = {
  routePath: string;
  moduleKey: string;
  moduleName: string;
  category: TRbacAuditCategory;
  requiredPermissions: TPermission[];
  availablePermissions: TPermission[];
  missingPermissions: string[];
  status: TRbacCoverageStatus;
  notes?: string[];
};

export type TRbacCoverageIssue = {
  severity: TRbacIssueSeverity;
  type: TRbacIssueType;
  moduleKey?: string;
  permission?: string;
  routePath?: string;
  message: string;
  recommendation: string;
};

export type TRbacCoverageSummary = {
  totalPermissions: number;
  totalRoles: number;
  totalModules: number;
  totalRouteCoverageItems: number;
  coveredRoutes: number;
  partialRoutes: number;
  uncoveredRoutes: number;
  issues: TRbacCoverageIssue[];
};

export type TRbacAuditSummary = {
  generatedAt: string;
  permissionCount: number;
  roleCount: number;
  moduleCount: number;
  routeCoverageCount: number;
  criticalIssueCount: number;
  warningIssueCount: number;
  infoIssueCount: number;
  coverageStatus: "healthy" | "needs_review" | "critical_review_required";
};
