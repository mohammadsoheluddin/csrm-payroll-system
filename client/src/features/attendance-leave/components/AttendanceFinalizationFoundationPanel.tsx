import {
  CalendarRange,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
  UnlockKeyhole,
} from 'lucide-react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAttendanceFinalization } from '@/features/attendance-leave/hooks/useAttendanceFinalization'
import type { AttendanceFinalizationStatus } from '@/features/attendance-leave/types/attendanceLeave.types'
import { toTitleCase } from '@/lib/format/record.utils'

export type AttendanceFinalizationFoundationPanelProps = {
  selectedMonth: string
  onMonthChange: (month: string) => void
  company?: string
  department?: string
  employee?: string
  canReadFinalization: boolean
  canProcessFinalization: boolean
  canApproveFinalization: boolean
  canLockFinalization: boolean
  canUnlockFinalization: boolean
}

const statusVariant: Record<AttendanceFinalizationStatus, 'muted' | 'default' | 'warning' | 'success'> = {
  draft: 'muted',
  finalized: 'default',
  approved: 'warning',
  locked: 'success',
}

const checklistItems = [
  'Daily attendance import / manual entry review',
  'Absent, leave, late, and half-day exceptions reviewed',
  'Manual entries checked with remarks',
  'Month summary ready for payroll handoff',
]

const parseMonth = (value: string) => {
  const [year, month] = value.split('-').map(Number)
  return { month, year }
}

export const AttendanceFinalizationFoundationPanel = ({
  selectedMonth,
  onMonthChange,
  company,
  department,
  employee,
  canReadFinalization,
  canProcessFinalization,
  canApproveFinalization,
  canLockFinalization,
  canUnlockFinalization,
}: AttendanceFinalizationFoundationPanelProps) => {
  const params = {
    payrollMonth: selectedMonth,
    company,
    department,
    employee,
  }
  const {
    recordsQuery,
    summaryQuery,
    generate,
    runAction,
    isGenerating,
    isRunningAction,
  } = useAttendanceFinalization({
    params,
    enabled: canReadFinalization,
  })

  const summary = summaryQuery.data
  const readiness = summary?.readiness
  const totalRecords = readiness?.totalRecords ?? 0
  const isBusy = isGenerating || isRunningAction
  const actionScope =
    company && selectedMonth
      ? {
          payrollMonth: selectedMonth,
          company,
          department: department || undefined,
          employee: employee || undefined,
          strict: true,
        }
      : null

  const handleGenerate = () => {
    if (!company) return
    const { month, year } = parseMonth(selectedMonth)
    generate({
      month,
      year,
      company,
      department: department || undefined,
      employee: employee || undefined,
      overwrite: false,
    })
  }

  const handleBulkAction = (action: 'finalize' | 'approve' | 'lock' | 'unlock') => {
    if (!actionScope) return
    runAction(action, actionScope)
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CalendarRange className="h-4 w-4" />
            Monthly Attendance Finalization
          </div>
          <h2 className="mt-2 text-base font-semibold text-foreground">Payroll-ready attendance workflow</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            Generate, finalize, approve, and lock monthly attendance before salary-sheet or payroll processing.
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

      {!canReadFinalization ? (
        <div className="mt-5">
          <EmptyState
            title="Finalization actions are unavailable"
            message="This role can review attendance records but does not currently have attendance finalization access."
          />
        </div>
      ) : !company ? (
        <div className="mt-5">
          <EmptyState
            title="Choose a company to begin"
            message="Attendance finalization is company-scoped. Select a company filter to load readiness, generate records, and run month actions."
          />
        </div>
      ) : summaryQuery.isLoading || recordsQuery.isLoading ? (
        <div className="mt-5">
          <LoadingState title="Loading attendance finalization workflow..." />
        </div>
      ) : summaryQuery.isError ? (
        <div className="mt-5">
          <ApiErrorState error={summaryQuery.error} onRetry={() => void summaryQuery.refetch()} />
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ClipboardCheck className="h-4 w-4" />
                Validation checklist
              </div>
              <div className="mt-3 space-y-3">
                {checklistItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl bg-card px-3 py-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <LockKeyhole className="h-4 w-4" />
                    Workflow status
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void recordsQuery.refetch()
                      void summaryQuery.refetch()
                    }}
                    disabled={summaryQuery.isFetching || recordsQuery.isFetching}
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>

                {totalRecords === 0 ? (
                  <div className="mt-3">
                    <EmptyState
                      title="No finalization generated yet"
                      message="Generate monthly attendance finalization records to begin the live workflow for this selection."
                    />
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {(Object.entries(summary?.statusSummary ?? {}) as Array<[AttendanceFinalizationStatus, number]>).map(
                      ([status, count]) => (
                        <div key={status} className="rounded-xl bg-card p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                              {toTitleCase(status)}
                            </p>
                            <Badge variant={statusVariant[status]}>{count}</Badge>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {readiness && (
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={readiness.canProcessSalarySheet ? 'success' : 'warning'}>
                      {readiness.canProcessSalarySheet ? 'Payroll ready' : 'Payroll blocked'}
                    </Badge>
                    <Badge variant={readiness.isFullyLocked ? 'success' : 'muted'}>
                      {summary?.lockSummary.locked ?? 0} locked
                    </Badge>
                    <Badge variant="muted">{summary?.lockSummary.unlocked ?? 0} unlocked</Badge>
                  </div>

                  {readiness.blockers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {readiness.blockers.map((blocker) => (
                        <p key={blocker} className="text-sm leading-6 text-muted-foreground">
                          {blocker}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {canProcessFinalization && (
              <>
                <Button type="button" variant="outline" onClick={handleGenerate} disabled={isBusy}>
                  <ShieldCheck className="h-4 w-4" />
                  Generate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleBulkAction('finalize')}
                  disabled={isBusy || totalRecords === 0 || (summary?.statusSummary.draft ?? 0) === 0}
                >
                  Finalize
                </Button>
              </>
            )}
            {canApproveFinalization && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleBulkAction('approve')}
                disabled={isBusy || totalRecords === 0 || (summary?.statusSummary.finalized ?? 0) === 0}
              >
                Approve
              </Button>
            )}
            {canLockFinalization && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleBulkAction('lock')}
                disabled={isBusy || totalRecords === 0 || (summary?.statusSummary.approved ?? 0) === 0}
              >
                <LockKeyhole className="h-4 w-4" />
                Lock
              </Button>
            )}
            {canUnlockFinalization && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleBulkAction('unlock')}
                disabled={isBusy || totalRecords === 0 || (summary?.statusSummary.locked ?? 0) === 0}
              >
                <UnlockKeyhole className="h-4 w-4" />
                Unlock
              </Button>
            )}
          </div>
        </>
      )}

      <div className="mt-5 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
        <p>
          Payroll should consume locked/finalized attendance summaries, not raw attendance rows. Native payroll already
          blocks processing until the selected attendance finalizations are locked.
        </p>
      </div>
    </Card>
  )
}
