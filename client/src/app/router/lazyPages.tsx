import { lazy } from 'react'

export const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
export const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
export const ThemeSettingsPage = lazy(() =>
  import('@/features/settings/ThemeSettingsPage').then((module) => ({ default: module.ThemeSettingsPage })),
)
export const EmployeeDirectoryPage = lazy(() =>
  import('@/features/employees/pages/EmployeeDirectoryPage').then((module) => ({ default: module.EmployeeDirectoryPage })),
)
export const EmployeeDocumentUploadPage = lazy(() =>
  import('@/features/employees/employee-documents/pages/EmployeeDocumentUploadPage').then((module) => ({
    default: module.EmployeeDocumentUploadPage,
  })),
)
export const EmployeeProfilePage = lazy(() =>
  import('@/features/employees/employee-profile/pages/EmployeeProfilePage').then((module) => ({
    default: module.EmployeeProfilePage,
  })),
)
export const AttendanceRegisterPage = lazy(() =>
  import('@/features/attendance-leave/pages/AttendanceRegisterPage').then((module) => ({ default: module.AttendanceRegisterPage })),
)
export const LeaveApplicationsPage = lazy(() =>
  import('@/features/attendance-leave/pages/LeaveApplicationsPage').then((module) => ({ default: module.LeaveApplicationsPage })),
)
export const PayrollRunPage = lazy(() =>
  import('@/features/payroll/pages/PayrollRunPage').then((module) => ({ default: module.PayrollRunPage })),
)
export const LegacySalaryImportPage = lazy(() =>
  import('@/features/legacy-salary-import/pages/LegacySalaryImportPage').then((module) => ({ default: module.LegacySalaryImportPage })),
)
export const SalaryStructuresPage = lazy(() =>
  import('@/features/payroll/pages/SalaryStructuresPage').then((module) => ({ default: module.SalaryStructuresPage })),
)
export const PayrollWorkflowPage = lazy(() =>
  import('@/features/payroll/pages/PayrollWorkflowPage').then((module) => ({ default: module.PayrollWorkflowPage })),
)
export const BankSheetsPage = lazy(() =>
  import('@/features/reports/pages/BankSheetsPage').then((module) => ({ default: module.BankSheetsPage })),
)
export const MonthEndControlPage = lazy(() =>
  import('@/features/reports/pages/MonthEndControlPage').then((module) => ({ default: module.MonthEndControlPage })),
)
export const ReportCenterPage = lazy(() =>
  import('@/features/reports/pages/ReportCenterPage').then((module) => ({ default: module.ReportCenterPage })),
)
export const ReportLayoutStandardsPage = lazy(() =>
  import('@/features/reports/pages/ReportLayoutStandardsPage').then((module) => ({ default: module.ReportLayoutStandardsPage })),
)
export const SalarySummaryReportPage = lazy(() =>
  import('@/features/reports/pages/SalarySummaryReportPage').then((module) => ({ default: module.SalarySummaryReportPage })),
)
export const AuditLogsPage = lazy(() =>
  import('@/features/audit/pages/AuditLogsPage').then((module) => ({ default: module.AuditLogsPage })),
)
export const RbacAuditPage = lazy(() =>
  import('@/features/audit/pages/RbacAuditPage').then((module) => ({ default: module.RbacAuditPage })),
)
export const MasterDataFoundationPage = lazy(() =>
  import('@/features/master-data/pages/MasterDataFoundationPage').then((module) => ({ default: module.MasterDataFoundationPage })),
)
export const ModulePlaceholderPage = lazy(() =>
  import('@/features/system/pages/ModulePlaceholderPage').then((module) => ({ default: module.ModulePlaceholderPage })),
)
export const ForbiddenPage = lazy(() =>
  import('@/features/system/pages/ForbiddenPage').then((module) => ({ default: module.ForbiddenPage })),
)
export const NotFoundPage = lazy(() =>
  import('@/features/system/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)
export const SessionExpiredPage = lazy(() =>
  import('@/features/system/pages/SessionExpiredPage').then((module) => ({ default: module.SessionExpiredPage })),
)
