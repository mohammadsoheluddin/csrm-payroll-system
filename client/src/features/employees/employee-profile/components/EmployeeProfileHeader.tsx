import { ArrowLeft, CalendarDays, FileText, Printer, RefreshCcw, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buildEmployeeDocumentsPath, routePaths } from '@/config/routePaths'
import type { EmployeeProfileResponse } from '@/features/employees/employee-profile/types/employeeProfile.types'
import { getProfileReferenceLabel } from '@/features/employees/employee-profile/utils/employeeProfile.utils'
import { toTitleCase } from '@/lib/format/record.utils'

export type EmployeeProfileHeaderProps = {
  profile: EmployeeProfileResponse
  isRefreshing: boolean
  onRefresh: () => void
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'EP'
}

export const EmployeeProfileHeader = ({ profile, isRefreshing, onRefresh }: EmployeeProfileHeaderProps) => {
  const navigate = useNavigate()
  const { summary } = profile
  const selectedMonthLabel = profile.selectedPayrollMonth || 'All payroll months'

  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/30 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button type="button" variant="outline" size="icon" onClick={() => navigate(routePaths.employees)} aria-label="Back to employees">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Part-F19 digital service book</Badge>
                <Badge variant="muted">Generated {new Date(profile.profileGeneratedAt).toLocaleString('en-GB')}</Badge>
                <Badge variant="default">{selectedMonthLabel}</Badge>
              </div>
              <h2 className="mt-2 truncate text-2xl font-black tracking-tight text-foreground">{summary.employeeName}</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(buildEmployeeDocumentsPath(summary.employeeDbId))}>
              <FileText className="h-4 w-4" />
              Documents
            </Button>
            <Button type="button" variant="primary" onClick={() => navigate(routePaths.employees)}>
              <UserRound className="h-4 w-4" />
              Directory
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-primary text-3xl font-black text-primary-foreground shadow-sm">
            {getInitials(summary.employeeName)}
          </div>
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={summary.status === 'active' ? 'success' : 'muted'}>{toTitleCase(summary.status ?? 'unknown')}</Badge>
              <Badge variant="default">{toTitleCase(summary.employmentStatus ?? 'unknown')}</Badge>
              <Badge variant="muted">{toTitleCase(summary.serviceType ?? 'service type')}</Badge>
              <Badge variant="muted">{toTitleCase(summary.payType ?? 'pay type')}</Badge>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
              <span><span className="font-semibold text-foreground">Employee ID:</span> {summary.employeeId}</span>
              <span><span className="font-semibold text-foreground">Office ID:</span> {summary.officeId || '—'}</span>
              <span><span className="font-semibold text-foreground">Card No:</span> {summary.cardNo || '—'}</span>
              <span><span className="font-semibold text-foreground">Company:</span> {getProfileReferenceLabel(summary.company)}</span>
              <span><span className="font-semibold text-foreground">Department:</span> {getProfileReferenceLabel(summary.department)}</span>
              <span><span className="font-semibold text-foreground">Designation:</span> {getProfileReferenceLabel(summary.designation)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground sm:grid-cols-2 xl:min-w-[340px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">Joining</p>
            <p className="mt-1 font-semibold text-foreground">{summary.joiningDate || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">Confirmation</p>
            <p className="mt-1 font-semibold text-foreground">{summary.confirmationDate || '—'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <CalendarDays className="h-3.5 w-3.5" /> Selected year
            </p>
            <p className="mt-1 font-semibold text-foreground">{profile.selectedYear}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
