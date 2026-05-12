import { appRouteConfig, getRouteConfigByPath } from '@/app/router/routeConfig'
import { routePaths } from '@/config/routePaths'

export const getCurrentRouteMeta = (pathname: string) => {
  return getRouteConfigByPath(pathname)
}

export const getDashboardRouteMeta = () => {
  return getRouteConfigByPath(routePaths.dashboard) ?? appRouteConfig[0]
}
