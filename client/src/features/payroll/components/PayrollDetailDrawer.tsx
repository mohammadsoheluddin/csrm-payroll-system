import { X } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { PayrollRecord, PayrollWorkflowRecord } from '@/features/payroll/types/payroll.types'
import {
  formatCurrency,
  formatPayrollDate,
  getEmployeeDisplayName,
  getReferenceDisplay,
  getStatusBadgeVariant,
} from '@/features/payroll/utils/payroll.utils'

type PayrollDetailDrawerProps = {
  record: PayrollRecord | PayrollWorkflowRecord | null
  onClose: () => void
  title?: string
}

const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-semibold text-foreground">{value || '—'}</p>
  </div>
)

export const PayrollDetailDrawer = ({ record, onClose, title = 'Payroll Record Detail' }: PayrollDetailDrawerProps) => {
  if (!record) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm">
      <Card className="h-full w-full max-w-xl overflow-y-auto rounded-none border-y-0 border-r-0 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-card/95 p-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{title}</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">{getEmployeeDisplayName(record)}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={getStatusBadgeVariant(record.status, record.isLocked)}>{record.status ?? 'Unknown'}</Badge>
              {record.isLocked && <Badge variant="warning">Locked</Badge>}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <InfoRow label="Payroll Month" value={record.payrollMonth ?? `${record.year ?? ''}-${record.month ?? ''}`} />
            <InfoRow label="Company" value={getReferenceDisplay(record.company ?? record.snapshot?.employee?.company)} />
            <InfoRow label="Department" value={getReferenceDisplay(record.department ?? record.snapshot?.employee?.department)} />
            <InfoRow label="Designation" value={getReferenceDisplay(record.designation ?? record.snapshot?.employee?.designation)} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <InfoRow label="Gross Salary" value={formatCurrency(record.grossSalary)} />
            <InfoRow label="Total Deduction" value={formatCurrency(record.totalDeduction ?? record.fixedDeduction)} />
            <InfoRow label="Net Salary" value={formatCurrency(record.netSalary)} />
            <InfoRow label="Payable Salary" value={formatCurrency(record.finalPayableSalary ?? record.payableSalary)} />
          </div>

          {'bankAmount' in record && (
            <div className="grid gap-3 md:grid-cols-3">
              <InfoRow label="Bank" value={formatCurrency(record.bankAmount)} />
              <InfoRow label="Cash" value={formatCurrency(record.cashAmount)} />
              <InfoRow label="Mobile" value={formatCurrency(record.mobileBankingAmount)} />
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <InfoRow label="Created" value={formatPayrollDate(record.createdAt)} />
            <InfoRow label="Updated" value={formatPayrollDate(record.updatedAt)} />
          </div>

          {record.remarks && (
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remarks</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{String(record.remarks)}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
