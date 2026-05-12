export const routePaths = {
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  forbidden: '/forbidden',
  sessionExpired: '/session-expired',

  users: '/users',
  profile: '/settings/profile',
  themeSettings: '/settings/theme',

  companies: '/masters/companies',
  branches: '/masters/branches',
  majorDepartments: '/masters/major-departments',
  departments: '/masters/departments',
  designations: '/masters/designations',
  companyBankAccounts: '/masters/company-bank-accounts',

  employees: '/employees',
  employeeBulkImport: '/employees/bulk-import',
  employeeMovements: '/employees/movements',

  attendance: '/attendance',
  attendanceImports: '/attendance/imports',
  attendanceFinalizations: '/attendance/finalizations',

  leave: '/leave',
  leaveBalances: '/leave/balances',
  holidays: '/leave/holidays',

  payroll: '/payroll',
  salaryStructures: '/salary/structures',
  salarySheets: '/salary/sheets',
  timeBills: '/time-bill',
  bonus: '/bonus',
  bankSheets: '/bank-sheets',

  reportCenter: '/reports/center',
  monthEndControl: '/reports/month-end-control',
  auditLogs: '/audit/logs',
  rbacAudit: '/rbac/audit',
} as const
