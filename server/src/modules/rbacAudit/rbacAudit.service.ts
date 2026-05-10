import {
  PERMISSION_LIST,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  TPermission,
  TUserRole,
  USER_ROLE,
  USER_ROLES,
} from "../user/user.constant";
import {
  TRbacAuditCategory,
  TRbacAuditQuery,
  TRbacAuditSummary,
  TRbacCoverageIssue,
  TRbacCoverageStatus,
  TRbacCoverageSummary,
  TRbacModuleDefinition,
  TRbacPermissionDefinition,
  TRbacPermissionMatrixRow,
  TRbacRiskLevel,
  TRbacRoleSummary,
  TRbacRouteCoverageItem,
} from "./rbacAudit.interface";

const OPERATIONAL_ROLES = [
  USER_ROLE.hr,
  USER_ROLE.accounts,
  USER_ROLE.manager,
  USER_ROLE.employee,
] as TUserRole[];

const MODULE_CATALOG: TRbacModuleDefinition[] = [
  { moduleKey: "user", moduleName: "User", category: "security", routePath: "/api/v1/users", criticality: "critical", expectedActions: ["read", "manage"] },
  { moduleKey: "company", moduleName: "Company", category: "master_data", routePath: "/api/v1/companies", criticality: "high", expectedActions: ["read", "manage"] },
  { moduleKey: "major_department", moduleName: "Major Department", category: "master_data", routePath: "/api/v1/major-departments", criticality: "medium", expectedActions: ["read", "manage"] },
  { moduleKey: "designation", moduleName: "Designation", category: "master_data", routePath: "/api/v1/designations", criticality: "medium", expectedActions: ["read", "manage"] },
  { moduleKey: "branch", moduleName: "Branch", category: "master_data", routePath: "/api/v1/branches", criticality: "medium", expectedActions: ["read", "manage"] },
  { moduleKey: "department", moduleName: "Department", category: "master_data", routePath: "/api/v1/departments", criticality: "medium", expectedActions: ["read", "manage"] },
  { moduleKey: "employee", moduleName: "Employee", category: "employee", routePath: "/api/v1/employees", criticality: "critical", expectedActions: ["read", "manage"] },
  { moduleKey: "employee_bulk_import", moduleName: "Employee Bulk Import", category: "employee", routePath: "/api/v1/employee-bulk-imports", criticality: "critical", expectedActions: ["read", "process", "export", "revert"] },
  { moduleKey: "employee_movement", moduleName: "Employee Movement", category: "employee", routePath: "/api/v1/employee-movements", criticality: "critical", expectedActions: ["read", "manage", "approve", "apply", "payroll_impact_read"] },
  { moduleKey: "employee_bank_info", moduleName: "Employee Bank Info", category: "payment", routePath: "/api/v1/employee-bank-infos", criticality: "critical", expectedActions: ["read", "manage"] },
  { moduleKey: "company_bank_account", moduleName: "Company Bank Account", category: "payment", routePath: "/api/v1/company-bank-accounts", criticality: "high", expectedActions: ["read", "manage"] },
  { moduleKey: "bank_sheet", moduleName: "Legacy Bank Sheet", category: "payment", routePath: "/api/v1/bank-sheets", criticality: "high", expectedActions: ["read", "manage", "export"] },
  { moduleKey: "attendance", moduleName: "Attendance", category: "attendance", routePath: "/api/v1/attendance", criticality: "critical", expectedActions: ["read", "manage"] },
  { moduleKey: "attendance_import", moduleName: "Attendance Import", category: "attendance", routePath: "/api/v1/attendance-imports", criticality: "critical", expectedActions: ["read", "process", "export", "revert"] },
  { moduleKey: "attendance_finalization", moduleName: "Attendance Finalization", category: "attendance", routePath: "/api/v1/attendance-finalizations", criticality: "critical", expectedActions: ["read", "process", "approve", "lock", "unlock"] },
  { moduleKey: "leave", moduleName: "Leave", category: "leave", routePath: "/api/v1/leave", criticality: "high", expectedActions: ["read", "manage", "approve"] },
  { moduleKey: "leave_balance", moduleName: "Leave Balance", category: "leave", routePath: "/api/v1/leave-balances", criticality: "high", expectedActions: ["read", "process", "adjust", "lock", "unlock", "export"] },
  { moduleKey: "holiday", moduleName: "Holiday", category: "leave", routePath: "/api/v1/holiday", criticality: "medium", expectedActions: ["read", "manage"] },
  { moduleKey: "salary_structure", moduleName: "Salary Structure", category: "salary", routePath: "/api/v1/salary-structure", criticality: "critical", expectedActions: ["read", "manage"] },
  { moduleKey: "salary_sheet", moduleName: "Salary Sheet", category: "salary", routePath: "/api/v1/salary-sheets", criticality: "critical", expectedActions: ["read", "process", "approve", "lock", "unlock"] },
  { moduleKey: "salary_statement", moduleName: "Salary Statement", category: "salary", routePath: "/api/v1/salary-statements", criticality: "critical", expectedActions: ["read", "process", "approve", "lock", "unlock"] },
  { moduleKey: "salary_payment_distribution", moduleName: "Salary Payment Distribution", category: "salary", routePath: "/api/v1/salary-payment-distributions", criticality: "critical", expectedActions: ["read", "process", "approve", "lock", "unlock", "export"] },
  { moduleKey: "payroll", moduleName: "Legacy Payroll", category: "salary", routePath: "/api/v1/payroll", criticality: "critical", expectedActions: ["read", "update", "process", "approve", "pay", "lock", "unlock", "batch_approve", "batch_lock", "audit_read"] },
  { moduleKey: "payroll_report", moduleName: "Payroll Report", category: "report", routePath: "/api/v1/payroll-reports", criticality: "medium", expectedActions: ["read", "export"] },
  { moduleKey: "time_bill", moduleName: "Time Bill", category: "ot", routePath: "/api/v1/time-bills", criticality: "critical", expectedActions: ["read", "process", "approve", "lock", "unlock", "export"] },
  { moduleKey: "ot_statement", moduleName: "OT Statement", category: "ot", routePath: "/api/v1/ot-statements", criticality: "critical", expectedActions: ["read", "process", "approve", "lock", "unlock", "export"] },
  { moduleKey: "ot_payment_distribution", moduleName: "OT Payment Distribution", category: "ot", routePath: "/api/v1/ot-payment-distributions", criticality: "critical", expectedActions: ["read", "process", "approve", "lock", "unlock", "export"] },
  { moduleKey: "bonus_sheet", moduleName: "Bonus Sheet", category: "bonus", routePath: "/api/v1/bonus-sheets", criticality: "high", expectedActions: ["read", "process", "approve", "lock", "unlock"] },
  { moduleKey: "bonus_statement", moduleName: "Bonus Statement", category: "bonus", routePath: "/api/v1/bonus-statements", criticality: "high", expectedActions: ["read", "process", "approve", "lock", "unlock"] },
  { moduleKey: "bonus_payment_distribution", moduleName: "Bonus Payment Distribution", category: "bonus", routePath: "/api/v1/bonus-payment-distributions", criticality: "high", expectedActions: ["read", "process", "approve", "lock", "unlock", "export"] },
  { moduleKey: "month_end_process_control", moduleName: "Month-End Process Control", category: "system", routePath: "/api/v1/month-end-process-control", criticality: "critical", expectedActions: ["read"] },
  { moduleKey: "report_center", moduleName: "Report Center", category: "report", routePath: "/api/v1/report-center", criticality: "medium", expectedActions: ["read", "config_manage"] },
  { moduleKey: "report_layout_standard", moduleName: "Report Layout Standard", category: "report", routePath: "/api/v1/report-layout-standards", criticality: "low", expectedActions: ["read"] },
  { moduleKey: "payslip", moduleName: "Payslip", category: "salary", criticality: "medium", expectedActions: ["read:any", "read:own"] },
  { moduleKey: "audit_log", moduleName: "Audit Log", category: "security", routePath: "/api/v1/audit-logs", criticality: "critical", expectedActions: ["read"] },
  { moduleKey: "rbac_audit", moduleName: "RBAC Audit", category: "security", routePath: "/api/v1/rbac-audit", criticality: "critical", expectedActions: ["read"] },
];

const moduleMap = new Map(MODULE_CATALOG.map((module) => [module.moduleKey, module]));

const normalizeActionLabel = (action: string) =>
  action
    .split(/[_:]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const normalizeModuleLabel = (moduleKey: string) =>
  moduleMap.get(moduleKey)?.moduleName ||
  moduleKey
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getPermissionParts = (permission: TPermission) => {
  const [moduleKey = "unknown", action = "unknown"] = permission.split(":");

  return {
    moduleKey,
    action,
  };
};

const getRiskLevel = (moduleCriticality: TRbacRiskLevel, action: string): TRbacRiskLevel => {
  const criticalActions = ["manage", "approve", "lock", "unlock", "pay", "apply", "revert", "adjust", "role_change"];
  const highActions = ["process", "update", "delete", "soft_delete", "export", "batch_approve", "batch_lock"];

  if (moduleCriticality === "critical" && criticalActions.includes(action)) {
    return "critical";
  }

  if (criticalActions.includes(action) || moduleCriticality === "critical") {
    return "high";
  }

  if (highActions.includes(action) || moduleCriticality === "high") {
    return "medium";
  }

  return "low";
};

const getAssignedRoles = (permission: TPermission): TUserRole[] =>
  USER_ROLES.filter((role) => ROLE_PERMISSIONS[role].includes(permission));

const buildPermissionDefinitions = (): TRbacPermissionDefinition[] =>
  PERMISSION_LIST.map((permission) => {
    const { moduleKey, action } = getPermissionParts(permission);
    const moduleDefinition = moduleMap.get(moduleKey);
    const assignedRoles = getAssignedRoles(permission);

    return {
      permission,
      moduleKey,
      action,
      label: `${normalizeModuleLabel(moduleKey)} - ${normalizeActionLabel(action)}`,
      category: moduleDefinition?.category || "system",
      riskLevel: getRiskLevel(moduleDefinition?.criticality || "medium", action),
      assignedRoles,
      isAssignedToAdmin: assignedRoles.includes(USER_ROLE.admin),
      isAssignedToSuperAdmin: assignedRoles.includes(USER_ROLE.super_admin),
      isAssignedToOperationalRole: assignedRoles.some((role) =>
        OPERATIONAL_ROLES.includes(role),
      ),
    };
  });

const applyFilters = <T extends { moduleKey?: string; category?: TRbacAuditCategory; riskLevel?: TRbacRiskLevel; assignedRoles?: TUserRole[] }>(
  rows: T[],
  query: TRbacAuditQuery,
) =>
  rows.filter((row) => {
    if (query.module && row.moduleKey !== query.module) {
      return false;
    }

    if (query.category && row.category !== query.category) {
      return false;
    }

    if (query.riskLevel && row.riskLevel !== query.riskLevel) {
      return false;
    }

    if (query.role && row.assignedRoles && !row.assignedRoles.includes(query.role)) {
      return false;
    }

    return true;
  });

const buildMatrixRows = (query: TRbacAuditQuery = {}): TRbacPermissionMatrixRow[] => {
  const definitions = applyFilters(buildPermissionDefinitions(), query);

  return definitions.map((definition) => {
    const roleCoverage = USER_ROLES.reduce(
      (acc, role) => {
        acc[role] = ROLE_PERMISSIONS[role].includes(definition.permission);
        return acc;
      },
      {} as Record<TUserRole, boolean>,
    );

    return {
      ...definition,
      roleCoverage,
      assignedRoleCount: definition.assignedRoles.length,
    };
  });
};

const buildRoleSummaries = (query: TRbacAuditQuery = {}): TRbacRoleSummary[] => {
  const permissions = buildPermissionDefinitions();

  return USER_ROLES.filter((role) => !query.role || query.role === role).map((role) => {
    const rolePermissions = permissions.filter((permission) => {
      if (!permission.assignedRoles.includes(role)) {
        return false;
      }

      if (query.module && permission.moduleKey !== query.module) {
        return false;
      }

      if (query.category && permission.category !== query.category) {
        return false;
      }

      if (query.riskLevel && permission.riskLevel !== query.riskLevel) {
        return false;
      }

      return true;
    });

    const permissionsByCategory = rolePermissions.reduce(
      (acc, permission) => {
        acc[permission.category] = (acc[permission.category] || 0) + 1;
        return acc;
      },
      {
        master_data: 0,
        employee: 0,
        attendance: 0,
        leave: 0,
        salary: 0,
        ot: 0,
        bonus: 0,
        payment: 0,
        report: 0,
        security: 0,
        system: 0,
      } as Record<TRbacAuditCategory, number>,
    );

    return {
      role,
      totalPermissions: rolePermissions.length,
      moduleCount: new Set(rolePermissions.map((permission) => permission.moduleKey)).size,
      permissionsByCategory,
      highRiskPermissions: rolePermissions.filter((permission) =>
        ["high", "critical"].includes(permission.riskLevel),
      ).length,
      permissions: rolePermissions.map((permission) => permission.permission),
    };
  });
};

const buildRouteCoverage = (query: TRbacAuditQuery = {}): TRbacRouteCoverageItem[] => {
  const permissionSet = new Set<string>(PERMISSION_LIST);

  return MODULE_CATALOG.filter((moduleDefinition) => Boolean(moduleDefinition.routePath))
    .filter((moduleDefinition) => !query.module || query.module === moduleDefinition.moduleKey)
    .filter((moduleDefinition) => !query.category || query.category === moduleDefinition.category)
    .map((moduleDefinition) => {
      const requiredPermissions = moduleDefinition.expectedActions.map(
        (action) => `${moduleDefinition.moduleKey}:${action}`,
      );
      const availablePermissions = requiredPermissions.filter((permission) =>
        permissionSet.has(permission),
      ) as TPermission[];
      const missingPermissions = requiredPermissions.filter(
        (permission) => !permissionSet.has(permission),
      );
      const status: TRbacCoverageStatus =
        availablePermissions.length === requiredPermissions.length
          ? "covered"
          : availablePermissions.length > 0
            ? "partial"
            : "uncovered";

      return {
        routePath: moduleDefinition.routePath as string,
        moduleKey: moduleDefinition.moduleKey,
        moduleName: moduleDefinition.moduleName,
        category: moduleDefinition.category,
        requiredPermissions: requiredPermissions as TPermission[],
        availablePermissions,
        missingPermissions,
        status,
        notes: moduleDefinition.notes,
      };
    });
};

const buildCoverageIssues = (): TRbacCoverageIssue[] => {
  const permissionDefinitions = buildPermissionDefinitions();
  const permissionSet = new Set<string>(PERMISSION_LIST);
  const issues: TRbacCoverageIssue[] = [];

  const permissionCounts = PERMISSION_LIST.reduce(
    (acc, permission) => {
      acc[permission] = (acc[permission] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  Object.entries(permissionCounts)
    .filter(([, count]) => count > 1)
    .forEach(([permission]) => {
      issues.push({
        severity: "critical",
        type: "duplicate_permission",
        permission,
        message: `Duplicate permission detected: ${permission}`,
        recommendation: "Keep permission strings unique inside PERMISSIONS.",
      });
    });

  permissionDefinitions.forEach((permission) => {
    if (!moduleMap.has(permission.moduleKey)) {
      issues.push({
        severity: "warning",
        type: "orphan_permission",
        moduleKey: permission.moduleKey,
        permission: permission.permission,
        message: `Permission ${permission.permission} does not have a module catalog entry.`,
        recommendation: "Add the module to RBAC module catalog or rename the permission module key.",
      });
    }

    if (!permission.isAssignedToSuperAdmin || !permission.isAssignedToAdmin) {
      issues.push({
        severity: "critical",
        type: "unassigned_permission",
        moduleKey: permission.moduleKey,
        permission: permission.permission,
        message: `Permission ${permission.permission} is not assigned to both admin and super_admin.`,
        recommendation: "Admin and super_admin should normally receive all permissions through ALL_PERMISSIONS.",
      });
    }

    if (!permission.isAssignedToOperationalRole && permission.moduleKey !== "rbac_audit") {
      issues.push({
        severity: "info",
        type: "admin_only_permission",
        moduleKey: permission.moduleKey,
        permission: permission.permission,
        message: `Permission ${permission.permission} is currently admin-only.`,
        recommendation: "Review whether HR, Accounts, Manager, or Employee should receive this permission.",
      });
    }
  });

  MODULE_CATALOG.forEach((moduleDefinition) => {
    moduleDefinition.expectedActions.forEach((action) => {
      const permission = `${moduleDefinition.moduleKey}:${action}`;

      if (!permissionSet.has(permission)) {
        issues.push({
          severity: moduleDefinition.criticality === "critical" ? "critical" : "warning",
          type: "missing_permission",
          moduleKey: moduleDefinition.moduleKey,
          permission,
          routePath: moduleDefinition.routePath,
          message: `Expected permission ${permission} is missing for ${moduleDefinition.moduleName}.`,
          recommendation: "Add this permission to PERMISSIONS and assign it to the correct roles, or update the RBAC catalog if this action is intentionally not supported.",
        });
      }
    });
  });

  buildRouteCoverage().forEach((route) => {
    if (route.status === "uncovered") {
      issues.push({
        severity: "critical",
        type: "route_without_permission",
        moduleKey: route.moduleKey,
        routePath: route.routePath,
        message: `Route ${route.routePath} has no expected permission coverage in RBAC catalog.`,
        recommendation: "Add read/manage/process permissions and protect the route with requirePermission.",
      });
    }

    if (route.status === "partial") {
      issues.push({
        severity: "warning",
        type: "route_partial_permission",
        moduleKey: route.moduleKey,
        routePath: route.routePath,
        message: `Route ${route.routePath} has partial permission coverage. Missing: ${route.missingPermissions.join(", ")}`,
        recommendation: "Add the missing permissions or update expected actions for the module.",
      });
    }
  });

  return issues;
};

const getSummaryFromDB = (): TRbacAuditSummary => {
  const issues = buildCoverageIssues();
  const criticalIssueCount = issues.filter((issue) => issue.severity === "critical").length;
  const warningIssueCount = issues.filter((issue) => issue.severity === "warning").length;
  const infoIssueCount = issues.filter((issue) => issue.severity === "info").length;

  return {
    generatedAt: new Date().toISOString(),
    permissionCount: PERMISSION_LIST.length,
    roleCount: USER_ROLES.length,
    moduleCount: MODULE_CATALOG.length,
    routeCoverageCount: buildRouteCoverage().length,
    criticalIssueCount,
    warningIssueCount,
    infoIssueCount,
    coverageStatus:
      criticalIssueCount > 0
        ? "critical_review_required"
        : warningIssueCount > 0
          ? "needs_review"
          : "healthy",
  };
};

const getPermissionsFromDB = (query: TRbacAuditQuery = {}) =>
  applyFilters(buildPermissionDefinitions(), query);

const getRolesFromDB = (query: TRbacAuditQuery = {}) => buildRoleSummaries(query);

const getMatrixFromDB = (query: TRbacAuditQuery = {}) => buildMatrixRows(query);

const getRouteCoverageFromDB = (query: TRbacAuditQuery = {}) => buildRouteCoverage(query);

const getCoverageFromDB = (query: TRbacAuditQuery = {}): TRbacCoverageSummary => {
  const routeCoverage = buildRouteCoverage(query);
  const issues = buildCoverageIssues().filter((issue) => {
    if (query.module && issue.moduleKey !== query.module) {
      return false;
    }

    return true;
  });

  return {
    totalPermissions: getPermissionsFromDB(query).length,
    totalRoles: getRolesFromDB(query).length,
    totalModules: MODULE_CATALOG.filter((moduleDefinition) =>
      (!query.module || moduleDefinition.moduleKey === query.module) &&
      (!query.category || moduleDefinition.category === query.category),
    ).length,
    totalRouteCoverageItems: routeCoverage.length,
    coveredRoutes: routeCoverage.filter((route) => route.status === "covered").length,
    partialRoutes: routeCoverage.filter((route) => route.status === "partial").length,
    uncoveredRoutes: routeCoverage.filter((route) => route.status === "uncovered").length,
    issues,
  };
};

const getModuleCatalogFromDB = (query: TRbacAuditQuery = {}) =>
  MODULE_CATALOG.filter((moduleDefinition) =>
    (!query.module || moduleDefinition.moduleKey === query.module) &&
    (!query.category || moduleDefinition.category === query.category),
  );

export const RbacAuditServices = {
  getSummaryFromDB,
  getPermissionsFromDB,
  getRolesFromDB,
  getMatrixFromDB,
  getCoverageFromDB,
  getRouteCoverageFromDB,
  getModuleCatalogFromDB,
};
