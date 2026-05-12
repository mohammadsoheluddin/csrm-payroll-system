import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { routePaths } from '@/config/routePaths'
import { getCurrentRouteMeta } from '@/lib/router/routeLookup'

export const AppBreadcrumbs = () => {
  const location = useLocation()
  const routeMeta = getCurrentRouteMeta(location.pathname)
  const breadcrumbs = routeMeta?.breadcrumbs ?? ['Unknown Page']

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
      <Link
        to={routePaths.dashboard}
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition hover:bg-muted hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        Home
      </Link>

      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            <span className={isLast ? 'font-medium text-foreground' : undefined}>{item}</span>
          </span>
        )
      })}
    </nav>
  )
}
