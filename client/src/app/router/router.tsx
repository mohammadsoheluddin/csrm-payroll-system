import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { routePaths } from '@/config/routePaths'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { AttendanceRegisterPage } from '@/features/attendance-leave/pages/AttendanceRegisterPage'
import { LeaveApplicationsPage } from '@/features/attendance-leave/pages/LeaveApplicationsPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { getMasterDataModuleByPath } from '@/features/master-data/config/masterData.config'
import { EmployeeDirectoryPage } from '@/features/employees/pages/EmployeeDirectoryPage'
import { MasterDataFoundationPage } from '@/features/master-data/pages/MasterDataFoundationPage'
import { PayrollRunPage } from '@/features/payroll/pages/PayrollRunPage'
import { SalaryStructuresPage } from '@/features/payroll/pages/SalaryStructuresPage'
import { PayrollWorkflowPage } from '@/features/payroll/pages/PayrollWorkflowPage'
import { payrollWorkflowModules } from '@/features/payroll/config/payrollWorkflow.config'
import { ThemeSettingsPage } from '@/features/settings/ThemeSettingsPage'
import { ForbiddenPage } from '@/features/system/pages/ForbiddenPage'
import { ModulePlaceholderPage } from '@/features/system/pages/ModulePlaceholderPage'
import { NotFoundPage } from '@/features/system/pages/NotFoundPage'
import { SessionExpiredPage } from '@/features/system/pages/SessionExpiredPage'

import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { appRouteConfig } from './routeConfig'

const appRoutes = appRouteConfig.map((route) => {
  if (route.path === routePaths.dashboard) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <DashboardPage />
        </ProtectedRoute>
      ),
    }
  }

  if (route.path === routePaths.themeSettings) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <ThemeSettingsPage />
        </ProtectedRoute>
      ),
    }
  }


  if (route.path === routePaths.employees) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <EmployeeDirectoryPage />
        </ProtectedRoute>
      ),
    }
  }

  if (route.path === routePaths.attendance) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <AttendanceRegisterPage />
        </ProtectedRoute>
      ),
    }
  }

  if (route.path === routePaths.leave) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <LeaveApplicationsPage />
        </ProtectedRoute>
      ),
    }
  }


  if (route.path === routePaths.payroll) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <PayrollRunPage />
        </ProtectedRoute>
      ),
    }
  }

  if (route.path === routePaths.salaryStructures) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <SalaryStructuresPage />
        </ProtectedRoute>
      ),
    }
  }

  if (route.path === routePaths.salarySheets) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <PayrollWorkflowPage module={payrollWorkflowModules.salarySheets} />
        </ProtectedRoute>
      ),
    }
  }

  if (route.path === routePaths.salaryStatements) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <PayrollWorkflowPage module={payrollWorkflowModules.salaryStatements} />
        </ProtectedRoute>
      ),
    }
  }

  if (route.path === routePaths.salaryPaymentDistributions) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <PayrollWorkflowPage module={payrollWorkflowModules.salaryPaymentDistributions} />
        </ProtectedRoute>
      ),
    }
  }

  const masterDataModule = getMasterDataModuleByPath(route.path)

  if (masterDataModule) {
    return {
      path: route.path,
      element: (
        <ProtectedRoute requiredPermissions={route.requiredPermissions}>
          <MasterDataFoundationPage module={masterDataModule} />
        </ProtectedRoute>
      ),
    }
  }

  return {
    path: route.path,
    element: (
      <ProtectedRoute requiredPermissions={route.requiredPermissions}>
        <ModulePlaceholderPage route={route} />
      </ProtectedRoute>
    ),
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
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: routePaths.sessionExpired,
    element: <SessionExpiredPage />,
  },
  {
    path: routePaths.forbidden,
    element: <ForbiddenPage />,
  },
  {
    element: <AppLayout />,
    children: appRoutes,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
