import { CalendarCheck, ClipboardList, Clock3, ShieldCheck } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import type { AttendanceRecord, LeaveRecord } from '@/features/attendance-leave/types/attendanceLeave.types'

export type AttendanceLeaveStatCardsProps = {
  type: 'attendance' | 'leave'
  records: Array<AttendanceRecord | LeaveRecord>
}

const countBy = <TRecord extends AttendanceRecord | LeaveRecord>(
  records: TRecord[],
  predicate: (record: TRecord) => boolean,
) => records.filter(predicate).length

export const AttendanceLeaveStatCards = ({ type, records }: AttendanceLeaveStatCardsProps) => {
  const total = records.length

  const stats =
    type === 'attendance'
      ? [
          {
            label: 'Total Records',
            value: total,
            icon: CalendarCheck,
            description: 'Current filtered attendance rows',
          },
          {
            label: 'Present / Late',
            value: countBy(records as AttendanceRecord[], (record) => record.status === 'present' || record.status === 'late'),
            icon: ShieldCheck,
            description: 'Payroll-attendance counted statuses',
          },
          {
            label: 'Absent / Leave',
            value: countBy(records as AttendanceRecord[], (record) => record.status === 'absent' || record.status === 'leave'),
            icon: ClipboardList,
            description: 'Exception statuses for review',
          },
          {
            label: 'Manual Source',
            value: countBy(records as AttendanceRecord[], (record) => record.source === 'manual'),
            icon: Clock3,
            description: 'Manual corrections / entries',
          },
        ]
      : [
          {
            label: 'Total Applications',
            value: total,
            icon: ClipboardList,
            description: 'Current filtered leave rows',
          },
          {
            label: 'Pending',
            value: countBy(records as LeaveRecord[], (record) => record.status === 'pending'),
            icon: Clock3,
            description: 'Waiting for approval workflow',
          },
          {
            label: 'Approved',
            value: countBy(records as LeaveRecord[], (record) => record.status === 'approved'),
            icon: ShieldCheck,
            description: 'Approved and active leave records',
          },
          {
            label: 'Management Concern',
            value: countBy(records as LeaveRecord[], (record) => record.managementConcern === true),
            icon: CalendarCheck,
            description: 'Paid/unpaid/others controlled leave',
          },
        ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.description}</p>
              </div>
              <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
