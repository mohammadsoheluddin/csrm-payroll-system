import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { LoadingState } from '@/components/feedback/LoadingState'
import type { Permission } from '@/config/permissions'
import { routePaths } from '@/config/routePaths'
import type { PermissionMode } from '@/lib/auth/permission.utils'
import { useAuthStore } from '@/stores/auth.store'

export type ProtectedRouteProps = PropsWithChildren<{
  requiredPermissions?: Permission[]
  mode?: PermissionMode
}>

export const ProtectedRoute = ({ children, requiredPermissions, mode = 'all' }: ProtectedRouteProps) => {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const canAccess = useAuthStore((state) => state.canAccess)

  if (status === 'checking') {
    return <LoadingState title="Checking session" message="Please wait while we verify your login session." />
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to={routePaths.login}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (!canAccess(requiredPermissions, mode)) {
    return <Navigate to={routePaths.forbidden} replace />
  }

  return <>{children}</>
}
