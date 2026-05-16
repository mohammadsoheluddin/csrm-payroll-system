export const apiRoutes = {
  auth: {
    login: '/auth/login',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',
  },
  users: {
    me: '/users/me',
    root: '/users',
  },
  employees: {
    root: '/employees',
    create: '/employees/create-employee',
    deleted: '/employees/deleted',
    detail: (id: string) => `/employees/${id}`,
    lifecycle: (id: string) => `/employees/${id}/lifecycle`,
    restore: (id: string) => `/employees/${id}/restore`,
  },
  employeeDocuments: {
    root: '/employee-documents',
    upload: '/employee-documents/upload',
    deleted: '/employee-documents/deleted',
    expiring: '/employee-documents/expiring',
    detail: (id: string) => `/employee-documents/${id}`,
    download: (id: string) => `/employee-documents/${id}/download`,
    verify: (id: string) => `/employee-documents/${id}/verify`,
    reject: (id: string) => `/employee-documents/${id}/reject`,
    restore: (id: string) => `/employee-documents/${id}/restore`,
    byEmployee: (employeeId: string) => `/employee-documents/employee/${employeeId}`,
    employeeSummary: (employeeId: string) => `/employee-documents/employee/${employeeId}/summary`,
  },
  attendance: {
    root: '/attendance',
    create: '/attendance/create-attendance',
    deleted: '/attendance/deleted',
    detail: (id: string) => `/attendance/${id}`,
    restore: (id: string) => `/attendance/${id}/restore`,
  },
  leave: {
    root: '/leave',
    create: '/leave/create-leave',
    deleted: '/leave/deleted',
    detail: (id: string) => `/leave/${id}`,
    approve: (id: string) => `/leave/${id}/approve`,
    restore: (id: string) => `/leave/${id}/restore`,
    balance: (employeeId: string) => `/leave/balance/${employeeId}`,
  },
  masterData: {
    companies: '/companies',
    branches: '/branches',
    majorDepartments: '/major-departments',
    departments: '/departments',
    designations: '/designations',
    companyBankAccounts: '/company-bank-accounts',
  },
  payroll: {
    root: '/payroll',
    generate: '/payroll/generate',
    deleted: '/payroll/deleted',
    detail: (id: string) => `/payroll/${id}`,
    restore: (id: string) => `/payroll/${id}/restore`,
    process: (id: string) => `/payroll/${id}/process`,
    approve: (id: string) => `/payroll/${id}/approve`,
    lock: (id: string) => `/payroll/${id}/lock`,
  },
  salaryStructures: {
    root: '/salary-structure',
    create: '/salary-structure/create',
    deleted: '/salary-structure/deleted',
    history: (employeeId: string) => `/salary-structure/history/${employeeId}`,
    detail: (id: string) => `/salary-structure/${id}`,
    restore: (id: string) => `/salary-structure/${id}/restore`,
  },
  salarySheets: {
    root: '/salary-sheets',
    generate: '/salary-sheets/generate',
    summary: '/salary-sheets/summary',
    deleted: '/salary-sheets/deleted',
    detail: (id: string) => `/salary-sheets/${id}`,
    restore: (id: string) => `/salary-sheets/${id}/restore`,
    process: (id: string) => `/salary-sheets/${id}/process`,
    approve: (id: string) => `/salary-sheets/${id}/approve`,
    lock: (id: string) => `/salary-sheets/${id}/lock`,
    unlock: (id: string) => `/salary-sheets/${id}/unlock`,
    bulkProcess: '/salary-sheets/bulk/process',
    bulkApprove: '/salary-sheets/bulk/approve',
    bulkLock: '/salary-sheets/bulk/lock',
    bulkUnlock: '/salary-sheets/bulk/unlock',
  },
  salaryStatements: {
    root: '/salary-statements',
    generate: '/salary-statements/generate',
    summary: '/salary-statements/summary',
    deleted: '/salary-statements/deleted',
    detail: (id: string) => `/salary-statements/${id}`,
    restore: (id: string) => `/salary-statements/${id}/restore`,
    process: (id: string) => `/salary-statements/${id}/process`,
    approve: (id: string) => `/salary-statements/${id}/approve`,
    lock: (id: string) => `/salary-statements/${id}/lock`,
    unlock: (id: string) => `/salary-statements/${id}/unlock`,
    bulkProcess: '/salary-statements/bulk/process',
    bulkApprove: '/salary-statements/bulk/approve',
    bulkLock: '/salary-statements/bulk/lock',
    bulkUnlock: '/salary-statements/bulk/unlock',
  },
  salaryPaymentDistributions: {
    root: '/salary-payment-distributions',
    generate: '/salary-payment-distributions/generate',
    summary: '/salary-payment-distributions/summary',
    deleted: '/salary-payment-distributions/deleted',
    detail: (id: string) => `/salary-payment-distributions/${id}`,
    restore: (id: string) => `/salary-payment-distributions/${id}/restore`,
    process: (id: string) => `/salary-payment-distributions/${id}/process`,
    approve: (id: string) => `/salary-payment-distributions/${id}/approve`,
    lock: (id: string) => `/salary-payment-distributions/${id}/lock`,
    unlock: (id: string) => `/salary-payment-distributions/${id}/unlock`,
    bulkProcess: '/salary-payment-distributions/bulk/process',
    bulkApprove: '/salary-payment-distributions/bulk/approve',
    bulkLock: '/salary-payment-distributions/bulk/lock',
    bulkUnlock: '/salary-payment-distributions/bulk/unlock',
    exportPreview: '/salary-payment-distributions/export/preview',
    exportCsv: '/salary-payment-distributions/export/csv',
    exportExcel: '/salary-payment-distributions/export/excel',
    exportPdf: '/salary-payment-distributions/export/pdf',
  },
  payrollReports: {
    payslip: (employeeId: string) => `/payroll-reports/payslip/${employeeId}`,
    payslipPdf: (employeeId: string) => `/payroll-reports/payslip/${employeeId}/pdf`,
    monthlyReport: '/payroll-reports/monthly-report',
    monthlyReportExportCsv: '/payroll-reports/monthly-report/export/csv',
    monthlyReportExportExcel: '/payroll-reports/monthly-report/export/excel',
  },
  reports: {
    reportCenterCatalog: '/report-center/catalog',
    reportCenterDashboard: '/report-center/dashboard',
    reportCenterReadiness: '/report-center/readiness',
    monthEndProcessControlStatus: '/month-end-process-control/status',
    rbacAuditSummary: '/rbac-audit/summary',
    rbacAuditCoverage: '/rbac-audit/coverage',
    monthlyPayrollReport: '/payroll-reports/monthly-report',
    salaryBankSheetPreview: '/bank-sheets/salary/preview',
    salaryBankSheetExportExcel: '/bank-sheets/salary/export/excel',
    salaryBankSheetExportPdf: '/bank-sheets/salary/export/pdf',
  },
  auditLogs: {
    root: '/audit-logs',
    summary: '/audit-logs/summary',
    timeline: '/audit-logs/timeline',
    filterOptions: '/audit-logs/filter-options',
    sensitive: '/audit-logs/sensitive',
    detail: (id: string) => `/audit-logs/${id}`,
    entity: (entityId: string) => `/audit-logs/entity/${entityId}`,
  },
  rbacAudit: {
    summary: '/rbac-audit/summary',
    modules: '/rbac-audit/modules',
    permissions: '/rbac-audit/permissions',
    roles: '/rbac-audit/roles',
    matrix: '/rbac-audit/matrix',
    coverage: '/rbac-audit/coverage',
    routeCoverage: '/rbac-audit/route-coverage',
  },
  salarySummary: {
    preview: '/salary-summary/preview',
    exportCsv: '/salary-summary/export/csv',
    exportExcel: '/salary-summary/export/excel',
    exportPdf: '/salary-summary/export/pdf',
  },
  legacySalaryImports: {
    root: '/legacy-salary-imports',
    templateCsv: '/legacy-salary-imports/template/csv',
    templateExcel: '/legacy-salary-imports/template/excel',
    parseExcel: '/legacy-salary-imports/parse-excel',
    preview: '/legacy-salary-imports/preview',
    commit: '/legacy-salary-imports/commit',
    deleted: '/legacy-salary-imports/deleted',
    records: '/legacy-salary-imports/records',
    summary: '/legacy-salary-imports/summary',
    exportCsv: '/legacy-salary-imports/records/export/csv',
    exportExcel: '/legacy-salary-imports/records/export/excel',
    detail: (id: string) => `/legacy-salary-imports/${id}`,
    restore: (id: string) => `/legacy-salary-imports/${id}/restore`,
  },
} as const

export type ApiRouteMap = typeof apiRoutes

export type ReportQueryParams = {
  company?: string
  month?: number | string
  year?: number | string
}

export const buildQueryString = (params: Record<string, string | number | boolean | null | undefined>) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })

  const value = query.toString()
  return value ? `?${value}` : ''
}

export const buildReportRoute = (path: string, params: ReportQueryParams) => {
  return `${path}${buildQueryString(params)}`
}
