import type { Permission } from '@/config/permissions'
import type { UserRole } from '@/config/roles'

export type AuthUser = {
  _id: string
  name: string
  email: string
  role: UserRole
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponseData = {
  accessToken: string
}

export type RefreshTokenResponseData = {
  accessToken: string
}

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

export type PermissionCheckInput = {
  role?: UserRole | string
  requiredPermissions?: Permission[]
}
