export const USER_ROLE = {
  super_admin: "super_admin",
  admin: "admin",
  hr: "hr",
  accounts: "accounts",
  manager: "manager",
  employee: "employee",
} as const;

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_ROLES = Object.values(USER_ROLE);

export const PERMISSIONS = {
  USER_READ: "user:read",
  USER_MANAGE: "user:manage",

  COMPANY_READ: "company:read",
  COMPANY_MANAGE: "company:manage",

  BRANCH_READ: "branch:read",
  BRANCH_MANAGE: "branch:manage",

  DEPARTMENT_READ: "department:read",
  DEPARTMENT_MANAGE: "department:manage",

  EMPLOYEE_READ: "employee:read",
  EMPLOYEE_MANAGE: "employee:manage",

  ATTENDANCE_READ: "attendance:read",
  ATTENDANCE_MANAGE: "attendance:manage",

  LEAVE_READ: "leave:read",
  LEAVE_MANAGE: "leave:manage",
  LEAVE_APPROVE: "leave:approve",

  HOLIDAY_READ: "holiday:read",
  HOLIDAY_MANAGE: "holiday:manage",

  SALARY_STRUCTURE_READ: "salary_structure:read",
  SALARY_STRUCTURE_MANAGE: "salary_structure:manage",

  PAYROLL_READ: "payroll:read",
  PAYROLL_UPDATE: "payroll:update",
  PAYROLL_PROCESS: "payroll:process",
  PAYROLL_APPROVE: "payroll:approve",
  PAYROLL_PAY: "payroll:pay",
  PAYROLL_LOCK: "payroll:lock",
  PAYROLL_UNLOCK: "payroll:unlock",
  PAYROLL_BATCH_APPROVE: "payroll:batch_approve",
  PAYROLL_BATCH_LOCK: "payroll:batch_lock",
  PAYROLL_AUDIT_READ: "payroll:audit_read",

  PAYROLL_REPORT_READ: "payroll_report:read",
  PAYROLL_REPORT_EXPORT: "payroll_report:export",

  PAYSLIP_READ_ANY: "payslip:read:any",
  PAYSLIP_READ_OWN: "payslip:read:own",

  AUDIT_LOG_READ: "audit_log:read",
} as const;

export type TPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LIST = Object.values(PERMISSIONS) as TPermission[];

const ALL_PERMISSIONS: TPermission[] = [...PERMISSION_LIST];

export const ROLE_PERMISSIONS: Record<TUserRole, TPermission[]> = {
  [USER_ROLE.super_admin]: ALL_PERMISSIONS,

  [USER_ROLE.admin]: ALL_PERMISSIONS,

  [USER_ROLE.hr]: [
    PERMISSIONS.USER_READ,

    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.COMPANY_MANAGE,

    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.BRANCH_MANAGE,

    PERMISSIONS.DEPARTMENT_READ,
    PERMISSIONS.DEPARTMENT_MANAGE,

    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.EMPLOYEE_MANAGE,

    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_MANAGE,

    PERMISSIONS.LEAVE_READ,
    PERMISSIONS.LEAVE_MANAGE,
    PERMISSIONS.LEAVE_APPROVE,

    PERMISSIONS.HOLIDAY_READ,
    PERMISSIONS.HOLIDAY_MANAGE,

    PERMISSIONS.SALARY_STRUCTURE_READ,
    PERMISSIONS.SALARY_STRUCTURE_MANAGE,

    PERMISSIONS.PAYROLL_READ,
    PERMISSIONS.PAYROLL_UPDATE,
    PERMISSIONS.PAYROLL_PROCESS,
    PERMISSIONS.PAYROLL_AUDIT_READ,

    PERMISSIONS.PAYROLL_REPORT_READ,
    PERMISSIONS.PAYROLL_REPORT_EXPORT,

    PERMISSIONS.PAYSLIP_READ_ANY,
  ],

  [USER_ROLE.accounts]: [
    PERMISSIONS.USER_READ,

    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.DEPARTMENT_READ,
    PERMISSIONS.EMPLOYEE_READ,

    PERMISSIONS.HOLIDAY_READ,

    PERMISSIONS.SALARY_STRUCTURE_READ,

    PERMISSIONS.PAYROLL_READ,
    PERMISSIONS.PAYROLL_PAY,
    PERMISSIONS.PAYROLL_LOCK,
    PERMISSIONS.PAYROLL_AUDIT_READ,

    PERMISSIONS.PAYROLL_REPORT_READ,
    PERMISSIONS.PAYROLL_REPORT_EXPORT,

    PERMISSIONS.PAYSLIP_READ_ANY,
  ],

  [USER_ROLE.manager]: [
    PERMISSIONS.USER_READ,

    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.DEPARTMENT_READ,
    PERMISSIONS.EMPLOYEE_READ,

    PERMISSIONS.ATTENDANCE_READ,

    PERMISSIONS.LEAVE_READ,
    PERMISSIONS.LEAVE_APPROVE,

    PERMISSIONS.HOLIDAY_READ,

    PERMISSIONS.PAYROLL_READ,
    PERMISSIONS.PAYROLL_APPROVE,
    PERMISSIONS.PAYROLL_LOCK,
    PERMISSIONS.PAYROLL_BATCH_APPROVE,
    PERMISSIONS.PAYROLL_BATCH_LOCK,
    PERMISSIONS.PAYROLL_AUDIT_READ,

    PERMISSIONS.PAYROLL_REPORT_READ,

    PERMISSIONS.PAYSLIP_READ_ANY,
  ],

  [USER_ROLE.employee]: [
    PERMISSIONS.COMPANY_READ,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.DEPARTMENT_READ,
    PERMISSIONS.HOLIDAY_READ,
    PERMISSIONS.PAYSLIP_READ_OWN,
  ],
};

export const hasPermission = (
  role: TUserRole | string | undefined,
  requiredPermissions: TPermission[],
) => {
  if (!role) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[role as TUserRole];

  if (!permissions) {
    return false;
  }

  return requiredPermissions.every((permission) =>
    permissions.includes(permission),
  );
};
