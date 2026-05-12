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
  salaryStatements: '/salary/statements',
  salaryPaymentDistributions: '/salary/payment-distributions',

  timeBills: '/time-bill',
  otStatements: '/time-bill/ot-statements',
  otPaymentDistributions: '/time-bill/ot-payment-distributions',

  bonus: '/bonus',
  bonusStatements: '/bonus/statements',
  bonusPaymentDistributions: '/bonus/payment-distributions',

  bankSheets: '/bank-sheets',

  reportCenter: '/reports/center',
  reportLayoutStandards: '/reports/layout-standards',
  monthEndControl: '/reports/month-end-control',
  auditLogs: '/audit/logs',
  rbacAudit: '/rbac/audit',
} as const

export type RoutePath = (typeof routePaths)[keyof typeof routePaths]
