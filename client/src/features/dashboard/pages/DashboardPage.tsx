import { ArrowRight, EyeOff, LockKeyhole, Route, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { appRouteConfig } from '@/app/router/routeConfig'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Can } from '@/components/guards/Can'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import { routePaths } from '@/config/routePaths'
import { countVisibleSidebarItems, getVisibleSidebarGroups } from '@/config/sidebar.config'
import { useAuthStore } from '@/stores/auth.store'

const nextSteps = [
  'Part-F6 will add dashboard widget configuration and role-based dashboard cards.',
  'Part-F7 will start master data screens using this permission-aware layout foundation.',
  'Salary Summary full preview/export UI will be built in a dedicated report UI part after the sidebar/route guard is accepted.',
]

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const permissions = useAuthStore((state) => state.getPermissions())
  const visibleSidebarGroups = getVisibleSidebarGroups(user?.role)
  const visibleSidebarItems = countVisibleSidebarItems(user?.role)
  const guardedRoutes = appRouteConfig.filter((route) => route.requiredPermissions?.length)

  const setupCards = [
    {
      label: 'Current role',
      value: user?.role ?? 'Unknown',
      description: 'Sidebar, route access, and action visibility are filtered from this role.',
    },
    {
      label: 'Role permissions',
      value: permissions.length.toString(),
      description: 'Frontend permission map is synced with backend RBAC constants including Salary Summary.',
    },
    {
      label: 'Visible menu items',
      value: visibleSidebarItems.toString(),
      description: 'Sidebar groups and child links are now role-wise filtered.',
    },
    {
      label: 'Guarded routes',
      value: guardedRoutes.length.toString(),
      description: 'ProtectedRoute blocks direct URL access when permission is missing.',
    },
  ]

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative border-b border-border bg-muted/40 px-6 py-8">
          <div className="absolute right-6 top-6 hidden rounded-full bg-primary/10 p-4 text-primary sm:block">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <Badge variant="success">Part-F5</Badge>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground">
            Sidebar Permission Filtering + Permission-Wise UI Guard
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
            The CSRM Payroll frontend now filters sidebar links by role, blocks protected routes by permission,
            and provides reusable guards for future buttons, exports, approvals, locks, soft delete/restore, and audit actions.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button disabled>
              Permission foundation accepted
              <Sparkles className="h-4 w-4" />
            </Button>
            <Link to={routePaths.salarySummary}>
              <Button variant="outline">
                Open Salary Summary placeholder
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          {setupCards.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p className="mt-2 break-words text-2xl font-bold capitalize tracking-tight text-foreground">{item.value}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-primary" />
              Visible sidebar groups
            </CardTitle>
            <CardDescription>
              The left navigation now renders only groups and links allowed for the authenticated user role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleSidebarGroups.map((group) => (
              <div key={group.label} className="rounded-2xl border border-border bg-background p-4">
                <p className="font-semibold text-foreground">{group.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {group.items.length} top-level item(s),{' '}
                  {group.items.reduce((total, item) => total + (item.children?.length ?? 0), 0)} child link(s)
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-primary" />
              Action guard sample
            </CardTitle>
            <CardDescription>
              Future buttons will use the same Can/PermissionGuard pattern instead of manual if/else code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Can
              permissions={[PERMISSIONS.SALARY_SUMMARY_EXPORT]}
              fallback={
                <PermissionDeniedInline
                  title="Salary Summary export hidden"
                  message="This role can only see this action when salary_summary:export is allowed. Manager gets read-only access; HR/accounts/admin can export."
                />
              }
            >
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="font-semibold text-foreground">Salary Summary export action visible</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Export controls will be displayed for roles with salary_summary:export.
                </p>
                <Button className="mt-4" disabled>
                  Future Excel/PDF export
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Can>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Route guard sections
            </CardTitle>
            <CardDescription>
              Route metadata is used by ProtectedRoute and by placeholders until real screens are built.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from(new Set(appRouteConfig.map((route) => route.section))).map((section) => (
              <div key={section} className="rounded-2xl border border-border bg-background p-4">
                <p className="font-semibold text-foreground">{section}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {appRouteConfig.filter((route) => route.section === section).length} routes
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Next integration order
            </CardTitle>
            <CardDescription>
              Permission-aware UI is ready. Business screens should now be built one module at a time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextSteps.map((item, index) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-border bg-background p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
