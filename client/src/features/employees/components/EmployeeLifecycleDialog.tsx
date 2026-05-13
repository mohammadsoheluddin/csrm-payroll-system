import { X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { employmentStatusOptions } from '@/features/employees/config/employee.constants'
import type {
  EmployeeLifecyclePayload,
  EmployeeRecord,
  EmploymentStatus,
} from '@/features/employees/types/employee.types'
import { getEmployeeDisplayName } from '@/features/employees/utils/employee.utils'

export type EmployeeLifecycleDialogProps = {
  employee: EmployeeRecord | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (payload: EmployeeLifecyclePayload) => void
}

const inputClass =
  'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

export const EmployeeLifecycleDialog = ({
  employee,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: EmployeeLifecycleDialogProps) => {
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>(employee?.employmentStatus ?? 'active')
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')

  if (!isOpen || !employee) {
    return null
  }

  const submit = () => {
    onSubmit({
      employmentStatus,
      effectiveDate,
      reason,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/40 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Lifecycle Change</p>
            <h3 className="mt-1 text-lg font-bold text-foreground">{getEmployeeDisplayName(employee)}</h3>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close lifecycle dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Employment Status *</label>
            <select
              value={employmentStatus}
              onChange={(event) => setEmploymentStatus(event.target.value as EmploymentStatus)}
              className={inputClass}
            >
              {employmentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Effective Date</label>
            <input value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} className={inputClass} type="date" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason *</label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Write the HR/Admin reason for this lifecycle change."
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={isSubmitting || reason.trim().length === 0}>
              {isSubmitting ? 'Saving...' : 'Save Lifecycle'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
