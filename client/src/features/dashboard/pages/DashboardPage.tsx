import { ArrowRight, LayoutDashboard, Route, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { appRouteConfig } from '@/app/router/routeConfig'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { routePaths } from '@/config/routePaths'

const setupCards = [
  {
    label: 'Responsive layout shell',
    value: 'Desktop + Mobile',
    description: 'Sidebar, mobile drawer, sticky header, and content container are ready.',
  },
  {
    label: 'Route foundation',
    value: `${appRouteConfig.length} routes`,
    description: 'Core frontend route map is connected to placeholders and breadcrumbs.',
  },
  {
    label: 'Theme foundation',
    value: 'Mode + Preset',
    description: 'Light, dark, system, color preset, and density states are persistent.',
  },
  {
    label: 'Permission metadata',
    value: 'Prepared',
    description: 'Routes and sidebar items already carry permission requirements for Part-F3/F5.',
  },
]

const nextSteps = [
  'Part-F3 will connect JWT auth, /users/me, refresh token behavior, and protected route redirects.',
  'Part-F4 will add centralized Axios API client and backend error handling for 400/401/403/409/500.',
  'Part-F5 will enforce role-wise sidebar and permission-wise button visibility.',
]

export const DashboardPage = () => {
  return (
    <section className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative border-b border-border bg-muted/40 px-6 py-8">
          <div className="absolute right-6 top-6 hidden rounded-full bg-primary/10 p-4 text-primary sm:block">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <Badge variant="success">Part-F2</Badge>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground">
            Layout + Routing + Theme Foundation
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
            The CSRM Payroll frontend now has a stable ERP layout shell, route map, sidebar
            groups, breadcrumb system, mobile navigation, and multi-theme foundation. Business
            CRUD/report screens are still intentionally pending.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button disabled>
              Foundation accepted
              <Sparkles className="h-4 w-4" />
            </Button>
            <Link to={routePaths.themeSettings}>
              <Button variant="outline">
                Open theme settings
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          {setupCards.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Route sections
            </CardTitle>
            <CardDescription>
              Route placeholders prove navigation and metadata flow before real feature screens start.
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
              Layout is ready. Auth and API integration should come before CRUD screens.
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
