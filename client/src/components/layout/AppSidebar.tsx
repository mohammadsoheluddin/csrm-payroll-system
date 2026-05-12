import { NavLink } from 'react-router-dom'

import { sidebarItems } from '@/config/sidebar.config'
import { cn } from '@/lib/utils/cn'

export const AppSidebar = () => {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground lg:block">
      <div className="border-b border-sidebar-border px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sidebar-muted">
          CSRM
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-tight">
          Payroll & HR
        </h2>
        <p className="mt-1 text-sm text-sidebar-muted">
          Frontend setup foundation
        </p>
      </div>

      <nav className="space-y-1 px-3 py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
