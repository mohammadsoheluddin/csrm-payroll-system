import { useMemo, useState } from 'react'

import { FormErrorSummary } from '@/components/feedback/FormErrorSummary'
import { Button } from '@/components/ui/Button'
import { EmployeeSelect } from '@/features/attendance-leave/components/EmployeeSelect'
import {
  calculateDateDiffDays,
  isManagementControlledLeaveType,
  leaveRecordToFormValue,
  toLeavePayload,
} from '@/features/attendance-leave/utils/attendanceLeave.utils'
import { leaveTypes } from '@/features/attendance-leave/config/attendanceLeave.constants'
import type {
  EmployeeSelectOption,
  LeavePayload,
  LeaveRecord,
} from '@/features/attendance-leave/types/attendanceLeave.types'
import { toTitleCase } from '@/lib/format/record.utils'
import { cn } from '@/lib/utils/cn'

export type LeaveFormPanelProps = {
  mode: 'create' | 'edit'
  record?: LeaveRecord | null
  employees: EmployeeSelectOption[]
  isSubmitting?: boolean
  serverError?: string | null
  fieldErrors?: Record<string, string>
  onCancel: () => void
  onSubmit: (payload: Record<string, unknown>) => void
}

const validateLeaveForm = (value: LeavePayload) => {
  const errors: Record<string, string> = {}

  if (!value.employee) {
    errors.employee = 'Employee is required.'
  }

  if (!value.leaveType) {
    errors.leaveType = 'Leave type is required.'
  }

  if (!value.startDate) {
    errors.startDate = 'Start date is required.'
  }

  if (!value.endDate) {
    errors.endDate = 'End date is required.'
  }

  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    errors.endDate = 'End date cannot be earlier than start date.'
  }

  if (!value.reason || value.reason.trim().length < 3) {
    errors.reason = 'Reason must be at least 3 characters.'
  }

  if (isManagementControlledLeaveType(value.leaveType)) {
    if (value.managementConcern !== true) {
      errors.managementConcern = 'Management concern is required for this leave type.'
    }

    if (!value.managementConcernNote?.trim()) {
      errors.managementConcernNote = 'Management concern note is required for this leave type.'
    }
  }

  if (value.leaveType === 'replacement') {
    if (!value.replacementForDate) {
      errors.replacementForDate = 'Replacement for date is required.'
    }

    if (value.startDate && value.endDate && value.startDate !== value.endDate) {
      errors.endDate = 'Replacement leave must be one day only.'
    }

    if (value.startDate && value.replacementForDate && value.startDate <= value.replacementForDate) {
      errors.startDate = 'Replacement leave date must be after the worked holiday date.'
    }
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

export const LeaveFormPanel = ({
  mode,
  record,
  employees,
  isSubmitting,
  serverError,
  fieldErrors = {},
  onCancel,
  onSubmit,
}: LeaveFormPanelProps) => {
  const [value, setValue] = useState<LeavePayload>(() => leaveRecordToFormValue(record))
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})


  const mergedErrors = useMemo(() => ({ ...clientErrors, ...fieldErrors }), [clientErrors, fieldErrors])
  const totalDays = calculateDateDiffDays(value.startDate, value.endDate)
  const requiresManagementConcern = isManagementControlledLeaveType(value.leaveType)
  const isReplacementLeave = value.leaveType === 'replacement'

  const updateValue = (key: keyof LeavePayload, nextValue: string | boolean) => {
    setValue((currentValue) => {
      const nextPayload = { ...currentValue, [key]: nextValue }

      if (key === 'leaveType') {
        if (!isManagementControlledLeaveType(String(nextValue))) {
          nextPayload.managementConcern = false
          nextPayload.managementConcernNote = ''
        }

        if (nextValue !== 'replacement') {
          nextPayload.replacementForDate = ''
        }
      }

      return nextPayload
    })
    setClientErrors((currentErrors) => ({ ...currentErrors, [key]: '' }))
  }

  const handleSubmit = () => {
    const validationErrors = validateLeaveForm(value)
    setClientErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    onSubmit(toLeavePayload(value))
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {mode === 'create' ? 'New Leave Application' : 'Edit Leave Application'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Leave entry foundation respects backend overlap, balance, management concern, and replacement rules.
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
              Leave Type <span className="text-destructive">*</span>
            </span>
            <select
              value={value.leaveType}
              onChange={(event) => updateValue('leaveType', event.target.value)}
              className={inputClassName(Boolean(mergedErrors.leaveType))}
            >
              {leaveTypes.map((leaveType) => (
                <option key={leaveType} value={leaveType}>
                  {toTitleCase(leaveType)}
                </option>
              ))}
            </select>
            {mergedErrors.leaveType && <p className="text-xs font-medium text-destructive">{mergedErrors.leaveType}</p>}
          </label>

          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Calculated Days</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalDays || '—'}</p>
          </div>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>
              Start Date <span className="text-destructive">*</span>
            </span>
            <input
              type="date"
              value={value.startDate}
              onChange={(event) => updateValue('startDate', event.target.value)}
              className={inputClassName(Boolean(mergedErrors.startDate))}
            />
            {mergedErrors.startDate && <p className="text-xs font-medium text-destructive">{mergedErrors.startDate}</p>}
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>
              End Date <span className="text-destructive">*</span>
            </span>
            <input
              type="date"
              value={value.endDate}
              onChange={(event) => updateValue('endDate', event.target.value)}
              className={inputClassName(Boolean(mergedErrors.endDate))}
            />
            {mergedErrors.endDate && <p className="text-xs font-medium text-destructive">{mergedErrors.endDate}</p>}
          </label>

          {isReplacementLeave && (
            <label className="space-y-2 text-sm font-medium text-foreground">
              <span>
                Replacement For Date <span className="text-destructive">*</span>
              </span>
              <input
                type="date"
                value={value.replacementForDate ?? ''}
                onChange={(event) => updateValue('replacementForDate', event.target.value)}
                className={inputClassName(Boolean(mergedErrors.replacementForDate))}
              />
              {mergedErrors.replacementForDate && (
                <p className="text-xs font-medium text-destructive">{mergedErrors.replacementForDate}</p>
              )}
            </label>
          )}

          <label className="space-y-2 text-sm font-medium text-foreground xl:col-span-3">
            <span>
              Reason <span className="text-destructive">*</span>
            </span>
            <textarea
              value={value.reason}
              onChange={(event) => updateValue('reason', event.target.value)}
              className={textareaClassName(Boolean(mergedErrors.reason))}
              placeholder="Write leave reason"
            />
            {mergedErrors.reason && <p className="text-xs font-medium text-destructive">{mergedErrors.reason}</p>}
          </label>

          {requiresManagementConcern && (
            <div className="space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 xl:col-span-3">
              <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={value.managementConcern === true}
                  onChange={(event) => updateValue('managementConcern', event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Management concern confirmed
              </label>
              {mergedErrors.managementConcern && (
                <p className="text-xs font-medium text-destructive">{mergedErrors.managementConcern}</p>
              )}
              <label className="space-y-2 text-sm font-medium text-foreground">
                <span>
                  Management Concern Note <span className="text-destructive">*</span>
                </span>
                <textarea
                  value={value.managementConcernNote ?? ''}
                  onChange={(event) => updateValue('managementConcernNote', event.target.value)}
                  className={textareaClassName(Boolean(mergedErrors.managementConcernNote))}
                  placeholder="Required for paid, unpaid, or others leave"
                />
                {mergedErrors.managementConcernNote && (
                  <p className="text-xs font-medium text-destructive">{mergedErrors.managementConcernNote}</p>
                )}
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Leave' : 'Update Leave'}
          </Button>
        </div>
      </div>
    </div>
  )
}
