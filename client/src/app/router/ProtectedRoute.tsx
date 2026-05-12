import type { PropsWithChildren } from 'react'

export type ProtectedRouteProps = PropsWithChildren<{
  requiredPermissions?: string[]
}>

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Part-F3 will connect this component with auth store, /users/me,
  // refresh-token handling, and permission-based redirects.
  return <>{children}</>
}
