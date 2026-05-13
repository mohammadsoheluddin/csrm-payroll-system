import { create } from 'zustand'

import type { Permission } from '@/config/permissions'
import { canUserAccess, getUserPermissions, type PermissionMode } from '@/lib/auth/permission.utils'
import type { AuthStatus, AuthUser } from '@/types/auth.types'

export type AuthState = {
  accessToken: string | null
  user: AuthUser | null
  status: AuthStatus
  setChecking: () => void
  setAccessToken: (accessToken: string | null) => void
  setAuthenticated: (payload: { accessToken: string; user: AuthUser }) => void
  setUnauthenticated: () => void
  clearAuth: () => void
  getPermissions: () => Permission[]
  canAccess: (requiredPermissions?: Permission[], mode?: PermissionMode) => boolean
  canAccessAny: (requiredPermissions?: Permission[]) => boolean
  canAccessAll: (requiredPermissions?: Permission[]) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  status: 'checking',

  setChecking: () => set({ status: 'checking' }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setAuthenticated: ({ accessToken, user }) =>
    set({
      accessToken,
      user,
      status: 'authenticated',
    }),

  setUnauthenticated: () =>
    set({
      accessToken: null,
      user: null,
      status: 'unauthenticated',
    }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      status: 'unauthenticated',
    }),

  getPermissions: () => getUserPermissions(get().user),

  canAccess: (requiredPermissions = [], mode = 'all') => {
    return canUserAccess(get().user, requiredPermissions, mode)
  },

  canAccessAny: (requiredPermissions = []) => {
    return canUserAccess(get().user, requiredPermissions, 'any')
  },

  canAccessAll: (requiredPermissions = []) => {
    return canUserAccess(get().user, requiredPermissions, 'all')
  },
}))
