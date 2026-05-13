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
  reports: {
    reportCenterCatalog: '/report-center/catalog',
    reportCenterDashboard: '/report-center/dashboard',
    reportCenterReadiness: '/report-center/readiness',
    monthEndProcessControlStatus: '/month-end-process-control/status',
    rbacAuditSummary: '/rbac-audit/summary',
    rbacAuditCoverage: '/rbac-audit/coverage',
    monthlyPayrollReport: '/payroll-reports/monthly-report',
    salaryBankSheetPreview: '/bank-sheets/salary/preview',
  },
  salarySummary: {
    preview: '/salary-summary/preview',
    exportCsv: '/salary-summary/export/csv',
    exportExcel: '/salary-summary/export/excel',
    exportPdf: '/salary-summary/export/pdf',
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
