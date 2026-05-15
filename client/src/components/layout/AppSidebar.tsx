import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { preloadRoute } from '@/app/router/routePreloaders'
import { getVisibleSidebarGroups, sidebarExpandIcon } from '@/config/sidebar.config'
import type { SidebarItem } from '@/config/sidebar.config'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/stores/auth.store'
import { useLayoutStore } from '@/stores/layout.store'

const ExpandIcon = sidebarExpandIcon

const isItemActive = (pathname: string, item: SidebarItem) => {
  if (item.href && pathname === item.href) {
    return true
  }

  return item.children?.some((child) => pathname === child.href) ?? false
}

type SidebarNavItemProps = {
  item: SidebarItem
  isCollapsed: boolean
  onNavigate?: () => void
}

const SidebarNavItem = ({ item, isCollapsed, onNavigate }: SidebarNavItemProps) => {
  const location = useLocation()
  const Icon = item.icon
  const isActive = isItemActive(location.pathname, item)

  if (item.href) {
    return (
      <NavLink
        to={item.href}
        onMouseEnter={() => preloadRoute(item.href)}
        onFocus={() => preloadRoute(item.href)}
        onClick={onNavigate}
        className={({ isActive: isLinkActive }) =>
          cn(
            'group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
            'text-sidebar-foreground/88 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm',
            (isLinkActive || isActive) &&
              'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-primary',
            isCollapsed && 'justify-center px-2 before:hidden',
          )
        }
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="h-4.5 w-4.5 shrink-0 transition group-hover:scale-105" />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    )
  }

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-sidebar-foreground transition-colors',
          isActive && 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm',
          isCollapsed && 'justify-center px-2',
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="h-4.5 w-4.5 shrink-0" />
        {!isCollapsed && (
          <>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <ExpandIcon className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isActive && 'rotate-90')} />
          </>
        )}
      </div>

      {!isCollapsed && item.children && (
        <div className="ml-4 space-y-1 border-l border-sidebar-border/80 pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.href}
              to={child.href}
              onMouseEnter={() => preloadRoute(child.href)}
              onFocus={() => preloadRoute(child.href)}
              onClick={onNavigate}
              className={({ isActive: isChildActive }) =>
                cn(
                  'group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
                  'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isChildActive && 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm',
                )
              }
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-45 transition group-hover:opacity-100" />
              <span className="min-w-0 flex-1 truncate">{child.label}</span>
              {child.badge && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/20">
                  {child.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

type SidebarContentProps = {
  onNavigate?: () => void
}

export const SidebarContent = ({ onNavigate }: SidebarContentProps) => {
  const isSidebarCollapsed = useLayoutStore((state) => state.isSidebarCollapsed)
  const userRole = useAuthStore((state) => state.user?.role)
  const groups = getVisibleSidebarGroups(userRole)

  return (
    <div className="flex h-full flex-col">
      <div className={cn('border-b border-sidebar-border/80 px-5 py-5', isSidebarCollapsed && 'px-3')}>
        <div className={cn('flex items-center gap-3', isSidebarCollapsed && 'justify-center')}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/10">
            CP
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sidebar-muted">
                CSRM
              </p>
              <h2 className="truncate text-lg font-black tracking-tight">Payroll & HR</h2>
            </div>
          )}
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4 [scrollbar-gutter:stable]">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {!isSidebarCollapsed && (
              <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-muted/90">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.href ?? item.label}
                  item={item}
                  isCollapsed={isSidebarCollapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

export const AppSidebar = () => {
  const isSidebarCollapsed = useLayoutStore((state) => state.isSidebarCollapsed)
  const toggleSidebarCollapsed = useLayoutStore((state) => state.toggleSidebarCollapsed)

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground shadow-2xl shadow-foreground/10 transition-[width] duration-300 ease-out lg:block',
        isSidebarCollapsed ? 'w-20' : 'w-76',
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/7 to-transparent" />
      <SidebarContent />
      <div className="absolute -right-4 top-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className="h-8 w-8 rounded-full bg-card shadow-lg"
          aria-label="Toggle sidebar"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
