import { FilterX, Search } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import {
  employeeFilterDefaults,
  employeeStatusOptions,
  employmentStatusOptions,
  payTypeOptions,
  serviceTypeOptions,
} from '@/features/employees/config/employee.constants'
import type { EmployeeQueryParams, EmployeeSelectOption } from '@/features/employees/types/employee.types'

export type EmployeeDirectoryToolbarProps = {
  searchText: string
  onSearchTextChange: (value: string) => void
  filters: EmployeeQueryParams
  onFiltersChange: (filters: EmployeeQueryParams) => void
  companyOptions: EmployeeSelectOption[]
  majorDepartmentOptions: EmployeeSelectOption[]
  departmentOptions: EmployeeSelectOption[]
  designationOptions: EmployeeSelectOption[]
  branchOptions: EmployeeSelectOption[]
}

const renderSelectOptions = (options: EmployeeSelectOption[]) => {
  return options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))
}

export const EmployeeDirectoryToolbar = ({
  searchText,
  onSearchTextChange,
  filters,
  onFiltersChange,
  companyOptions,
  majorDepartmentOptions,
  departmentOptions,
  designationOptions,
  branchOptions,
}: EmployeeDirectoryToolbarProps) => {
  const updateFilter = (name: keyof EmployeeQueryParams, value: string) => {
    const nextFilters: EmployeeQueryParams = {
      ...filters,
      [name]: value,
    }

    if (name === 'company') {
      nextFilters.majorDepartment = ''
      nextFilters.department = ''
      nextFilters.designation = ''
    }

    if (name === 'majorDepartment') {
      nextFilters.department = ''
    }

    onFiltersChange(nextFilters)
  }

  const clearFilters = () => {
    onSearchTextChange('')
    onFiltersChange({ ...employeeFilterDefaults })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="Search employee ID, name, office ID, card no, phone, email..."
            className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Button type="button" variant="outline" onClick={clearFilters}>
          <FilterX className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        <select
          value={filters.company ?? ''}
          onChange={(event) => updateFilter('company', event.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All companies</option>
          {renderSelectOptions(companyOptions)}
        </select>

        <select
          value={filters.majorDepartment ?? ''}
          onChange={(event) => updateFilter('majorDepartment', event.target.value)}
          disabled={!filters.company}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">All major departments</option>
          {renderSelectOptions(majorDepartmentOptions)}
        </select>

        <select
          value={filters.department ?? ''}
          onChange={(event) => updateFilter('department', event.target.value)}
          disabled={!filters.company || !filters.majorDepartment}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">All departments</option>
          {renderSelectOptions(departmentOptions)}
        </select>

        <select
          value={filters.designation ?? ''}
          onChange={(event) => updateFilter('designation', event.target.value)}
          disabled={!filters.company}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">All designations</option>
          {renderSelectOptions(designationOptions)}
        </select>

        <select
          value={filters.branch ?? ''}
          onChange={(event) => updateFilter('branch', event.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All branches</option>
          {renderSelectOptions(branchOptions)}
        </select>

        <select
          value={filters.status ?? ''}
          onChange={(event) => updateFilter('status', event.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All system status</option>
          {renderSelectOptions(employeeStatusOptions)}
        </select>

        <select
          value={filters.employmentStatus ?? ''}
          onChange={(event) => updateFilter('employmentStatus', event.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All lifecycle status</option>
          {renderSelectOptions(employmentStatusOptions)}
        </select>

        <select
          value={filters.serviceType ?? ''}
          onChange={(event) => updateFilter('serviceType', event.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All service type</option>
          {renderSelectOptions(serviceTypeOptions)}
        </select>

        <select
          value={filters.payType ?? ''}
          onChange={(event) => updateFilter('payType', event.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All pay type</option>
          {renderSelectOptions(payTypeOptions)}
        </select>
      </div>
    </div>
  )
}
