import { routePaths } from '@/config/routePaths'

const preloaders: Partial<Record<string, () => Promise<unknown>>> = {
  [routePaths.login]: () => import('@/features/auth/pages/LoginPage'),
  [routePaths.dashboard]: () => import('@/features/dashboard/pages/DashboardPage'),
  [routePaths.themeSettings]: () => import('@/features/settings/ThemeSettingsPage'),

  [routePaths.companies]: () => import('@/features/master-data/pages/MasterDataFoundationPage'),
  [routePaths.branches]: () => import('@/features/master-data/pages/MasterDataFoundationPage'),
  [routePaths.majorDepartments]: () => import('@/features/master-data/pages/MasterDataFoundationPage'),
  [routePaths.departments]: () => import('@/features/master-data/pages/MasterDataFoundationPage'),
  [routePaths.designations]: () => import('@/features/master-data/pages/MasterDataFoundationPage'),
  [routePaths.companyBankAccounts]: () => import('@/features/master-data/pages/MasterDataFoundationPage'),

  [routePaths.employees]: () => import('@/features/employees/pages/EmployeeDirectoryPage'),
  [routePaths.attendance]: () => import('@/features/attendance-leave/pages/AttendanceRegisterPage'),
  [routePaths.leave]: () => import('@/features/attendance-leave/pages/LeaveApplicationsPage'),

  [routePaths.payroll]: () => import('@/features/payroll/pages/PayrollRunPage'),
  [routePaths.salaryStructures]: () => import('@/features/payroll/pages/SalaryStructuresPage'),
  [routePaths.salarySheets]: () => import('@/features/payroll/pages/PayrollWorkflowPage'),
  [routePaths.salaryStatements]: () => import('@/features/payroll/pages/PayrollWorkflowPage'),
  [routePaths.salaryPaymentDistributions]: () => import('@/features/payroll/pages/PayrollWorkflowPage'),
  [routePaths.legacySalaryImports]: () => import('@/features/legacy-salary-import/pages/LegacySalaryImportPage'),

  [routePaths.bankSheets]: () => import('@/features/reports/pages/BankSheetsPage'),
  [routePaths.reportCenter]: () => import('@/features/reports/pages/ReportCenterPage'),
  [routePaths.salarySummary]: () => import('@/features/reports/pages/SalarySummaryReportPage'),
  [routePaths.reportLayoutStandards]: () => import('@/features/reports/pages/ReportLayoutStandardsPage'),
  [routePaths.monthEndControl]: () => import('@/features/reports/pages/MonthEndControlPage'),

  [routePaths.auditLogs]: () => import('@/features/audit/pages/AuditLogsPage'),
  [routePaths.rbacAudit]: () => import('@/features/audit/pages/RbacAuditPage'),
}

const preloadedRoutes = new Set<string>()

export const preloadRoute = (path?: string) => {
  if (!path || preloadedRoutes.has(path)) {
    return
  }

  const preloader = preloaders[path]

  if (!preloader) {
    return
  }

  preloadedRoutes.add(path)
  void preloader().catch(() => {
    preloadedRoutes.delete(path)
  })
}

export const preloadLikelyRoutesAfterLogin = () => {
  preloadRoute(routePaths.dashboard)
  preloadRoute(routePaths.employees)
  preloadRoute(routePaths.attendance)
  preloadRoute(routePaths.leave)
}
