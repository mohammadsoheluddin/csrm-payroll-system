import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, RefreshCw } from 'lucide-react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import { routePaths } from '@/config/routePaths'
import { usePayrollLookups } from '@/features/payroll/hooks/usePayrollLookups'
import { getReportCenterCatalog, getReportCenterDashboard, getReportCenterReadiness } from '@/features/reports/api/reports.api'
import { ReportMetricCards } from '@/features/reports/components/ReportMetricCards'
import { ReportPeriodToolbar } from '@/features/reports/components/ReportPeriodToolbar'
import { currentReportPeriod, buildReportMetrics, getCatalogItemKey, getCatalogItemTitle, normalizeCatalogItems } from '@/features/reports/utils/report.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'
import { useState } from 'react'

const foundationReports = [
  {
    title: 'Salary Summary',
    description: 'Dedicated B51 backend-calculated salary summary with preview and Excel/PDF/CSV export.',
    href: routePaths.salarySummary,
    permission: PERMISSIONS.SALARY_SUMMARY_READ,
    badge: 'B51 Ready',
  },
  {
    title: 'Bank Sheet Preview',
    description: 'Backend route-note-safe salary bank sheet preview foundation.',
    href: routePaths.bankSheets,
    permission: PERMISSIONS.BANK_SHEET_READ,
    badge: 'Preview',
  },
  {
    title: 'Month-End Control',
    description: 'Readiness/status view for month-end payroll processing control.',
    href: routePaths.monthEndControl,
    permission: PERMISSIONS.MONTH_END_PROCESS_CONTROL_READ,
    badge: 'Control',
  },
  {
    title: 'Layout Standards',
    description: 'Locked PDF/Excel/CSV report UI and export behavior standard.',
    href: routePaths.reportLayoutStandards,
    permission: PERMISSIONS.REPORT_LAYOUT_STANDARD_READ,
    badge: 'Standard',
  },
]

export const ReportCenterPage = () => {
  const canAccess = useAuthStore((state) => state.canAccess)
  const role = useAuthStore((state) => state.user?.role)
  const canRead = canAccess([PERMISSIONS.REPORT_CENTER_READ])
  const [filters, setFilters] = useState(currentReportPeriod)
  const lookups = usePayrollLookups({ enabled: canRead })
  const isPeriodReady = Boolean(filters.company && filters.month && filters.year)

  const catalogQuery = useQuery({
    queryKey: queryKeys.reports.catalog,
    queryFn: getReportCenterCatalog,
    enabled: canRead,
  })

  const dashboardQuery = useQuery({
    queryKey: queryKeys.reports.dashboard(filters),
    queryFn: () => getReportCenterDashboard(filters),
    enabled: canRead && isPeriodReady,
  })

  const readinessQuery = useQuery({
    queryKey: queryKeys.reports.readiness(filters),
    queryFn: () => getReportCenterReadiness(filters),
    enabled: canRead && isPeriodReady,
  })

  if (!canRead) {
    return <PermissionDeniedInline message={`Role ${role ?? 'guest'} cannot access Report Center.`} />
  }

  const catalogItems = normalizeCatalogItems(catalogQuery.data)
  const metrics = buildReportMetrics(dashboardQuery.data)
  const readinessMetrics = buildReportMetrics(readinessQuery.data)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F11</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Report Center</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Central report entry point using backend-safe sub-routes for catalog, dashboard, readiness, previews, and exports.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void catalogQuery.refetch()
            void dashboardQuery.refetch()
            void readinessQuery.refetch()
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Reports
        </Button>
      </div>

      <ReportPeriodToolbar
        filters={filters}
        onChange={setFilters}
        onRefresh={() => {
          void dashboardQuery.refetch()
          void readinessQuery.refetch()
        }}
        companyOptions={lookups.companyOptions}
        majorDepartmentOptions={lookups.getMajorDepartmentOptions(filters.company)}
        departmentOptions={lookups.getDepartmentOptions(filters.company, filters.majorDepartment)}
        employeeOptions={lookups.getEmployeeOptions({
          company: filters.company,
          majorDepartment: filters.majorDepartment,
          department: filters.department,
        })}
        showEmployee
        isLoading={lookups.isLoading || dashboardQuery.isFetching || readinessQuery.isFetching}
      />

      {!filters.company && (
        <Card>
          <CardContent className="pt-5 text-sm text-muted-foreground">
            Select a company to load backend dashboard/readiness reports. Catalog and foundation links remain available.
          </CardContent>
        </Card>
      )}

      {dashboardQuery.isLoading ? (
        <LoadingState title="Loading report dashboard" />
      ) : dashboardQuery.isError ? (
        <ApiErrorState error={dashboardQuery.error} onRetry={() => void dashboardQuery.refetch()} />
      ) : (
        <ReportMetricCards metrics={metrics} fallback="Select company/month/year to load report dashboard metrics." />
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Report Foundation Links</CardTitle>
            <CardDescription>Production pages added in Part-F11 with permission-aware navigation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {foundationReports
              .filter((item) => canAccess([item.permission]))
              .map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-background p-4 transition hover:border-primary/40 hover:bg-muted/40"
                >
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {item.title}
                      <Badge variant="muted">{item.badge}</Badge>
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                </Link>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness Summary</CardTitle>
            <CardDescription>Uses /report-center/readiness with company/month/year query.</CardDescription>
          </CardHeader>
          <CardContent>
            {readinessQuery.isLoading ? (
              <LoadingState title="Loading readiness status" />
            ) : readinessQuery.isError ? (
              <ApiErrorState error={readinessQuery.error} onRetry={() => void readinessQuery.refetch()} />
            ) : (
              <ReportMetricCards metrics={readinessMetrics} fallback="No readiness metrics loaded yet." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backend Catalog</CardTitle>
          <CardDescription>Loaded from /report-center/catalog. Empty state is safe if backend catalog has no active rows.</CardDescription>
        </CardHeader>
        <CardContent>
          {catalogQuery.isLoading ? (
            <LoadingState title="Loading report catalog" />
          ) : catalogQuery.isError ? (
            <ApiErrorState error={catalogQuery.error} onRetry={() => void catalogQuery.refetch()} />
          ) : catalogItems.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No backend catalog items returned yet. Route is connected and ready for backend catalog data.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {catalogItems.map((item, index) => (
                <div key={getCatalogItemKey(item, index)} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{getCatalogItemTitle(item)}</p>
                    {item.status && <Badge variant="muted">{item.status}</Badge>}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.description ?? 'No description available.'}</p>
                  {item.category && <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary">{item.category}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
