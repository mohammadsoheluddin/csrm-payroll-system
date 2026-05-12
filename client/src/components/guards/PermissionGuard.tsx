import type { PropsWithChildren } from 'react'

export type PermissionGuardProps = PropsWithChildren<{
  requiredPermissions?: string[]
  fallback?: React.ReactNode
}>

export const PermissionGuard = ({ children }: PermissionGuardProps) => {
  // Part-F5 will enforce permission-wise rendering here.
  return <>{children}</>
}
