import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { routePaths } from '@/config/routePaths'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { ForbiddenPage } from '@/features/system/pages/ForbiddenPage'
import { NotFoundPage } from '@/features/system/pages/NotFoundPage'
import { SessionExpiredPage } from '@/features/system/pages/SessionExpiredPage'

export const router = createBrowserRouter([
  {
    path: routePaths.root,
    element: <Navigate to={routePaths.dashboard} replace />,
  },
  {
    path: routePaths.login,
    element: <LoginPage />,
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
    children: [
      {
        path: routePaths.dashboard,
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
