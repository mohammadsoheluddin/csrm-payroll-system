import { ArrowRight, DatabaseZap, Download, Route, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { appRouteConfig } from '@/app/router/routeConfig'
import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { ExportActionButton } from '@/components/reports/ExportActionButton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { apiRoutes } from '@/config/apiRoutes'
import { routePaths } from '@/config/routePaths'

const setupCards = [
  {
    label: 'HTTP client',
    value: 'Centralized',
    description: 'Axios base URL, credentials, access-token header, and refresh retry are standardized.',
  },
  {
    label: 'Error normalization',
    value: '400–500 Ready',
    description: 'Backend validation, conflict, auth, forbidden, network, and server errors use one shape.',
  },
  {
    label: 'Query policy',
    value: 'TanStack Ready',
    description: 'Retry, stale-time, and query error toast behavior are configured globally.',
  },
  {
    label: 'Export pattern',
    value: 'PDF/Excel/CSV',
    description: 'Blob download helper and export button are ready for report screens.',
  },
]

const nextSteps = [
  'Part-F5 will enforce role-wise sidebar filtering and permission-wise action button visibility.',
  'Part-F6 will add dashboard widget configuration and role-based dashboard cards.',
  'Part-F7 will start master data screens using this API/error foundation.',
]

const sampleForbiddenError = {
  response: {
    status: 403,
    data: {
      success: false,
      message: 'You do not have permission to perform this action.',
    },
  },
  isAxiosError: true,
}

export const DashboardPage = () => {
  return (
    <section className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative border-b border-border bg-muted/40 px-6 py-8">
          <div className="absolute right-6 top-6 hidden rounded-full bg-primary/10 p-4 text-primary sm:block">
            <DatabaseZap className="h-8 w-8" />
          </div>
          <Badge variant="success">Part-F4</Badge>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground">
            API Client + Error Handling Foundation
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
            The CSRM Payroll frontend now has a centralized API client strategy, normalized backend
            error handling, TanStack Query defaults, mutation helper, and export/download UI pattern.
            Business CRUD/report screens are still intentionally pending.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button disabled>
              API foundation accepted
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-primary" />
              Standard error UI
            </CardTitle>
            <CardDescription>
              Future CRUD forms and report pages should show backend errors through this pattern.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApiErrorState error={sampleForbiddenError} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export button pattern
            </CardTitle>
            <CardDescription>
              Report screens will use the shared file download helper for PDF, Excel, and CSV.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
              Sample route pattern: <span className="font-semibold text-foreground">{apiRoutes.reports.monthlyPayrollReport}</span>
            </div>
            <ExportActionButton
              endpoint={apiRoutes.reports.monthlyPayrollReport}
              params={{ month: 5, year: 2026 }}
              fileName="monthly-payroll-report.pdf"
              label="Download sample report"
              variant="outline"
              disabled
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Disabled on dashboard intentionally. Real export buttons will be enabled inside report screens.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Route sections
            </CardTitle>
            <CardDescription>
              Route placeholders continue to prove navigation and metadata before real feature screens start.
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
              API foundation is ready. Permission-aware UI should come before CRUD screens.
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
