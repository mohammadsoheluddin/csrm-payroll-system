import type { PropsWithChildren, ReactNode } from 'react'

import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import type { Permission } from '@/config/permissions'
import type { PermissionMode } from '@/lib/auth/permission.utils'
import { useAuthStore } from '@/stores/auth.store'

export type CanProps = PropsWithChildren<{
  permissions?: Permission[]
  mode?: PermissionMode
  fallback?: ReactNode
  showDefaultFallback?: boolean
}>

export const Can = ({
  children,
  permissions,
  mode = 'all',
  fallback = null,
  showDefaultFallback = false,
}: CanProps) => {
  const canAccess = useAuthStore((state) => state.canAccess)

  if (!canAccess(permissions, mode)) {
    if (showDefaultFallback) {
      return <PermissionDeniedInline />
    }

    return <>{fallback}</>
  }

  return <>{children}</>
}
