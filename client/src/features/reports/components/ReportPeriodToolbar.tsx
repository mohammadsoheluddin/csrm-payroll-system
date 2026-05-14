import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import type { PayrollLookupOption } from '@/features/payroll/types/payroll.types'
import type { ReportPeriodFilters, SalarySummaryGroupBy } from '@/features/reports/types/report.types'

const monthOptions = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const yearOptions = Array.from({ length: 7 }, (_, index) => new Date().getFullYear() - 3 + index)

const groupByOptions: Array<{ value: SalarySummaryGroupBy; label: string }> = [
  { value: 'company', label: 'Company' },
  { value: 'majorDepartment', label: 'Major Department' },
  { value: 'department', label: 'Department / Section' },
  { value: 'section', label: 'Section' },
  { value: 'paymentMode', label: 'Payment Mode' },
]

const inputClassName =
  'h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60'

export type ReportPeriodToolbarProps = {
  filters: ReportPeriodFilters
  onChange: (filters: ReportPeriodFilters) => void
  onRefresh?: () => void
  companyOptions: PayrollLookupOption[]
  majorDepartmentOptions?: PayrollLookupOption[]
  departmentOptions?: PayrollLookupOption[]
  employeeOptions?: PayrollLookupOption[]
  isLoading?: boolean
  showGroupBy?: boolean
  showEmployee?: boolean
  showDepartment?: boolean
  showPaymentMode?: boolean
}

export const ReportPeriodToolbar = ({
  filters,
  onChange,
  onRefresh,
  companyOptions,
  majorDepartmentOptions = [],
  departmentOptions = [],
  employeeOptions = [],
  isLoading,
  showGroupBy,
  showEmployee,
  showDepartment = true,
  showPaymentMode,
}: ReportPeriodToolbarProps) => {
  const updateFilters = (patch: Partial<ReportPeriodFilters>) => {
    onChange({ ...filters, ...patch })
  }

  return (
    <Card>
      <CardContent className="grid gap-3 pt-5 md:grid-cols-2 xl:grid-cols-6">
        <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Month
          <select
            className={inputClassName}
            value={filters.month}
            onChange={(event) => updateFilters({ month: Number(event.target.value) })}
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Year
          <select
            className={inputClassName}
            value={filters.year}
            onChange={(event) => updateFilters({ year: Number(event.target.value) })}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Company
          <select
            className={inputClassName}
            value={filters.company ?? ''}
            onChange={(event) =>
              updateFilters({
                company: event.target.value || undefined,
                majorDepartment: undefined,
                department: undefined,
                employee: undefined,
              })
            }
          >
            <option value="">All companies</option>
            {companyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {showDepartment && (
          <>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Major Dept.
              <select
                className={inputClassName}
                value={filters.majorDepartment ?? ''}
                onChange={(event) =>
                  updateFilters({
                    majorDepartment: event.target.value || undefined,
                    department: undefined,
                    employee: undefined,
                  })
                }
                disabled={!filters.company || majorDepartmentOptions.length === 0}
              >
                <option value="">All major departments</option>
                {majorDepartmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Department
              <select
                className={inputClassName}
                value={filters.department ?? ''}
                onChange={(event) => updateFilters({ department: event.target.value || undefined, employee: undefined })}
                disabled={!filters.company || departmentOptions.length === 0}
              >
                <option value="">All departments</option>
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {showEmployee && (
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Employee
            <select
              className={inputClassName}
              value={filters.employee ?? ''}
              onChange={(event) => updateFilters({ employee: event.target.value || undefined })}
              disabled={employeeOptions.length === 0}
            >
              <option value="">All employees</option>
              {employeeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {showGroupBy && (
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Group By
            <select
              className={inputClassName}
              value={filters.groupBy ?? 'majorDepartment'}
              onChange={(event) => updateFilters({ groupBy: event.target.value as SalarySummaryGroupBy })}
            >
              {groupByOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {showPaymentMode && (
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Payment Mode
            <select
              className={inputClassName}
              value={filters.paymentMode ?? 'bank'}
              onChange={(event) => updateFilters({ paymentMode: event.target.value || undefined })}
            >
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
              <option value="mobile_banking">Mobile Banking</option>
            </select>
          </label>
        )}

        {onRefresh && (
          <div className="flex items-end">
            <Button className="w-full" variant="outline" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
