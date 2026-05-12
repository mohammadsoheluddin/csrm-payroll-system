import { Bell, Menu, Monitor, Moon, Search, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { AppBreadcrumbs } from '@/components/navigation/AppBreadcrumbs'
import { Button } from '@/components/ui/Button'
import { routePaths } from '@/config/routePaths'
import { getCurrentRouteMeta, getDashboardRouteMeta } from '@/lib/router/routeLookup'
import { cn } from '@/lib/utils/cn'
import { useLayoutStore } from '@/stores/layout.store'
import { themeModes, useThemeStore } from '@/stores/theme.store'
import type { ThemeMode } from '@/stores/theme.store'

const themeIconMap: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export const AppHeader = () => {
  const location = useLocation()
  const openMobileSidebar = useLayoutStore((state) => state.openMobileSidebar)
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const routeMeta = getCurrentRouteMeta(location.pathname) ?? getDashboardRouteMeta()
  const ActiveThemeIcon = themeIconMap[theme]

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={openMobileSidebar}
            className="lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <AppBreadcrumbs />
            <div className="mt-1 flex items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {routeMeta.title}
              </h1>
              {location.pathname === routePaths.dashboard && (
                <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary sm:inline-flex">
                  Frontend Foundation
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center xl:flex">
          <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
            <Search className="h-4 w-4" />
            <span className="truncate">Search placeholder — employee, report, payroll, module</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center rounded-2xl border border-border bg-card p-1 shadow-sm md:flex">
            {themeModes.map((mode) => {
              const Icon = themeIconMap[mode]
              const isActive = theme === mode

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium capitalize transition',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
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
            className="md:hidden"
            aria-label="Toggle theme"
          >
            <ActiveThemeIcon className="h-5 w-5" />
          </Button>

          <Button variant="outline" size="icon" aria-label="Notifications placeholder">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
