import { ArrowRight, LockKeyhole, Route } from 'lucide-react'

import type { AppRouteConfigItem } from '@/app/router/routeConfig'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export type ModulePlaceholderPageProps = {
  route: AppRouteConfigItem
}

export const ModulePlaceholderPage = ({ route }: ModulePlaceholderPageProps) => {
  return (
    <section className="space-y-6">
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-muted/40 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="warning">Part-F2 route shell</Badge>
                <Badge variant="muted">{route.section}</Badge>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {route.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {route.description}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Route className="h-4 w-4 text-primary" />
              Frontend Route
            </div>
            <p className="mt-2 break-all rounded-xl bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
              {route.path}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Permission Guard
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {route.requiredPermissions?.length
                ? route.requiredPermissions.join(', ')
                : 'No special permission required at this route shell level.'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ArrowRight className="h-4 w-4 text-primary" />
              Implementation Status
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              UI implementation is intentionally pending. Business screens will start after layout,
              auth, API client, and permission foundation are locked.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next screen build note</CardTitle>
          <CardDescription>
            This placeholder confirms that routing, sidebar, breadcrumb, page shell, and permission metadata
            are connected. Real CRUD/report UI should be added in its own feature part.
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}
