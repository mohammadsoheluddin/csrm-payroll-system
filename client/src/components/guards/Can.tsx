import type { PropsWithChildren, ReactNode } from 'react'

import type { Permission } from '@/config/permissions'
import { useAuthStore } from '@/stores/auth.store'

export type CanProps = PropsWithChildren<{
  permissions?: Permission[]
  fallback?: ReactNode
}>

export const Can = ({ children, permissions, fallback = null }: CanProps) => {
  const canAccess = useAuthStore((state) => state.canAccess)

  if (!canAccess(permissions)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
