import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
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
        onClick={onNavigate}
        className={({ isActive: isLinkActive }) =>
          cn(
            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            (isLinkActive || isActive) && 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm',
            isCollapsed && 'justify-center px-2',
          )
        }
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    )
  }

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-sidebar-foreground',
          isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
          isCollapsed && 'justify-center px-2',
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <ExpandIcon className={cn('h-4 w-4 shrink-0 transition', isActive && 'rotate-90')} />
          </>
        )}
      </div>

      {!isCollapsed && item.children && (
        <div className="ml-4 space-y-1 border-l border-sidebar-border pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.href}
              to={child.href}
              onClick={onNavigate}
              className={({ isActive: isChildActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition',
                  'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isChildActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                )
              }
            >
              <span className="min-w-0 flex-1 truncate">{child.label}</span>
              {child.badge && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
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
      <div className={cn('border-b border-sidebar-border px-5 py-5', isSidebarCollapsed && 'px-3')}>
        <div className={cn('flex items-center gap-3', isSidebarCollapsed && 'justify-center')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            CP
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sidebar-muted">
                CSRM
              </p>
              <h2 className="truncate text-lg font-bold tracking-tight">Payroll & HR</h2>
            </div>
          )}
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {!isSidebarCollapsed && (
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted">
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
        'sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 lg:block',
        isSidebarCollapsed ? 'w-20' : 'w-76',
      )}
    >
      <SidebarContent />
      <div className="absolute -right-4 top-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className="h-8 w-8 rounded-full bg-card shadow-md"
          aria-label="Toggle sidebar"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
