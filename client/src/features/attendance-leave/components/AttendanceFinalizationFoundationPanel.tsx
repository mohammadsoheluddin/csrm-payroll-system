import { CalendarRange, CircleAlert, ClipboardCheck, LockKeyhole, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export type AttendanceFinalizationFoundationPanelProps = {
  selectedMonth: string
  onMonthChange: (month: string) => void
  canReadFinalization: boolean
  canProcessFinalization: boolean
  canApproveFinalization: boolean
  canLockFinalization: boolean
}

const checklistItems = [
  'Daily attendance import / manual entry review',
  'Absent, leave, late, and half-day exceptions reviewed',
  'Manual entries checked with remarks',
  'Month summary ready for payroll handoff',
]

export const AttendanceFinalizationFoundationPanel = ({
  selectedMonth,
  onMonthChange,
  canReadFinalization,
  canProcessFinalization,
  canApproveFinalization,
  canLockFinalization,
}: AttendanceFinalizationFoundationPanelProps) => {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CalendarRange className="h-4 w-4" />
            Monthly Attendance Finalization
          </div>
          <h2 className="mt-2 text-base font-semibold text-foreground">Payroll-ready attendance summary foundation</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            This section prepares the future finalization workflow. It does not calculate or lock payroll data in Part-F20.
          </p>
        </div>

        <label className="space-y-2 text-sm font-medium text-foreground">
          <span>Selected Month</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)}
            className="h-11 w-full min-w-[12rem] rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ClipboardCheck className="h-4 w-4" />
            Validation checklist placeholder
          </div>
          <div className="mt-3 space-y-3">
            {checklistItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl bg-card px-3 py-2">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground">
                  -
                </span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <LockKeyhole className="h-4 w-4" />
              Finalize / lock status
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-card p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Finalize</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Pending backend workflow</p>
              </div>
              <div className="rounded-xl bg-card p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Lock</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Pending backend workflow</p>
              </div>
            </div>
          </div>

          {canReadFinalization ? (
            <div className="flex flex-wrap gap-2">
              {canProcessFinalization && (
                <Button type="button" variant="outline" disabled>
                  <ShieldCheck className="h-4 w-4" />
                  Validate Month
                </Button>
              )}
              {canApproveFinalization && (
                <Button type="button" variant="outline" disabled>
                  Finalize Month
                </Button>
              )}
              {canLockFinalization && (
                <Button type="button" variant="outline" disabled>
                  <LockKeyhole className="h-4 w-4" />
                  Lock Month
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Attendance finalization permissions are not available for this role.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
        <p>
          Payroll should consume finalized attendance summaries, not raw attendance rows. Part-F20 keeps this as a UI
          foundation only and does not introduce risky backend calculation logic.
        </p>
      </div>
    </Card>
  )
}
