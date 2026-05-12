import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { LoadingState } from '@/components/feedback/LoadingState'
import { routePaths } from '@/config/routePaths'
import { useAuthStore } from '@/stores/auth.store'

export const PublicOnlyRoute = ({ children }: PropsWithChildren) => {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const from = location.state?.from as string | undefined

  if (status === 'checking') {
    return <LoadingState title="Checking session" message="Please wait while we verify your login session." />
  }

  if (status === 'authenticated') {
    return <Navigate to={from ?? routePaths.dashboard} replace />
  }

  return <>{children}</>
}
