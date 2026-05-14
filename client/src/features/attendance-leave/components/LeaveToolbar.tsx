import { Filter, RefreshCcw, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmployeeSelect } from '@/features/attendance-leave/components/EmployeeSelect'
import { leaveFilterDefaults, leaveStatuses, leaveTypes } from '@/features/attendance-leave/config/attendanceLeave.constants'
import type { AttendanceLeaveListMode, EmployeeSelectOption, LeaveQueryParams } from '@/features/attendance-leave/types/attendanceLeave.types'
import { toTitleCase } from '@/lib/format/record.utils'

export type LeaveToolbarProps = {
  mode: AttendanceLeaveListMode
  filters: LeaveQueryParams
  employees: EmployeeSelectOption[]
  onModeChange: (mode: AttendanceLeaveListMode) => void
  onFiltersChange: (filters: LeaveQueryParams) => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export const LeaveToolbar = ({
  mode,
  filters,
  employees,
  onModeChange,
  onFiltersChange,
  onRefresh,
  isRefreshing,
}: LeaveToolbarProps) => {
  const updateFilter = (key: keyof LeaveQueryParams, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <EmployeeSelect
            value={filters.employee ?? ''}
            onChange={(value) => updateFilter('employee', value)}
            options={employees}
            label="Employee"
          />

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Leave Type</span>
            <select
              value={filters.leaveType ?? ''}
              onChange={(event) => updateFilter('leaveType', event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="">All leave types</option>
              {leaveTypes.map((leaveType) => (
                <option key={leaveType} value={leaveType}>
                  {toTitleCase(leaveType)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Status</span>
            <select
              value={filters.status ?? ''}
              onChange={(event) => updateFilter('status', event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="">All statuses</option>
              {leaveStatuses.map((status) => (
                <option key={status} value={status}>
                  {toTitleCase(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>From</span>
            <input
              type="date"
              value={filters.fromDate ?? ''}
              onChange={(event) => updateFilter('fromDate', event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>To</span>
            <input
              type="date"
              value={filters.toDate ?? ''}
              onChange={(event) => updateFilter('toDate', event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Management Concern</span>
            <select
              value={filters.managementConcern ?? ''}
              onChange={(event) => updateFilter('managementConcern', event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={mode === 'active' ? 'primary' : 'outline'}
            onClick={() => onModeChange('active')}
          >
            Active
          </Button>
          <Button
            type="button"
            variant={mode === 'deleted' ? 'primary' : 'outline'}
            onClick={() => onModeChange('deleted')}
          >
            Deleted
          </Button>
          <Button type="button" variant="outline" onClick={() => onFiltersChange({ ...leaveFilterDefaults })}>
            <X className="h-4 w-4" /> Clear
          </Button>
          <Button type="button" variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Filter className="h-4 w-4" />
        Backend-supported filters only: employee, leave type, status, date range, and management concern.
      </div>
    </div>
  )
}
