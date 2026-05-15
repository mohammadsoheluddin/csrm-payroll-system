import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import type { PayrollLookupOption } from '@/features/payroll/types/payroll.types'
import type { LegacySalaryFilters } from '@/features/legacy-salary-import/types/legacySalaryImport.types'
import {
  sheetTypeOptions,
  sourceOptions,
  summaryGroupByOptions,
} from '@/features/legacy-salary-import/utils/legacySalaryImport.utils'

const inputClassName =
  'h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60'

export type LegacySalaryFiltersPanelProps = {
  filters: LegacySalaryFilters
  onChange: (filters: LegacySalaryFilters) => void
  companyOptions: PayrollLookupOption[]
  onRefresh?: () => void
  isLoading?: boolean
  showRecordSearch?: boolean
  showGroupBy?: boolean
}

export const LegacySalaryFiltersPanel = ({
  filters,
  onChange,
  companyOptions,
  onRefresh,
  isLoading,
  showRecordSearch,
  showGroupBy,
}: LegacySalaryFiltersPanelProps) => {
  const updateFilters = (patch: Partial<LegacySalaryFilters>) => {
    onChange({ ...filters, ...patch })
  }

  return (
    <Card>
      <CardContent className="grid gap-3 pt-5 md:grid-cols-2 xl:grid-cols-6">
        <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Payroll Month
          <input
            className={inputClassName}
            type="month"
            value={filters.payrollMonth}
            onChange={(event) => updateFilters({ payrollMonth: event.target.value })}
          />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Company
          <select
            className={inputClassName}
            value={filters.company ?? ''}
            onChange={(event) => updateFilters({ company: event.target.value || undefined })}
          >
            <option value="">All companies</option>
            {companyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Source
          <select
            className={inputClassName}
            value={filters.source ?? ''}
            onChange={(event) => updateFilters({ source: event.target.value as LegacySalaryFilters['source'] })}
          >
            <option value="">All sources</option>
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sheet Type
          <select
            className={inputClassName}
            value={filters.sheetType ?? ''}
            onChange={(event) => updateFilters({ sheetType: event.target.value as LegacySalaryFilters['sheetType'] })}
          >
            <option value="">All sheet types</option>
            {sheetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {showGroupBy && (
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Group By
            <select
              className={inputClassName}
              value={filters.groupBy ?? 'department'}
              onChange={(event) => updateFilters({ groupBy: event.target.value as LegacySalaryFilters['groupBy'] })}
            >
              {summaryGroupByOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {showRecordSearch && (
          <>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Employee ID
              <input
                className={inputClassName}
                value={filters.employeeId ?? ''}
                onChange={(event) => updateFilters({ employeeId: event.target.value || undefined })}
                placeholder="EMP / ID"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Office ID
              <input
                className={inputClassName}
                value={filters.officeId ?? ''}
                onChange={(event) => updateFilters({ officeId: event.target.value || undefined })}
                placeholder="Office ID"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Employee Name
              <input
                className={inputClassName}
                value={filters.employeeName ?? ''}
                onChange={(event) => updateFilters({ employeeName: event.target.value || undefined })}
                placeholder="Name"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Department
              <input
                className={inputClassName}
                value={filters.departmentName ?? ''}
                onChange={(event) => updateFilters({ departmentName: event.target.value || undefined })}
                placeholder="Department"
              />
            </label>
          </>
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
