import { AlertTriangle, Banknote, FileText, GitBranch, ShieldCheck, WalletCards } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import type { EmployeeProfileResponse } from '@/features/employees/employee-profile/types/employeeProfile.types'
import {
  calculateProfileReadinessScore,
  formatCompactNumber,
  formatCurrency,
} from '@/features/employees/employee-profile/utils/employeeProfile.utils'

export type EmployeeProfileStatCardsProps = {
  profile: EmployeeProfileResponse
}

const StatCard = ({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string
  value: string | number
  helper: string
  icon: typeof FileText
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

export const EmployeeProfileStatCards = ({ profile }: EmployeeProfileStatCardsProps) => {
  const sections = profile.sections
  const activeSalary = sections.salary.activeSalaryStructure ?? {}
  const primaryBankInfo = sections.payment.primaryBankInfo ?? {}
  const leaveTotals = sections.leave.totals ?? {}
  const readinessScore = calculateProfileReadinessScore(sections.dataGaps)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        label="Gross salary"
        value={formatCurrency(activeSalary.grossSalary ?? activeSalary.gross ?? activeSalary.totalGross)}
        helper="Active salary structure"
        icon={Banknote}
      />
      <StatCard
        label="Payment options"
        value={sections.payment.paymentOptions?.length ?? 0}
        helper={String(primaryBankInfo.paymentMode ?? primaryBankInfo.bankName ?? 'Primary payment source')}
        icon={WalletCards}
      />
      <StatCard
        label="Documents"
        value={sections.documents.count}
        helper={`${sections.documents.pendingCount} pending, ${sections.documents.verifiedCount} verified`}
        icon={FileText}
      />
      <StatCard
        label="Leave balance"
        value={formatCompactNumber(leaveTotals.remainingDays ?? leaveTotals.availableDays ?? 0)}
        helper={`${sections.leave.leaveTypeCount ?? 0} leave type records`}
        icon={ShieldCheck}
      />
      <StatCard
        label="Movements"
        value={sections.movements.count}
        helper="Effective-date movement history"
        icon={GitBranch}
      />
      <StatCard
        label="Readiness"
        value={`${readinessScore}%`}
        helper={`${sections.dataGaps.length} profile readiness gaps`}
        icon={AlertTriangle}
      />
    </div>
  )
}
