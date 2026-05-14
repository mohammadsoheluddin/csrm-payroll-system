import { RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import type { PayrollLookupOption, PayrollPeriodQuery } from '@/features/payroll/types/payroll.types'

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: new Date(2026, index, 1).toLocaleString('en-US', { month: 'long' }),
}))

const yearOptions = Array.from({ length: 7 }, (_, index) => String(new Date().getFullYear() - 2 + index))

type PayrollPeriodToolbarProps = {
  filters: PayrollPeriodQuery
  onChange: (filters: PayrollPeriodQuery) => void
  onRefresh?: () => void
  companyOptions: PayrollLookupOption[]
  majorDepartmentOptions: PayrollLookupOption[]
  departmentOptions: PayrollLookupOption[]
  branchOptions: PayrollLookupOption[]
  employeeOptions: PayrollLookupOption[]
  statusOptions?: PayrollLookupOption[]
  paymentModeOptions?: PayrollLookupOption[]
  showEmployee?: boolean
  showStatus?: boolean
  showPaymentMode?: boolean
  isLoading?: boolean
}

const selectClass =
  'h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'

export const PayrollPeriodToolbar = ({
  filters,
  onChange,
  onRefresh,
  companyOptions,
  majorDepartmentOptions,
  departmentOptions,
  branchOptions,
  employeeOptions,
  statusOptions = [],
  paymentModeOptions = [],
  showEmployee = true,
  showStatus = true,
  showPaymentMode = false,
  isLoading,
}: PayrollPeriodToolbarProps) => {
  const updateFilter = (key: keyof PayrollPeriodQuery, value: string) => {
    const nextFilters: PayrollPeriodQuery = {
      ...filters,
      [key]: value,
    }

    if (key === 'company') {
      nextFilters.majorDepartment = ''
      nextFilters.department = ''
      nextFilters.employee = ''
    }

    if (key === 'majorDepartment') {
      nextFilters.department = ''
      nextFilters.employee = ''
    }

    if (key === 'department' || key === 'branch') {
      nextFilters.employee = ''
    }

    onChange(nextFilters)
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <select className={selectClass} value={filters.month ?? ''} onChange={(event) => updateFilter('month', event.target.value)}>
            <option value="">Month</option>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select className={selectClass} value={filters.year ?? ''} onChange={(event) => updateFilter('year', event.target.value)}>
            <option value="">Year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select className={selectClass} value={filters.company ?? ''} onChange={(event) => updateFilter('company', event.target.value)}>
            <option value="">Company</option>
            {companyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={filters.majorDepartment ?? ''}
            onChange={(event) => updateFilter('majorDepartment', event.target.value)}
          >
            <option value="">Major Department</option>
            {majorDepartmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select className={selectClass} value={filters.department ?? ''} onChange={(event) => updateFilter('department', event.target.value)}>
            <option value="">Department / Section</option>
            {departmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select className={selectClass} value={filters.branch ?? ''} onChange={(event) => updateFilter('branch', event.target.value)}>
            <option value="">Branch</option>
            {branchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {showEmployee && (
            <select className={selectClass} value={filters.employee ?? ''} onChange={(event) => updateFilter('employee', event.target.value)}>
              <option value="">Employee</option>
              {employeeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {showStatus && (
            <select className={selectClass} value={filters.status ?? ''} onChange={(event) => updateFilter('status', event.target.value)}>
              <option value="">All Status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {showPaymentMode && (
            <select className={selectClass} value={filters.paymentMode ?? ''} onChange={(event) => updateFilter('paymentMode', event.target.value)}>
              <option value="">Payment Mode</option>
              {paymentModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Apply / Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
