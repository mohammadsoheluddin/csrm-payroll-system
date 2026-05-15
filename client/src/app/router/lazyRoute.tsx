import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'

import { RouteLoadingFallback } from './RouteLoadingFallback'

export const lazyNamed = <TProps extends object>(
  loader: () => Promise<Record<string, ComponentType<TProps>>>,
  exportName: string,
) => {
  return lazy(async () => {
    const module = await loader()
    const component = module[exportName]

    if (!component) {
      throw new Error(`Lazy route export "${exportName}" was not found.`)
    }

    return { default: component }
  })
}

export const withRouteSuspense = (
  children: ReactNode,
  fallback?: ReactNode,
) => {
  return (
    <Suspense fallback={fallback ?? <RouteLoadingFallback />}>
      {children}
    </Suspense>
  )
}
