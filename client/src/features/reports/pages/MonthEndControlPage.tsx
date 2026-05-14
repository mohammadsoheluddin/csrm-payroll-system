import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import { usePayrollLookups } from '@/features/payroll/hooks/usePayrollLookups'
import { getMonthEndProcessControlStatus } from '@/features/reports/api/reports.api'
import { ReportMetricCards } from '@/features/reports/components/ReportMetricCards'
import { ReportPeriodToolbar } from '@/features/reports/components/ReportPeriodToolbar'
import { ReportPreviewTable } from '@/features/reports/components/ReportPreviewTable'
import { buildReportMetrics, currentReportPeriod, getPreviewTotals, normalizePreviewRows } from '@/features/reports/utils/report.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

export const MonthEndControlPage = () => {
  const canAccess = useAuthStore((state) => state.canAccess)
  const role = useAuthStore((state) => state.user?.role)
  const canRead = canAccess([PERMISSIONS.MONTH_END_PROCESS_CONTROL_READ])
  const [filters, setFilters] = useState(currentReportPeriod)
  const lookups = usePayrollLookups({ enabled: canRead })
  const isPeriodReady = Boolean(filters.company && filters.month && filters.year)

  const statusQuery = useQuery({
    queryKey: queryKeys.reports.monthEndStatus(filters),
    queryFn: () => getMonthEndProcessControlStatus(filters),
    enabled: canRead && isPeriodReady,
  })

  if (!canRead) {
    return <PermissionDeniedInline message={`Role ${role ?? 'guest'} cannot access Month-End Control.`} />
  }

  const rows = normalizePreviewRows(statusQuery.data)
  const totals = getPreviewTotals(statusQuery.data)
  const metrics = buildReportMetrics(statusQuery.data)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F11</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Month-End Process Control</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Review backend readiness/status for month-end payroll close using /month-end-process-control/status.
          </p>
        </div>
        <Button variant="outline" onClick={() => void statusQuery.refetch()} disabled={statusQuery.isFetching}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <ReportPeriodToolbar
        filters={filters}
        onChange={setFilters}
        onRefresh={() => void statusQuery.refetch()}
        companyOptions={lookups.companyOptions}
        majorDepartmentOptions={lookups.getMajorDepartmentOptions(filters.company)}
        departmentOptions={lookups.getDepartmentOptions(filters.company, filters.majorDepartment)}
        isLoading={lookups.isLoading || statusQuery.isFetching}
        showDepartment={false}
      />

      {!filters.company && (
        <Card>
          <CardContent className="pt-5 text-sm text-muted-foreground">
            Select a company to load month-end process-control status.
          </CardContent>
        </Card>
      )}

      {lookups.isError && <ApiErrorState error={lookups.error} onRetry={() => lookups.refetch?.()} />}

      {statusQuery.isLoading ? (
        <LoadingState title="Loading month-end process status" />
      ) : statusQuery.isError ? (
        <ApiErrorState error={statusQuery.error} onRetry={() => void statusQuery.refetch()} />
      ) : (
        <>
          <ReportMetricCards metrics={metrics} fallback="No month-end status metrics returned yet." />
          <ReportPreviewTable
            title="Month-End Readiness Detail"
            description="If backend returns list-style readiness details, they will appear here."
            rows={rows}
            totals={totals}
          />
        </>
      )}
    </div>
  )
}
