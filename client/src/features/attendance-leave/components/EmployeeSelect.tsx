import type { ChangeEvent } from 'react'

import type { EmployeeSelectOption } from '@/features/attendance-leave/types/attendanceLeave.types'
import { cn } from '@/lib/utils/cn'

export type EmployeeSelectProps = {
  value: string
  onChange: (value: string) => void
  options: EmployeeSelectOption[]
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

export const EmployeeSelect = ({
  value,
  onChange,
  options,
  disabled,
  error,
  label = 'Employee',
  required,
}: EmployeeSelectProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value)
  }

  return (
    <label className="space-y-2 text-sm font-medium text-foreground">
      <span>
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/15',
        )}
      >
        <option value="">Select employee</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}{option.meta ? ` (${option.meta})` : ''}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </label>
  )
}
