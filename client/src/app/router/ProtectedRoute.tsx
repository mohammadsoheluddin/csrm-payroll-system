import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { LoadingState } from '@/components/feedback/LoadingState'
import type { Permission } from '@/config/permissions'
import { routePaths } from '@/config/routePaths'
import { useAuthStore } from '@/stores/auth.store'

export type ProtectedRouteProps = PropsWithChildren<{
  requiredPermissions?: Permission[]
}>

export const ProtectedRoute = ({ children, requiredPermissions }: ProtectedRouteProps) => {
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

  if (!canAccess(requiredPermissions)) {
    return <Navigate to={routePaths.forbidden} replace />
  }

  return <>{children}</>
}
