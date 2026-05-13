import { ArrowRight, LockKeyhole, Route, ShieldCheck } from 'lucide-react'

import type { AppRouteConfigItem } from '@/app/router/routeConfig'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Can } from '@/components/guards/Can'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'

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
                <Badge variant="success">Part-F5 permission shell</Badge>
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
              Route Permission Guard
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {route.requiredPermissions?.length
                ? route.requiredPermissions.join(', ')
                : 'No special permission required at this route shell level.'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Action Guard Pattern
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Buttons, exports, deletes, restores, approvals, locks, and sensitive actions must use Can or PermissionGuard.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission-wise action visibility sample</CardTitle>
          <CardDescription>
            This confirms UI-level permission hiding before real CRUD/report screens are implemented.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Can
            permissions={[PERMISSIONS.SALARY_SUMMARY_EXPORT]}
            fallback={
              <PermissionDeniedInline
                title="Export action hidden"
                message="This role can open the screen only if it has read permission. Export buttons will stay hidden without salary_summary:export."
              />
            }
          >
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="font-semibold text-foreground">Export action visible</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                This role can see export actions when the future report UI is built.
              </p>
              <Button className="mt-4" disabled>
                Future export button
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Can>

          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="font-semibold text-foreground">Next screen build note</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This placeholder confirms routing, sidebar filtering, breadcrumb, route guard, and action guard metadata are connected.
              Real CRUD/report UI should be added in its own feature part.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
