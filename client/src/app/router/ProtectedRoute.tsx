import type { PropsWithChildren } from 'react'

import type { Permission } from '@/config/permissions'

export type ProtectedRouteProps = PropsWithChildren<{
  requiredPermissions?: Permission[]
}>

export const ProtectedRoute = ({ children, requiredPermissions }: ProtectedRouteProps) => {
  // Part-F3 will connect this with auth store, /users/me, refresh-token flow,
  // role permission checks, and 401/403 redirects.
  void requiredPermissions

  return <>{children}</>
}
