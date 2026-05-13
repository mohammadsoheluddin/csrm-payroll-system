import {
  getRolePermissions,
  hasAllPermissions,
  hasAnyPermission,
  type Permission,
} from '@/config/permissions'
import type { UserRole } from '@/config/roles'
import type { AuthUser } from '@/types/auth.types'

export type PermissionMode = 'all' | 'any'

export const getUserPermissions = (user: AuthUser | null | undefined): Permission[] => {
  return getRolePermissions(user?.role)
}

export const canUserAccess = (
  user: AuthUser | null | undefined,
  requiredPermissions: Permission[] = [],
  mode: PermissionMode = 'all',
) => {
  if (mode === 'any') {
    return hasAnyPermission(user?.role, requiredPermissions)
  }

  return hasAllPermissions(user?.role, requiredPermissions)
}

export const canRoleAccess = (
  role: UserRole | string | undefined,
  requiredPermissions: Permission[] = [],
  mode: PermissionMode = 'all',
) => {
  if (mode === 'any') {
    return hasAnyPermission(role, requiredPermissions)
  }

  return hasAllPermissions(role, requiredPermissions)
}
