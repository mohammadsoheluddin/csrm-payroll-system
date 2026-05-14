import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import { usePayrollLookups } from '@/features/payroll/hooks/usePayrollLookups'
import { downloadSalarySummaryReport, getSalarySummaryPreview } from '@/features/reports/api/reports.api'
import { ReportExportToolbar } from '@/features/reports/components/ReportExportToolbar'
import { ReportMetricCards } from '@/features/reports/components/ReportMetricCards'
import { ReportPeriodToolbar } from '@/features/reports/components/ReportPeriodToolbar'
import { ReportPreviewTable } from '@/features/reports/components/ReportPreviewTable'
import type { ReportExportType } from '@/features/reports/types/report.types'
import { buildReportMetrics, currentReportPeriod, getPreviewTotals, normalizePreviewRows } from '@/features/reports/utils/report.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useApiMutation } from '@/lib/query/useApiMutation'
import { useAuthStore } from '@/stores/auth.store'

export const SalarySummaryReportPage = () => {
  const canAccess = useAuthStore((state) => state.canAccess)
  const role = useAuthStore((state) => state.user?.role)
  const canRead = canAccess([PERMISSIONS.SALARY_SUMMARY_READ])
  const canExport = canAccess([PERMISSIONS.SALARY_SUMMARY_EXPORT])
  const [filters, setFilters] = useState(currentReportPeriod)
  const lookups = usePayrollLookups({ enabled: canRead })
  const isPeriodReady = Boolean(filters.month && filters.year)

  const previewQuery = useQuery({
    queryKey: queryKeys.reports.salarySummary(filters),
    queryFn: () => getSalarySummaryPreview(filters),
    enabled: canRead && isPeriodReady,
  })

  const exportMutation = useApiMutation({
    mutationFn: (type: ReportExportType) => downloadSalarySummaryReport({ filters, type }),
    successMessage: 'Salary summary download started',
  })

  if (!canRead) {
    return <PermissionDeniedInline message={`Role ${role ?? 'guest'} cannot access Salary Summary.`} />
  }

  const rows = normalizePreviewRows(previewQuery.data)
  const totals = getPreviewTotals(previewQuery.data)
  const metrics = buildReportMetrics(totals)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F11 • B51 Connected</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Salary Summary Report</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Preview and export the dedicated backend-calculated salary summary by month, year, company, department, and grouping.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void previewQuery.refetch()} disabled={previewQuery.isFetching}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {canExport && (
            <ReportExportToolbar
              onExport={(type) => exportMutation.mutate(type)}
              isExporting={exportMutation.isPending}
              disabled={!isPeriodReady}
            />
          )}
        </div>
      </div>

      <ReportPeriodToolbar
        filters={filters}
        onChange={setFilters}
        onRefresh={() => void previewQuery.refetch()}
        companyOptions={lookups.companyOptions}
        majorDepartmentOptions={lookups.getMajorDepartmentOptions(filters.company)}
        departmentOptions={lookups.getDepartmentOptions(filters.company, filters.majorDepartment)}
        employeeOptions={lookups.getEmployeeOptions({
          company: filters.company,
          majorDepartment: filters.majorDepartment,
          department: filters.department,
        })}
        showGroupBy
        showEmployee
        isLoading={lookups.isLoading || previewQuery.isFetching}
      />

      {lookups.isError && <ApiErrorState error={lookups.error} onRetry={() => lookups.refetch?.()} />}

      {previewQuery.isLoading ? (
        <LoadingState title="Loading salary summary" />
      ) : previewQuery.isError ? (
        <ApiErrorState error={previewQuery.error} onRetry={() => void previewQuery.refetch()} />
      ) : (
        <>
          <ReportMetricCards metrics={metrics} fallback="No salary summary totals returned yet." />
          <ReportPreviewTable
            title="Salary Summary Preview"
            description="Backend-calculated preview. Frontend displays values only; payroll calculation remains server-controlled."
            rows={rows}
            totals={totals}
          />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Export Pattern</CardTitle>
          <CardDescription>Exports use backend file routes and browser download helper.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Excel, PDF, and CSV downloads are enabled only for users with <span className="font-semibold text-foreground">salary_summary:export</span> permission.
        </CardContent>
      </Card>
    </div>
  )
}
