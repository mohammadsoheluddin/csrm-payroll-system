import { useMemo, useState } from 'react'

import { FormErrorSummary } from '@/components/feedback/FormErrorSummary'
import { Button } from '@/components/ui/Button'
import { EmployeeSelect } from '@/features/attendance-leave/components/EmployeeSelect'
import {
  attendanceRecordToFormValue,
  toAttendancePayload,
} from '@/features/attendance-leave/utils/attendanceLeave.utils'
import { attendanceSources, attendanceStatuses } from '@/features/attendance-leave/config/attendanceLeave.constants'
import type {
  AttendancePayload,
  AttendanceRecord,
  EmployeeSelectOption,
} from '@/features/attendance-leave/types/attendanceLeave.types'
import { toTitleCase } from '@/lib/format/record.utils'
import { cn } from '@/lib/utils/cn'

export type AttendanceFormPanelProps = {
  mode: 'create' | 'edit'
  record?: AttendanceRecord | null
  employees: EmployeeSelectOption[]
  isSubmitting?: boolean
  serverError?: string | null
  fieldErrors?: Record<string, string>
  onCancel: () => void
  onSubmit: (payload: Record<string, unknown>) => void
}

const validateAttendanceForm = (value: AttendancePayload) => {
  const errors: Record<string, string> = {}

  if (!value.employee) {
    errors.employee = 'Employee is required.'
  }

  if (!value.attendanceDate) {
    errors.attendanceDate = 'Attendance date is required.'
  }

  if (value.checkInTime && value.checkOutTime && value.checkOutTime < value.checkInTime) {
    errors.checkOutTime = 'Check-out time cannot be earlier than check-in time.'
  }

  return errors
}

const inputClassName = (hasError?: boolean) =>
  cn(
    'h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15',
    hasError && 'border-destructive focus:border-destructive focus:ring-destructive/15',
  )

const textareaClassName = (hasError?: boolean) =>
  cn(
    'min-h-24 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15',
    hasError && 'border-destructive focus:border-destructive focus:ring-destructive/15',
  )

export const AttendanceFormPanel = ({
  mode,
  record,
  employees,
  isSubmitting,
  serverError,
  fieldErrors = {},
  onCancel,
  onSubmit,
}: AttendanceFormPanelProps) => {
  const [value, setValue] = useState<AttendancePayload>(() => attendanceRecordToFormValue(record))
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})


  const mergedErrors = useMemo(() => ({ ...clientErrors, ...fieldErrors }), [clientErrors, fieldErrors])

  const updateValue = (key: keyof AttendancePayload, nextValue: string) => {
    setValue((currentValue) => ({ ...currentValue, [key]: nextValue }))
    setClientErrors((currentErrors) => ({ ...currentErrors, [key]: '' }))
  }

  const handleSubmit = () => {
    const validationErrors = validateAttendanceForm(value)
    setClientErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    onSubmit(toAttendancePayload(value))
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {mode === 'create' ? 'New Attendance Entry' : 'Edit Attendance Entry'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manual attendance entry/correction foundation connected to backend attendance APIs.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Close
        </Button>
      </div>

      <div className="mt-5 space-y-5">
        <FormErrorSummary errors={{}} serverError={serverError ?? Object.values(mergedErrors).find(Boolean)} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <EmployeeSelect
            value={value.employee}
            onChange={(nextValue) => updateValue('employee', nextValue)}
            options={employees}
            error={mergedErrors.employee}
            required
          />

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>
              Attendance Date <span className="text-destructive">*</span>
            </span>
            <input
              type="date"
              value={value.attendanceDate}
              onChange={(event) => updateValue('attendanceDate', event.target.value)}
              className={inputClassName(Boolean(mergedErrors.attendanceDate))}
            />
            {mergedErrors.attendanceDate && <p className="text-xs font-medium text-destructive">{mergedErrors.attendanceDate}</p>}
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Status</span>
            <select
              value={value.status ?? ''}
              onChange={(event) => updateValue('status', event.target.value)}
              className={inputClassName(Boolean(mergedErrors.status))}
            >
              {attendanceStatuses.map((status) => (
                <option key={status} value={status}>
                  {toTitleCase(status)}
                </option>
              ))}
            </select>
            {mergedErrors.status && <p className="text-xs font-medium text-destructive">{mergedErrors.status}</p>}
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Check In</span>
            <input
              type="time"
              value={value.checkInTime ?? ''}
              onChange={(event) => updateValue('checkInTime', event.target.value)}
              className={inputClassName(Boolean(mergedErrors.checkInTime))}
            />
            {mergedErrors.checkInTime && <p className="text-xs font-medium text-destructive">{mergedErrors.checkInTime}</p>}
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Check Out</span>
            <input
              type="time"
              value={value.checkOutTime ?? ''}
              onChange={(event) => updateValue('checkOutTime', event.target.value)}
              className={inputClassName(Boolean(mergedErrors.checkOutTime))}
            />
            {mergedErrors.checkOutTime && <p className="text-xs font-medium text-destructive">{mergedErrors.checkOutTime}</p>}
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Source</span>
            <select
              value={value.source ?? ''}
              onChange={(event) => updateValue('source', event.target.value)}
              className={inputClassName(Boolean(mergedErrors.source))}
            >
              {attendanceSources.map((source) => (
                <option key={source} value={source}>
                  {toTitleCase(source)}
                </option>
              ))}
            </select>
            {mergedErrors.source && <p className="text-xs font-medium text-destructive">{mergedErrors.source}</p>}
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground xl:col-span-3">
            <span>Device ID / Manual Reference</span>
            <input
              type="text"
              value={value.deviceId ?? ''}
              onChange={(event) => updateValue('deviceId', event.target.value)}
              className={inputClassName(Boolean(mergedErrors.deviceId))}
              placeholder="Optional device id or manual correction reference"
            />
            {mergedErrors.deviceId && <p className="text-xs font-medium text-destructive">{mergedErrors.deviceId}</p>}
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground xl:col-span-3">
            <span>Remarks</span>
            <textarea
              value={value.remarks ?? ''}
              onChange={(event) => updateValue('remarks', event.target.value)}
              className={textareaClassName(Boolean(mergedErrors.remarks))}
              placeholder="Optional explanation for manual entry/correction"
            />
            {mergedErrors.remarks && <p className="text-xs font-medium text-destructive">{mergedErrors.remarks}</p>}
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Attendance' : 'Update Attendance'}
          </Button>
        </div>
      </div>
    </div>
  )
}
