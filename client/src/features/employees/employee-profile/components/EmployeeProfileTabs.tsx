import {
  AlertTriangle,
  Banknote,
  BriefcaseBusiness,
  CalendarCheck,
  FileArchive,
  FileText,
  GitBranch,
  History,
  Landmark,
  UserRound,
  WalletCards,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buildEmployeeDocumentsPath } from '@/config/routePaths'
import type {
  EmployeeProfileResponse,
  EmployeeProfileTimelineEvent,
} from '@/features/employees/employee-profile/types/employeeProfile.types'
import {
  formatCompactNumber,
  formatCurrency,
  getNumberValue,
  getProfileReferenceLabel,
  getRecordDisplayId,
  getStringValue,
  getTimelineEventId,
} from '@/features/employees/employee-profile/utils/employeeProfile.utils'
import { formatDateTime, getReferenceLabel, toTitleCase } from '@/lib/format/record.utils'
import { cn } from '@/lib/utils/cn'

import { EmployeeProfileEmptyState } from './EmployeeProfileEmptyState'
import { EmployeeProfileReadinessPanel } from './EmployeeProfileReadinessPanel'
import { ProfileField, ProfileInfoCard } from './ProfileInfoCard'

const tabs = [
  { key: 'overview', label: 'Overview', icon: UserRound },
  { key: 'payroll', label: 'Payroll', icon: Banknote },
  { key: 'attendance', label: 'Attendance & Leave', icon: CalendarCheck },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'timeline', label: 'Timeline', icon: History },
] as const

type TabKey = (typeof tabs)[number]['key']

type EmployeeProfileTabsProps = {
  profile: EmployeeProfileResponse
}

const compactDate = (value: unknown) => {
  if (typeof value !== 'string' || !value) {
    return '—'
  }

  return value.slice(0, 10)
}

const RowList = ({ records, emptyMessage }: { records: Record<string, unknown>[]; emptyMessage: string }) => {
  if (!records.length) {
    return (
      <EmployeeProfileEmptyState
        icon={<FileText className="h-5 w-5" />}
        title="No records yet"
        message={emptyMessage}
      />
    )
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
      {records.map((record) => (
        <div key={getRecordDisplayId(record)} className="grid gap-2 bg-background p-4 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {String(record.title ?? record.category ?? record.payrollMonth ?? record.movementType ?? record.bankName ?? getRecordDisplayId(record))}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {String(record.remarks ?? record.reason ?? record.documentNo ?? record.status ?? 'No additional note')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {typeof record.status === 'string' && <Badge variant="muted">{toTitleCase(record.status)}</Badge>}
            {Boolean(record.createdAt || record.effectiveDate || record.payrollMonth || record.issueDate) && (
              <Badge variant="default">
                {compactDate(record.effectiveDate ?? record.payrollMonth ?? record.issueDate ?? record.createdAt)}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const TimelineList = ({ timeline }: { timeline: EmployeeProfileTimelineEvent[] }) => {
  if (!timeline.length) {
    return (
      <EmployeeProfileEmptyState
        icon={<History className="h-5 w-5" />}
        title="No timeline yet"
        message="No joining, movement, document, salary, payroll, or legacy archive timeline event was found for this employee yet."
      />
    )
  }

  return (
    <div className="space-y-3">
      {timeline.map((event, index) => (
        <div key={getTimelineEventId(event, index)} className="rounded-2xl border border-border bg-background p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{toTitleCase(event.type)}</Badge>
                {event.status && <Badge variant="muted">{toTitleCase(event.status)}</Badge>}
              </div>
              <p className="mt-2 font-semibold text-foreground">{event.title}</p>
              {event.description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.description}</p>}
            </div>
            <p className="shrink-0 text-xs font-semibold text-muted-foreground">{compactDate(event.date)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export const EmployeeProfileTabs = ({ profile }: EmployeeProfileTabsProps) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const { sections, summary } = profile
  const activeSalary = sections.salary.activeSalaryStructure ?? {}
  const latestPayroll = useMemo(
    () => sections.salary.latestPayroll ?? sections.salary.latestSalarySheet ?? {},
    [sections.salary.latestPayroll, sections.salary.latestSalarySheet],
  )
  const primaryPayment = sections.payment.primaryBankInfo ?? {}
  const leaveTotals = sections.leave.totals ?? {}

  const latestRows = useMemo(
    () => [
      { label: 'Latest native payroll', value: getStringValue(latestPayroll, 'payrollMonth') },
      { label: 'Final payable', value: formatCurrency(latestPayroll.finalPayableSalary ?? latestPayroll.netPayable ?? latestPayroll.netSalary) },
      { label: 'Leave remaining', value: formatCompactNumber(leaveTotals.remainingDays ?? leaveTotals.availableDays ?? 0) },
      { label: 'Legacy archive rows', value: sections.legacySalaryArchive.count },
    ],
    [latestPayroll, leaveTotals.remainingDays, leaveTotals.availableDays, sections.legacySalaryArchive.count],
  )

  const tabCounters: Record<TabKey, number> = {
    overview: sections.dataGaps.length,
    payroll:
      (sections.payrollHistory.nativePayroll?.length ?? 0) +
      (sections.payrollHistory.salarySheets?.length ?? 0) +
      sections.legacySalaryArchive.count,
    attendance: (sections.attendance.history?.length ?? 0) + (sections.leave.balances?.length ?? 0),
    documents: sections.documents.count,
    timeline: sections.timeline.length + sections.movements.count,
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto rounded-3xl border border-border bg-card p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tabCounters[tab.key] > 0 && (
                <span
                  className={cn(
                    'ml-1 rounded-full px-2 py-0.5 text-[10px] font-black',
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {tabCounters[tab.key]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <ProfileInfoCard title="Personal & Contact" description="Primary employee identity and contact data." icon={<UserRound className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField label="Full Name" value={String(sections.personal.fullName ?? summary.employeeName)} />
              <ProfileField label="Email" value={String(sections.personal.email ?? '—')} />
              <ProfileField label="Phone" value={String(sections.personal.phone ?? '—')} />
              <ProfileField label="Gender" value={toTitleCase(String(sections.personal.gender ?? '—'))} />
              <ProfileField label="Date of Birth" value={String(sections.personal.dateOfBirth ?? '—')} />
              <ProfileField label="Linked User" value={getReferenceLabel(sections.personal.user)} />
            </div>
          </ProfileInfoCard>

          <ProfileInfoCard title="Office Information" description="Company, department, designation, branch and joining foundation." icon={<BriefcaseBusiness className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField label="Company" value={getProfileReferenceLabel(sections.office.company)} />
              <ProfileField label="Major Department" value={getProfileReferenceLabel(sections.office.majorDepartment)} />
              <ProfileField label="Department / Section" value={getProfileReferenceLabel(sections.office.department)} />
              <ProfileField label="Designation" value={getProfileReferenceLabel(sections.office.designation)} />
              <ProfileField label="Branch" value={getProfileReferenceLabel(sections.office.branch)} />
              <ProfileField label="Joining Date" value={String(sections.office.joiningDate ?? '—')} />
              <ProfileField label="Confirmation Date" value={String(sections.office.confirmationDate ?? '—')} />
              <ProfileField label="Duty Hour / Day" value={String(sections.office.dutyHourPerDay ?? '—')} />
            </div>
          </ProfileInfoCard>

          <ProfileInfoCard title="Lifecycle Snapshot" description="Current lifecycle state and latest lifecycle change information." icon={<AlertTriangle className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField label="System Status" value={toTitleCase(String(sections.lifecycle.status ?? '—'))} />
              <ProfileField label="Employment Status" value={toTitleCase(String(sections.lifecycle.employmentStatus ?? '—'))} />
              <ProfileField label="Effective Date" value={String(sections.lifecycle.lifecycleEffectiveDate ?? '—')} />
              <ProfileField label="Changed At" value={formatDateTime(sections.lifecycle.lifecycleChangedAt)} />
              <ProfileField label="Reason" value={String(sections.lifecycle.lifecycleChangeReason ?? '—')} />
              <ProfileField label="Last Updated" value={formatDateTime(sections.lifecycle.updatedAt)} />
            </div>
          </ProfileInfoCard>

          <ProfileInfoCard title="Profile Readiness Gaps" description="Safety gaps from backend digital service book aggregation." icon={<AlertTriangle className="h-5 w-5" />} badge={`${sections.dataGaps.length} gaps`}>
            <EmployeeProfileReadinessPanel gaps={sections.dataGaps} />
          </ProfileInfoCard>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <ProfileInfoCard title="Salary Structure" description="Active salary structure and salary history snapshot." icon={<Banknote className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField label="Gross Salary" value={formatCurrency(activeSalary.grossSalary ?? activeSalary.gross ?? activeSalary.totalGross)} />
              <ProfileField label="Basic Salary" value={formatCurrency(activeSalary.basicSalary ?? activeSalary.basic)} />
              <ProfileField label="Net Salary" value={formatCurrency(activeSalary.netSalary ?? activeSalary.netPayable)} />
              <ProfileField label="Effective From" value={String(activeSalary.effectiveFrom ?? '—')} />
            </div>
            <div className="mt-4">
              <RowList records={sections.salary.salaryStructureHistory ?? []} emptyMessage="No salary structure history found." />
            </div>
          </ProfileInfoCard>

          <ProfileInfoCard title="Payment Options" description="Primary bank/cash/mobile payment setup and payment history base." icon={<WalletCards className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField label="Payment Mode" value={String(primaryPayment.paymentMode ?? primaryPayment.type ?? '—')} />
              <ProfileField label="Bank" value={String(primaryPayment.bankName ?? primaryPayment.bank ?? '—')} />
              <ProfileField label="Account No" value={String(primaryPayment.accountNo ?? primaryPayment.accountNumber ?? '—')} />
              <ProfileField label="Status" value={toTitleCase(String(primaryPayment.status ?? '—'))} />
            </div>
            <div className="mt-4">
              <RowList records={sections.payment.paymentOptions ?? []} emptyMessage="No payment option found." />
            </div>
          </ProfileInfoCard>

          <ProfileInfoCard title="Payroll History" description="Native payroll and salary sheet history returned by profile API." icon={<Landmark className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {latestRows.map((item) => <ProfileField key={item.label} label={item.label} value={item.value} />)}
            </div>
            <div className="mt-4 space-y-4">
              <RowList records={sections.payrollHistory.nativePayroll ?? []} emptyMessage="No native payroll records found." />
              <RowList records={sections.payrollHistory.salarySheets ?? []} emptyMessage="No salary sheet records found." />
            </div>
          </ProfileInfoCard>

          <ProfileInfoCard title="Legacy Salary Archive" description={sections.legacySalaryArchive.note ?? 'Archive-only old salary records; not used by native payroll calculation.'} icon={<FileArchive className="h-5 w-5" />} badge={`${sections.legacySalaryArchive.count} rows`}>
            <RowList records={sections.legacySalaryArchive.records} emptyMessage="No legacy salary archive record found for this employee." />
          </ProfileInfoCard>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <ProfileInfoCard title="Attendance Finalization" description="Latest finalized attendance records connected to profile API." icon={<CalendarCheck className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField label="Latest Payroll Month" value={getStringValue(sections.attendance.latestAttendanceFinalization, 'payrollMonth')} />
              <ProfileField label="Present Days" value={getNumberValue(sections.attendance.latestAttendanceFinalization, 'presentDays')} />
              <ProfileField label="Absent Days" value={getNumberValue(sections.attendance.latestAttendanceFinalization, 'absentDays')} />
              <ProfileField label="OT Hours" value={getNumberValue(sections.attendance.latestAttendanceFinalization, 'otHours')} />
            </div>
            <div className="mt-4">
              <RowList records={sections.attendance.history ?? []} emptyMessage="No attendance finalization history found." />
            </div>
          </ProfileInfoCard>

          <ProfileInfoCard title="Leave Ledger Snapshot" description="Year-wise leave balance summary returned by the backend service book API." icon={<CalendarCheck className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField label="Year" value={String(sections.leave.year ?? profile.selectedYear)} />
              <ProfileField label="Leave Types" value={String(sections.leave.leaveTypeCount ?? 0)} />
              <ProfileField label="Opening Balance" value={formatCompactNumber(leaveTotals.openingBalance)} />
              <ProfileField label="Remaining Days" value={formatCompactNumber(leaveTotals.remainingDays ?? leaveTotals.availableDays)} />
              <ProfileField label="Approved Consumed" value={formatCompactNumber(leaveTotals.approvedConsumedDays)} />
              <ProfileField label="Pending Days" value={formatCompactNumber(leaveTotals.pendingDays)} />
            </div>
            <div className="mt-4">
              <RowList records={sections.leave.balances ?? []} emptyMessage="No leave balance rows found for selected year." />
            </div>
          </ProfileInfoCard>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <ProfileInfoCard title="Document Vault" description="Recent employee document metadata connected through Part-B54/B54.1." icon={<FileText className="h-5 w-5" />} badge={`${sections.documents.count} docs`}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileField label="Pending" value={String(sections.documents.pendingCount)} />
              <ProfileField label="Verified" value={String(sections.documents.verifiedCount)} />
              <ProfileField label="Rejected" value={String(sections.documents.rejectedCount)} />
              <ProfileField label="Expired" value={String(sections.documents.expiredCount)} />
            </div>
            <div className="mt-4">
              <RowList records={sections.documents.records} emptyMessage="No employee document record found." />
            </div>
          </ProfileInfoCard>

          <ProfileInfoCard title="Document Actions" description="Open the full document vault to upload, download, verify, reject, delete, or restore documents." icon={<FileText className="h-5 w-5" />}>
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Use the dedicated document screen for actual file upload and verification actions.</p>
              <Button type="button" className="w-full" onClick={() => navigate(buildEmployeeDocumentsPath(summary.employeeDbId))}>
                <FileText className="h-4 w-4" />
                Open Document Vault
              </Button>
            </div>
          </ProfileInfoCard>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <ProfileInfoCard title="Service Book Timeline" description="Joining, confirmation, lifecycle, movement, document, salary, payroll, and legacy archive events." icon={<History className="h-5 w-5" />}>
            <TimelineList timeline={sections.timeline} />
          </ProfileInfoCard>

          <ProfileInfoCard title="Movement History" description="Recent transfer/promotion/effective-date movement history." icon={<GitBranch className="h-5 w-5" />} badge={`${sections.movements.count} movements`}>
            <RowList records={sections.movements.history ?? []} emptyMessage="No employee movement history found." />
          </ProfileInfoCard>
        </div>
      )}
    </div>
  )
}
