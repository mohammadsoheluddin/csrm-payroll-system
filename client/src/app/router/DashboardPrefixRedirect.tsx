import { Navigate, useLocation } from 'react-router-dom'

export const DashboardPrefixRedirect = () => {
  const { pathname, search, hash } = useLocation()
  const targetPath = pathname.replace(/^\/dashboard\//, '/')

  return <Navigate to={`${targetPath}${search}${hash}`} replace />
}
