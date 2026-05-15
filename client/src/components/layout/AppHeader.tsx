import {
  Bell,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  UserCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { AppBreadcrumbs } from '@/components/navigation/AppBreadcrumbs'
import { Button } from '@/components/ui/Button'
import { routePaths } from '@/config/routePaths'
import { logoutUser } from '@/features/auth/api/auth.api'
import { getCurrentRouteMeta, getDashboardRouteMeta } from '@/lib/router/routeLookup'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/stores/auth.store'
import { useLayoutStore } from '@/stores/layout.store'
import { themeModes, useThemeStore } from '@/stores/theme.store'
import type { ThemeMode } from '@/stores/theme.store'

const themeIconMap: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export const AppHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const openMobileSidebar = useLayoutStore((state) => state.openMobileSidebar)
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const routeMeta = getCurrentRouteMeta(location.pathname) ?? getDashboardRouteMeta()
  const ActiveThemeIcon = themeIconMap[theme]

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await logoutUser()
      toast.success('Logged out successfully')
    } catch {
      toast.warning('Local session cleared. Please login again if needed.')
    } finally {
      clearAuth()
      setIsLoggingOut(false)
      navigate(routePaths.login, { replace: true })
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/78 px-3 py-2.5 shadow-sm shadow-foreground/[0.03] backdrop-blur-2xl sm:px-4 lg:px-6 xl:px-8">
      <div className="flex items-center justify-between gap-3 lg:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={openMobileSidebar}
            className="h-9 w-9 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <div className="hidden sm:block">
              <AppBreadcrumbs />
            </div>
            <div className="flex min-w-0 items-center gap-2 sm:mt-1">
              <h1 className="truncate text-base font-bold tracking-tight text-foreground sm:text-xl">
                {routeMeta.title}
              </h1>
              {location.pathname === routePaths.dashboard && (
                <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary ring-1 ring-primary/15 md:inline-flex">
                  ERP Foundation
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center 2xl:flex">
          <div className="csrm-glass-surface flex w-full max-w-lg items-center gap-2 rounded-2xl px-3.5 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Search employee, report, payroll, module</span>
            <span className="ml-auto rounded-lg bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              CTRL K
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center rounded-2xl border border-border/80 bg-card/80 p-1 shadow-sm backdrop-blur-xl md:flex">
            {themeModes.map((mode) => {
              const Icon = themeIconMap[mode]
              const isActive = theme === mode

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold capitalize transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  aria-label={`Set ${mode} theme`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {mode}
                </button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 md:hidden"
            aria-label="Toggle theme"
          >
            <ActiveThemeIcon className="h-4.5 w-4.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            aria-label="Notifications placeholder"
          >
            <Bell className="h-4.5 w-4.5" />
          </Button>

          <div className="hidden max-w-[230px] items-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-3 py-2 shadow-sm backdrop-blur-xl lg:flex">
            <UserCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-foreground">
                {user?.name ?? 'Logged in user'}
              </p>
              <p className="truncate text-[11px] capitalize text-muted-foreground">
                {user?.role?.replaceAll('_', ' ') ?? 'role'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="h-9 w-9"
            aria-label="Logout"
          >
            <LogOut className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
