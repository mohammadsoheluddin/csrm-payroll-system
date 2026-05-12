import { routePaths } from '@/config/routePaths'

export type AppRouteConfigItem = {
  path: string
  label: string
  requiredPermissions?: string[]
}

export const appRouteConfig: AppRouteConfigItem[] = [
  {
    path: routePaths.dashboard,
    label: 'Dashboard',
  },
]
