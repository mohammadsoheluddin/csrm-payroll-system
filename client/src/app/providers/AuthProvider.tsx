import { useEffect, useRef } from 'react'
import type { PropsWithChildren } from 'react'

import { getMyProfile, refreshAccessToken } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const hasBootstrapped = useRef(false)
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)

  useEffect(() => {
    if (hasBootstrapped.current) {
      return
    }

    hasBootstrapped.current = true
    let isActive = true

    const bootstrapAuth = async () => {
      try {
        const accessToken = await refreshAccessToken()
        setAccessToken(accessToken)
        const user = await getMyProfile()

        if (!isActive) {
          return
        }

        setAuthenticated({ accessToken, user })
      } catch {
        if (!isActive) {
          return
        }

        setUnauthenticated()
      }
    }

    void bootstrapAuth()

    return () => {
      isActive = false
    }
  }, [setAccessToken, setAuthenticated, setUnauthenticated])

  return <>{children}</>
}
