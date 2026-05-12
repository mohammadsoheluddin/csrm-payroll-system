import type { PropsWithChildren } from 'react'

export type CanProps = PropsWithChildren<{
  permissions?: string[]
  fallback?: React.ReactNode
}>

export const Can = ({ children }: CanProps) => {
  // Part-F5 will connect this with frontend ROLE_PERMISSIONS and auth user role.
  return <>{children}</>
}
