import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import { usePayrollLookups } from '@/features/payroll/hooks/usePayrollLookups'
import {
  downloadMonthlyPayrollReportFile,
  downloadSalaryBankSheetFile,
  getMonthlyPayrollReportPreview,
  getSalaryBankSheetPreview,
} from '@/features/reports/api/reports.api'
import { ReportExportToolbar } from '@/features/reports/components/ReportExportToolbar'
import { ReportMetricCards } from '@/features/reports/components/ReportMetricCards'
import { ReportPeriodToolbar } from '@/features/reports/components/ReportPeriodToolbar'
import { ReportPreviewTable } from '@/features/reports/components/ReportPreviewTable'
import type { ReportExportType, ReportPeriodFilters } from '@/features/reports/types/report.types'
import { buildReportMetrics, currentReportPeriod, getPreviewTotals, normalizePreviewRows } from '@/features/reports/utils/report.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useApiMutation } from '@/lib/query/useApiMutation'
import { useAuthStore } from '@/stores/auth.store'

export const BankSheetsPage = () => {
  const canAccess = useAuthStore((state) => state.canAccess)
  const role = useAuthStore((state) => state.user?.role)
  const canRead = canAccess([PERMISSIONS.BANK_SHEET_READ])
  const canPayrollReportExport = canAccess([PERMISSIONS.PAYROLL_REPORT_EXPORT])
  const canBankSheetExport = canAccess([PERMISSIONS.BANK_SHEET_EXPORT])
  const [filters, setFilters] = useState<ReportPeriodFilters>(() => ({ ...currentReportPeriod(), paymentMode: 'bank' }))
  const lookups = usePayrollLookups({ enabled: canRead })
  const isPeriodReady = Boolean(filters.company && filters.month && filters.year)

  const bankSheetQuery = useQuery({
    queryKey: queryKeys.reports.bankSheet(filters),
    queryFn: () => getSalaryBankSheetPreview(filters),
    enabled: canRead && isPeriodReady,
  })

  const monthlyPayrollQuery = useQuery({
    queryKey: queryKeys.reports.monthlyPayroll(filters),
    queryFn: () => getMonthlyPayrollReportPreview(filters),
    enabled: canRead && isPeriodReady,
  })

  const monthlyExportMutation = useApiMutation({
    mutationFn: (type: Extract<ReportExportType, 'csv' | 'excel'>) => downloadMonthlyPayrollReportFile({ filters, type }),
    successMessage: 'Monthly payroll report download started',
  })

  const bankSheetExportMutation = useApiMutation({
    mutationFn: (type: Extract<ReportExportType, 'excel' | 'pdf'>) => downloadSalaryBankSheetFile({ filters, type }),
    successMessage: 'Salary bank sheet download started',
  })

  if (!canRead) {
    return <PermissionDeniedInline message={`Role ${role ?? 'guest'} cannot access Bank Sheets.`} />
  }

  const bankRows = normalizePreviewRows(bankSheetQuery.data)
  const bankTotals = getPreviewTotals(bankSheetQuery.data)
  const payrollRows = normalizePreviewRows(monthlyPayrollQuery.data)
  const payrollTotals = getPreviewTotals(monthlyPayrollQuery.data)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F11</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bank Sheets & Monthly Payroll Reports</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Route-note-safe preview foundation for salary bank sheet and monthly payroll report exports.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void bankSheetQuery.refetch()
            void monthlyPayrollQuery.refetch()
          }}
          disabled={bankSheetQuery.isFetching || monthlyPayrollQuery.isFetching}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <ReportPeriodToolbar
        filters={filters}
        onChange={setFilters}
        onRefresh={() => {
          void bankSheetQuery.refetch()
          void monthlyPayrollQuery.refetch()
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
        showPaymentMode
        isLoading={lookups.isLoading || bankSheetQuery.isFetching || monthlyPayrollQuery.isFetching}
      />

      {!filters.company && (
        <Card>
          <CardContent className="pt-5 text-sm text-muted-foreground">
            Select company/month/year to call bank sheet and monthly payroll report backend sub-routes.
          </CardContent>
        </Card>
      )}

      {lookups.isError && <ApiErrorState error={lookups.error} onRetry={() => lookups.refetch?.()} />}

      <Card>
        <CardHeader className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <CardTitle>Monthly Payroll Report</CardTitle>
            <CardDescription>Preview uses /payroll-reports/monthly-report. Export uses CSV/Excel routes.</CardDescription>
          </div>
          {canPayrollReportExport && (
            <ReportExportToolbar
              supportedTypes={['excel', 'csv']}
              onExport={(type) => monthlyExportMutation.mutate(type as Extract<ReportExportType, 'csv' | 'excel'>)}
              isExporting={monthlyExportMutation.isPending}
              disabled={!isPeriodReady}
            />
          )}
        </CardHeader>
        <CardContent>
          {monthlyPayrollQuery.isLoading ? (
            <LoadingState title="Loading monthly payroll report" />
          ) : monthlyPayrollQuery.isError ? (
            <ApiErrorState error={monthlyPayrollQuery.error} onRetry={() => void monthlyPayrollQuery.refetch()} />
          ) : (
            <>
              <ReportMetricCards metrics={buildReportMetrics(payrollTotals)} fallback="No monthly payroll totals returned yet." />
              <div className="mt-4">
                <ReportPreviewTable title="Monthly Payroll Preview" rows={payrollRows} totals={payrollTotals} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle>Salary Bank Sheet Preview</CardTitle>
              <CardDescription>Uses /bank-sheets/salary/preview plus backend Excel/PDF export routes.</CardDescription>
            </div>
            {canBankSheetExport ? (
              <ReportExportToolbar
                supportedTypes={['excel', 'pdf']}
                onExport={(type) => bankSheetExportMutation.mutate(type as Extract<ReportExportType, 'excel' | 'pdf'>)}
                isExporting={bankSheetExportMutation.isPending}
                disabled={!isPeriodReady}
              />
            ) : (
              <Badge variant="muted">Preview only</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {bankSheetQuery.isLoading ? (
            <LoadingState title="Loading salary bank sheet preview" />
          ) : bankSheetQuery.isError ? (
            <ApiErrorState error={bankSheetQuery.error} onRetry={() => void bankSheetQuery.refetch()} />
          ) : (
            <ReportPreviewTable title="Salary Bank Sheet" rows={bankRows} totals={bankTotals} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
