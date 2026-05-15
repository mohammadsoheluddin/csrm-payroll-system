import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { routePaths } from '@/config/routePaths'
import { getCurrentRouteMeta } from '@/lib/router/routeLookup'

export const AppBreadcrumbs = () => {
  const location = useLocation()
  const routeMeta = getCurrentRouteMeta(location.pathname)
  const breadcrumbs = routeMeta?.breadcrumbs ?? ['Unknown Page']

  return (
    <nav aria-label="Breadcrumb" className="flex max-w-[66vw] items-center gap-1 overflow-hidden text-xs text-muted-foreground xl:max-w-[780px]">
      <Link
        to={routePaths.dashboard}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-1 font-medium transition hover:bg-muted hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        Home
      </Link>

      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          <span key={`${item}-${index}`} className="inline-flex min-w-0 items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className={isLast ? 'truncate font-semibold text-foreground' : 'truncate'}>{item}</span>
          </span>
        )
      })}
    </nav>
  )
}
