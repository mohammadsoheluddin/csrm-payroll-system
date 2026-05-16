import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmployeeProfileDocumentTab } from '@/features/employees/employee-documents/components/EmployeeProfileDocumentTab'
import type { EmployeeRecord } from '@/features/employees/types/employee.types'
import {
  getEmployeeDisplayName,
  getEmployeeFullName,
  getEmployeeInitials,
  getEmployeeReferenceLabel,
  getEmploymentStatusLabel,
} from '@/features/employees/utils/employee.utils'
import { formatDateTime, toTitleCase } from '@/lib/format/record.utils'
import { cn } from '@/lib/utils/cn'

export type EmployeeProfileDrawerProps = {
  employee: EmployeeRecord | null
  isOpen: boolean
  onClose: () => void
}

const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="rounded-2xl border border-border bg-background p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-semibold text-foreground">{value || '—'}</p>
  </div>
)

const SectionTitle = ({ icon: Icon, title }: { icon: typeof UserRound; title: string }) => (
  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
    <Icon className="h-4 w-4 text-primary" />
    {title}
  </div>
)

export const EmployeeProfileDrawer = ({ employee, isOpen, onClose }: EmployeeProfileDrawerProps) => {
  if (!employee) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition',
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close employee profile overlay"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto border-l border-border bg-card shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Employee Profile</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">{getEmployeeDisplayName(employee)}</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close employee profile">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 p-6">
          <div className="overflow-hidden rounded-3xl border border-border bg-muted/30">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary text-2xl font-black text-primary-foreground shadow-sm">
                {getEmployeeInitials(employee)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={employee.status === 'active' ? 'success' : 'muted'}>{toTitleCase(employee.status ?? 'unknown')}</Badge>
                  <Badge variant="default">{getEmploymentStatusLabel(employee.employmentStatus)}</Badge>
                  <Badge variant="muted">{toTitleCase(employee.payType)}</Badge>
                </div>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{getEmployeeFullName(employee)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {getEmployeeReferenceLabel(employee.designation)} • {getEmployeeReferenceLabel(employee.department)}
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <SectionTitle icon={UserRound} title="Personal & Contact" />
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Employee ID" value={employee.employeeId} />
              <InfoItem label="Office ID" value={employee.officeId} />
              <InfoItem label="Card No" value={employee.cardNo} />
              <InfoItem label="Gender" value={toTitleCase(employee.gender)} />
              <InfoItem label="Date of Birth" value={employee.dateOfBirth} />
              <InfoItem label="Email" value={employee.email} />
              <InfoItem label="Phone" value={employee.phone} />
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle icon={BriefcaseBusiness} title="Office Information" />
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Company" value={getEmployeeReferenceLabel(employee.company)} />
              <InfoItem label="Branch" value={getEmployeeReferenceLabel(employee.branch)} />
              <InfoItem label="Major Department" value={getEmployeeReferenceLabel(employee.majorDepartment)} />
              <InfoItem label="Department / Section" value={getEmployeeReferenceLabel(employee.department)} />
              <InfoItem label="Designation" value={getEmployeeReferenceLabel(employee.designation)} />
              <InfoItem label="Joining Date" value={employee.joiningDate} />
              <InfoItem label="Confirmation Date" value={employee.confirmationDate} />
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle icon={BadgeDollarSign} title="Payroll Foundation" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Service Type" value={toTitleCase(employee.serviceType)} />
              <InfoItem label="Pay Type" value={toTitleCase(employee.payType)} />
              <InfoItem label="Duty Hour / Day" value={employee.dutyHourPerDay} />
              <InfoItem label="Leave Day" value={employee.leaveDay} />
              <InfoItem label="Basic Salary" value={employee.basicSalary ?? 0} />
            </div>
          </section>

          <EmployeeProfileDocumentTab employee={employee} />

          <section className="space-y-3">
            <SectionTitle icon={ShieldCheck} title="Lifecycle & Audit Snapshot" />
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Employment Status" value={getEmploymentStatusLabel(employee.employmentStatus)} />
              <InfoItem label="Lifecycle Effective Date" value={employee.lifecycleEffectiveDate} />
              <InfoItem label="Lifecycle Reason" value={employee.lifecycleChangeReason} />
              <InfoItem label="Separated At" value={employee.separatedAt} />
              <InfoItem label="Separation Reason" value={employee.separationReason} />
              <InfoItem label="Last Updated" value={formatDateTime(employee.updatedAt)} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              Next profile tabs planned
            </div>
            <p className="mt-2">
              Future employee profile tabs will connect salary structure, bank payment options, attendance summary,
              leave ledger, movement history, audit trail, and richer document attachment actions.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="muted"><Mail className="mr-1 h-3 w-3" /> HR letters</Badge>
              <Badge variant="muted"><Phone className="mr-1 h-3 w-3" /> Contacts</Badge>
              <Badge variant="muted">Bank Info</Badge>
              <Badge variant="muted">Audit Trail</Badge>
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}
