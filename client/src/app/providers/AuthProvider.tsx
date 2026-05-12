import { useEffect } from 'react'
import type { PropsWithChildren } from 'react'

import { getMyProfile, refreshAccessToken } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const setChecking = useAuthStore((state) => state.setChecking)
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)

  useEffect(() => {
    let isMounted = true

    const bootstrapAuth = async () => {
      setChecking()

      try {
        const accessToken = await refreshAccessToken()

        if (!isMounted) {
          return
        }

        setAccessToken(accessToken)

        const user = await getMyProfile()

        if (!isMounted) {
          return
        }

        setAuthenticated({ accessToken, user })
      } catch {
        if (!isMounted) {
          return
        }

        setUnauthenticated()
      }
    }

    void bootstrapAuth()

    return () => {
      isMounted = false
    }
  }, [setChecking, setAccessToken, setAuthenticated, setUnauthenticated])

  return <>{children}</>
}
