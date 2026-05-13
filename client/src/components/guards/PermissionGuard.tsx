import type { PropsWithChildren, ReactNode } from 'react'

import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import type { Permission } from '@/config/permissions'
import type { PermissionMode } from '@/lib/auth/permission.utils'
import { useAuthStore } from '@/stores/auth.store'

export type PermissionGuardProps = PropsWithChildren<{
  requiredPermissions?: Permission[]
  mode?: PermissionMode
  fallback?: ReactNode
  showDefaultFallback?: boolean
}>

export const PermissionGuard = ({
  children,
  requiredPermissions,
  mode = 'all',
  fallback = null,
  showDefaultFallback = false,
}: PermissionGuardProps) => {
  const canAccess = useAuthStore((state) => state.canAccess)

  if (!canAccess(requiredPermissions, mode)) {
    if (showDefaultFallback) {
      return <PermissionDeniedInline />
    }

    return <>{fallback}</>
  }

  return <>{children}</>
}
