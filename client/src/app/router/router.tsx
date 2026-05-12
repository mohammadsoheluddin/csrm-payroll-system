import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { routePaths } from '@/config/routePaths'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
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
