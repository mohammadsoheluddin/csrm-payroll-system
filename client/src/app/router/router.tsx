import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { routePaths } from '@/config/routePaths'
import { getMasterDataModuleByPath } from '@/features/master-data/config/masterData.config'
import { payrollWorkflowModules } from '@/features/payroll/config/payrollWorkflow.config'

import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { RouteLoadingFallback } from './RouteLoadingFallback'
import { appRouteConfig, type AppRouteConfigItem } from './routeConfig'
import { withRouteSuspense } from './lazyRoute'
import { DashboardPrefixRedirect } from './DashboardPrefixRedirect'

import {
  AttendanceRegisterPage,
  AuditLogsPage,
  BankSheetsPage,
  DashboardPage,
  EmployeeDirectoryPage,
  EmployeeDocumentUploadPage,
  EmployeeProfilePage,
  ForbiddenPage,
  LeaveApplicationsPage,
  LegacySalaryImportPage,
  LoginPage,
  MasterDataFoundationPage,
  ModulePlaceholderPage,
  MonthEndControlPage,
  NotFoundPage,
  PayrollRunPage,
  PayrollWorkflowPage,
  RbacAuditPage,
  ReportCenterPage,
  ReportLayoutStandardsPage,
  SalaryStructuresPage,
  SalarySummaryReportPage,
  SessionExpiredPage,
  ThemeSettingsPage,
} from './lazyPages'

const routeFallback = (routeTitle: string) => (
  <RouteLoadingFallback
    title={`Loading ${routeTitle}`}
    message="This module is loaded only when needed to keep the first screen fast."
  />
)

const protectedElement = (route: AppRouteConfigItem, child: ReactNode) => (
  <ProtectedRoute requiredPermissions={route.requiredPermissions}>
    {withRouteSuspense(child, routeFallback(route.shortTitle ?? route.title))}
  </ProtectedRoute>
)

const appRoutes = appRouteConfig.map((route) => {
  if (route.path === routePaths.dashboard) {
    return {
      path: route.path,
      element: protectedElement(route, <DashboardPage />),
    }
  }

  if (route.path === routePaths.themeSettings) {
    return {
      path: route.path,
      element: protectedElement(route, <ThemeSettingsPage />),
    }
  }

  if (route.path === routePaths.employees) {
    return {
      path: route.path,
      element: protectedElement(route, <EmployeeDirectoryPage />),
    }
  }

  if (route.path === routePaths.employeeProfile) {
    return {
      path: route.path,
      element: protectedElement(route, <EmployeeProfilePage />),
    }
  }

  if (route.path === routePaths.employeeDocuments) {
    return {
      path: route.path,
      element: protectedElement(route, <EmployeeDocumentUploadPage />),
    }
  }

  if (route.path === routePaths.attendance) {
    return {
      path: route.path,
      element: protectedElement(route, <AttendanceRegisterPage />),
    }
  }

  if (route.path === routePaths.leave) {
    return {
      path: route.path,
      element: protectedElement(route, <LeaveApplicationsPage />),
    }
  }

  if (route.path === routePaths.payroll) {
    return {
      path: route.path,
      element: protectedElement(route, <PayrollRunPage />),
    }
  }

  if (route.path === routePaths.salaryStructures) {
    return {
      path: route.path,
      element: protectedElement(route, <SalaryStructuresPage />),
    }
  }

  if (route.path === routePaths.salarySheets) {
    return {
      path: route.path,
      element: protectedElement(route, <PayrollWorkflowPage module={payrollWorkflowModules.salarySheets} />),
    }
  }

  if (route.path === routePaths.salaryStatements) {
    return {
      path: route.path,
      element: protectedElement(route, <PayrollWorkflowPage module={payrollWorkflowModules.salaryStatements} />),
    }
  }

  if (route.path === routePaths.salaryPaymentDistributions) {
    return {
      path: route.path,
      element: protectedElement(route, <PayrollWorkflowPage module={payrollWorkflowModules.salaryPaymentDistributions} />),
    }
  }

  if (route.path === routePaths.legacySalaryImports) {
    return {
      path: route.path,
      element: protectedElement(route, <LegacySalaryImportPage />),
    }
  }

  if (route.path === routePaths.bankSheets) {
    return {
      path: route.path,
      element: protectedElement(route, <BankSheetsPage />),
    }
  }

  if (route.path === routePaths.reportCenter) {
    return {
      path: route.path,
      element: protectedElement(route, <ReportCenterPage />),
    }
  }

  if (route.path === routePaths.salarySummary) {
    return {
      path: route.path,
      element: protectedElement(route, <SalarySummaryReportPage />),
    }
  }

  if (route.path === routePaths.reportLayoutStandards) {
    return {
      path: route.path,
      element: protectedElement(route, <ReportLayoutStandardsPage />),
    }
  }

  if (route.path === routePaths.monthEndControl) {
    return {
      path: route.path,
      element: protectedElement(route, <MonthEndControlPage />),
    }
  }

  if (route.path === routePaths.auditLogs) {
    return {
      path: route.path,
      element: protectedElement(route, <AuditLogsPage />),
    }
  }

  if (route.path === routePaths.rbacAudit) {
    return {
      path: route.path,
      element: protectedElement(route, <RbacAuditPage />),
    }
  }

  const masterDataModule = getMasterDataModuleByPath(route.path)

  if (masterDataModule) {
    return {
      path: route.path,
      element: protectedElement(route, <MasterDataFoundationPage module={masterDataModule} />),
    }
  }

  return {
    path: route.path,
    element: protectedElement(route, <ModulePlaceholderPage route={route} />),
  }
})

export const router = createBrowserRouter([
  {
    path: routePaths.root,
    element: <Navigate to={routePaths.dashboard} replace />,
  },
  {
    path: routePaths.login,
    element: (
      <PublicOnlyRoute>
        {withRouteSuspense(<LoginPage />, routeFallback('Login'))}
      </PublicOnlyRoute>
    ),
  },
  {
    path: routePaths.sessionExpired,
    element: withRouteSuspense(<SessionExpiredPage />, routeFallback('Session Expired')),
  },
  {
    path: routePaths.forbidden,
    element: withRouteSuspense(<ForbiddenPage />, routeFallback('Forbidden')),
  },
  {
    path: `${routePaths.dashboard}/:firstSegment/*`,
    element: <DashboardPrefixRedirect />,
  },
  {
    element: <AppLayout />,
    children: appRoutes,
  },
  {
    path: '*',
    element: withRouteSuspense(<NotFoundPage />, routeFallback('Page Not Found')),
  },
])
