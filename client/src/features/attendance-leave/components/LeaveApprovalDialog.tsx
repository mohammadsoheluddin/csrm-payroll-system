import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { leaveApprovalStatuses } from '@/features/attendance-leave/config/attendanceLeave.constants'
import type { LeaveApprovalPayload, LeaveApprovalStatus, LeaveRecord } from '@/features/attendance-leave/types/attendanceLeave.types'
import {
  getAttendanceLeaveEmployeeName,
  getRecordId,
} from '@/features/attendance-leave/utils/attendanceLeave.utils'
import { toTitleCase } from '@/lib/format/record.utils'

export type LeaveApprovalDialogProps = {
  record: LeaveRecord
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (id: string, payload: LeaveApprovalPayload) => void
}

export const LeaveApprovalDialog = ({
  record,
  isSubmitting,
  onClose,
  onSubmit,
}: LeaveApprovalDialogProps) => {
  const [status, setStatus] = useState<LeaveApprovalStatus>('approved')
  const [approvalNote, setApprovalNote] = useState('')


  const recordId = getRecordId(record)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Review Leave Application</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {getAttendanceLeaveEmployeeName(record)} · {record.startDate} to {record.endDate}
            </p>
          </div>
          <Badge variant="warning">{toTitleCase(record.status ?? 'pending')}</Badge>
        </div>

        <div className="mt-5 space-y-4">
          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Approval Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as LeaveApprovalStatus)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {leaveApprovalStatuses.map((approvalStatus) => (
                <option key={approvalStatus} value={approvalStatus}>
                  {toTitleCase(approvalStatus)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            <span>Approval Note</span>
            <textarea
              value={approvalNote}
              onChange={(event) => setApprovalNote(event.target.value)}
              placeholder="Optional approval/rejection/cancellation note"
              className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit(recordId, { status, approvalNote: approvalNote.trim() || undefined })}
            disabled={isSubmitting || !recordId}
          >
            {isSubmitting ? 'Saving...' : 'Update Approval'}
          </Button>
        </div>
      </div>
    </div>
  )
}
