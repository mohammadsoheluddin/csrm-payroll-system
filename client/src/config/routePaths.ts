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
  employeeProfile: '/employees/:employeeRef/profile',
  employeeBulkImport: '/employees/bulk-import',
  employeeMovements: '/employees/movements',
  employeeDocuments: '/employees/documents',

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
  legacySalaryImports: '/salary/legacy-imports',

  timeBills: '/time-bill',
  otStatements: '/time-bill/ot-statements',
  otPaymentDistributions: '/time-bill/ot-payment-distributions',

  bonus: '/bonus',
  bonusStatements: '/bonus/statements',
  bonusPaymentDistributions: '/bonus/payment-distributions',

  bankSheets: '/bank-sheets',

  reportCenter: '/reports/center',
  salarySummary: '/reports/salary-summary',
  reportLayoutStandards: '/reports/layout-standards',
  monthEndControl: '/reports/month-end-control',
  auditLogs: '/audit/logs',
  rbacAudit: '/rbac/audit',
} as const

export const buildEmployeeProfilePath = (employeeRef: string) => {
  return `/employees/${encodeURIComponent(employeeRef)}/profile`
}

export const buildEmployeeDocumentsPath = (employeeRef: string) => {
  return `${routePaths.employeeDocuments}?employee=${encodeURIComponent(employeeRef)}`
}

export type RoutePath = (typeof routePaths)[keyof typeof routePaths]
