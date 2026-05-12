import type { PropsWithChildren, ReactNode } from 'react'

import type { Permission } from '@/config/permissions'
import { useAuthStore } from '@/stores/auth.store'

export type PermissionGuardProps = PropsWithChildren<{
  requiredPermissions?: Permission[]
  fallback?: ReactNode
}>

export const PermissionGuard = ({
  children,
  requiredPermissions,
  fallback = null,
}: PermissionGuardProps) => {
  const canAccess = useAuthStore((state) => state.canAccess)

  if (!canAccess(requiredPermissions)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
