import { X } from 'lucide-react'

import { SidebarContent } from '@/components/layout/AppSidebar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { useLayoutStore } from '@/stores/layout.store'

export const MobileSidebar = () => {
  const isOpen = useLayoutStore((state) => state.isMobileSidebarOpen)
  const closeMobileSidebar = useLayoutStore((state) => state.closeMobileSidebar)

  return (
    <div className={cn('fixed inset-0 z-50 lg:hidden', !isOpen && 'pointer-events-none')}>
      <button
        type="button"
        aria-label="Close mobile sidebar backdrop"
        onClick={closeMobileSidebar}
        className={cn(
          'absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      <aside
        className={cn(
          'absolute left-0 top-0 h-full w-80 max-w-[86vw] border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute right-3 top-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileSidebar}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent onNavigate={closeMobileSidebar} />
      </aside>
    </div>
  )
}
