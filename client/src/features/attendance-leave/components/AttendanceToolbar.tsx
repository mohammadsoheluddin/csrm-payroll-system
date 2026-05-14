import { Filter, RefreshCcw, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { attendanceFilterDefaults, attendanceSources, attendanceStatuses } from '@/features/attendance-leave/config/attendanceLeave.constants'
import { EmployeeSelect } from '@/features/attendance-leave/components/EmployeeSelect'
import type { AttendanceLeaveListMode, AttendanceQueryParams, EmployeeSelectOption } from '@/features/attendance-leave/types/attendanceLeave.types'
import { toTitleCase } from '@/lib/format/record.utils'

export type AttendanceToolbarProps = {
  mode: AttendanceLeaveListMode
  filters: AttendanceQueryParams
  employees: EmployeeSelectOption[]
  onModeChange: (mode: AttendanceLeaveListMode) => void
  onFiltersChange: (filters: AttendanceQueryParams) => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export const AttendanceToolbar = ({
  mode,
  filters,
  employees,
  onModeChange,
  onFiltersChange,
  onRefresh,
  isRefreshing,
}: AttendanceToolbarProps) => {
  const updateFilter = (key: keyof AttendanceQueryParams, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      ...(key === 'attendanceDate' && value ? { fromDate: '', toDate: '' } : {}),
      ...((key === 'fromDate' || key === 'toDate') && value ? { attendanceDate: '' } : {}),
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
            <span>Status</span>
            <select
              value={filters.status ?? ''}
              onChange={(event) => updateFilter('status', event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="">All statuses</option>
              {attendanceStatuses.map((status) => (
                <option key={status} value={status}>
                  {toTitleCase(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Source</span>
            <select
              value={filters.source ?? ''}
              onChange={(event) => updateFilter('source', event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="">All sources</option>
              {attendanceSources.map((source) => (
                <option key={source} value={source}>
                  {toTitleCase(source)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Exact Date</span>
            <input
              type="date"
              value={filters.attendanceDate ?? ''}
              onChange={(event) => updateFilter('attendanceDate', event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
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
          <Button type="button" variant="outline" onClick={() => onFiltersChange({ ...attendanceFilterDefaults })}>
            <X className="h-4 w-4" /> Clear
          </Button>
          <Button type="button" variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Filter className="h-4 w-4" />
        Backend-supported filters only: employee, status, source, exact date, and date range.
      </div>
    </div>
  )
}
