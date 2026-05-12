import { create } from 'zustand'

import { hasPermission, type Permission } from '@/config/permissions'
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
  canAccess: (requiredPermissions?: Permission[]) => boolean
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

  canAccess: (requiredPermissions = []) => {
    const user = get().user
    return hasPermission(user?.role, requiredPermissions)
  },
}))
