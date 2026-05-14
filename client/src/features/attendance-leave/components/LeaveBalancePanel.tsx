import { useQuery } from '@tanstack/react-query'
import { RefreshCcw } from 'lucide-react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getLeaveBalance } from '@/features/attendance-leave/api/attendanceLeave.api'
import type { EmployeeSelectOption } from '@/features/attendance-leave/types/attendanceLeave.types'
import { queryKeys } from '@/lib/query/queryKeys'

export type LeaveBalancePanelProps = {
  employeeId?: string
  year: string | number
  employees: EmployeeSelectOption[]
}

export const LeaveBalancePanel = ({ employeeId, year, employees }: LeaveBalancePanelProps) => {
  const selectedEmployee = employees.find((employee) => employee.value === employeeId)

  const balanceQuery = useQuery({
    queryKey: employeeId ? queryKeys.leave.balance(employeeId, year) : queryKeys.leave.balance('', year),
    queryFn: () => getLeaveBalance({ employeeId: employeeId ?? '', year }),
    enabled: Boolean(employeeId),
  })

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Leave Balance Snapshot</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedEmployee ? selectedEmployee.label : 'Select employee filter to see casual/sick leave balance.'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void balanceQuery.refetch()}
          disabled={!employeeId || balanceQuery.isFetching}
        >
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {!employeeId && (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          Balance API requires one selected employee. Use the Employee filter above.
        </div>
      )}

      {employeeId && balanceQuery.isLoading && <LoadingState title="Loading leave balance..." />}

      {employeeId && balanceQuery.isError && (
        <ApiErrorState error={balanceQuery.error} onRetry={() => void balanceQuery.refetch()} className="mt-4" />
      )}

      {employeeId && balanceQuery.data && (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {balanceQuery.data.balances.map((balance) => (
            <div key={balance.leaveType} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{balance.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Used {balance.usedDays} of {balance.annualLimit} days in {balanceQuery.data.year}
                  </p>
                </div>
                <Badge variant={balance.remainingDays > 0 ? 'success' : 'danger'}>
                  {balance.remainingDays} left
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
