import { X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  defaultEmployeePayload,
  employmentStatusOptions,
  genderOptions,
  payTypeOptions,
  serviceTypeOptions,
} from '@/features/employees/config/employee.constants'
import type {
  EmployeeFormMode,
  EmployeePayload,
  EmployeeRecord,
  EmployeeSelectOption,
} from '@/features/employees/types/employee.types'
import {
  getEmployeeReferenceId,
  toEmployeeMutationPayload,
} from '@/features/employees/utils/employee.utils'

export type EmployeeFormPanelProps = {
  mode: EmployeeFormMode
  selectedEmployee: EmployeeRecord | null
  isSubmitting: boolean
  serverError?: string | null
  serverFieldErrors?: Record<string, string>
  companyOptions: EmployeeSelectOption[]
  branchOptions: EmployeeSelectOption[]
  getMajorDepartmentOptions: (companyId?: string) => EmployeeSelectOption[]
  getDepartmentOptions: (companyId?: string, majorDepartmentId?: string) => EmployeeSelectOption[]
  getDesignationOptions: (companyId?: string) => EmployeeSelectOption[]
  onClose: () => void
  onSubmit: (payload: Record<string, unknown>) => void
}

const textInputClass =
  'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

const labelClass = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'

const renderOptions = (options: EmployeeSelectOption[]) => {
  return options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))
}

const toPayloadFromEmployee = (employee: EmployeeRecord | null): EmployeePayload => {
  if (!employee) {
    return defaultEmployeePayload()
  }

  return {
    employeeId: employee.employeeId,
    officeId: employee.officeId ?? '',
    cardNo: employee.cardNo ?? '',
    name: {
      firstName: employee.name?.firstName ?? '',
      middleName: employee.name?.middleName ?? '',
      lastName: employee.name?.lastName ?? '',
    },
    email: employee.email ?? '',
    phone: employee.phone ?? '',
    gender: employee.gender ?? 'male',
    dateOfBirth: employee.dateOfBirth ?? '',
    company: getEmployeeReferenceId(employee.company),
    majorDepartment: getEmployeeReferenceId(employee.majorDepartment),
    department: getEmployeeReferenceId(employee.department),
    designation: getEmployeeReferenceId(employee.designation),
    branch: getEmployeeReferenceId(employee.branch),
    joiningDate: employee.joiningDate ?? '',
    confirmationDate: employee.confirmationDate ?? '',
    serviceType: employee.serviceType ?? 'permanent',
    payType: employee.payType ?? 'monthly',
    dutyHourPerDay: employee.dutyHourPerDay ?? 8,
    leaveDay: employee.leaveDay ?? 0,
    employmentStatus: employee.employmentStatus ?? 'active',
    basicSalary: employee.basicSalary ?? 0,
  }
}

export const EmployeeFormPanel = ({
  mode,
  selectedEmployee,
  isSubmitting,
  serverError,
  serverFieldErrors = {},
  companyOptions,
  branchOptions,
  getMajorDepartmentOptions,
  getDepartmentOptions,
  getDesignationOptions,
  onClose,
  onSubmit,
}: EmployeeFormPanelProps) => {
  const [payload, setPayload] = useState<EmployeePayload>(() => toPayloadFromEmployee(selectedEmployee))


  const majorDepartmentOptions = useMemo(
    () => getMajorDepartmentOptions(payload.company),
    [getMajorDepartmentOptions, payload.company],
  )
  const departmentOptions = useMemo(
    () => getDepartmentOptions(payload.company, payload.majorDepartment),
    [getDepartmentOptions, payload.company, payload.majorDepartment],
  )
  const designationOptions = useMemo(
    () => getDesignationOptions(payload.company),
    [getDesignationOptions, payload.company],
  )

  if (mode === 'closed') {
    return null
  }

  const updatePayload = (name: keyof EmployeePayload, value: string) => {
    setPayload((current) => {
      const nextPayload = {
        ...current,
        [name]: value,
      }

      if (name === 'company') {
        nextPayload.majorDepartment = ''
        nextPayload.department = ''
        nextPayload.designation = ''
      }

      if (name === 'majorDepartment') {
        nextPayload.department = ''
      }

      return nextPayload
    })
  }

  const updateName = (name: keyof EmployeePayload['name'], value: string) => {
    setPayload((current) => ({
      ...current,
      name: {
        ...current.name,
        [name]: value,
      },
    }))
  }

  const handleSubmit = () => {
    onSubmit(toEmployeeMutationPayload(payload, mode === 'edit' ? 'edit' : 'create'))
  }

  const title = mode === 'edit' ? 'Edit Employee' : 'Create Employee'
  const subtitle = mode === 'edit' ? 'Update basic HR, office, and payroll setup fields.' : 'Create employee with required HR profile, office, and payroll reference fields.'

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/40 p-5">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close employee form">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6 p-5">
        {serverError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {serverError}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {mode === 'create' && (
            <div className="space-y-1.5">
              <label className={labelClass}>Employee ID *</label>
              <input
                value={payload.employeeId ?? ''}
                onChange={(event) => updatePayload('employeeId', event.target.value)}
                className={textInputClass}
                placeholder="EMP001"
              />
              {serverFieldErrors.employeeId && <p className="text-xs text-destructive">{serverFieldErrors.employeeId}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelClass}>Office ID</label>
            <input
              value={payload.officeId ?? ''}
              onChange={(event) => updatePayload('officeId', event.target.value)}
              className={textInputClass}
              placeholder="OFF001"
            />
            {serverFieldErrors.officeId && <p className="text-xs text-destructive">{serverFieldErrors.officeId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Card No</label>
            <input
              value={payload.cardNo ?? ''}
              onChange={(event) => updatePayload('cardNo', event.target.value)}
              className={textInputClass}
              placeholder="CARD001"
            />
            {serverFieldErrors.cardNo && <p className="text-xs text-destructive">{serverFieldErrors.cardNo}</p>}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label className={labelClass}>First Name *</label>
            <input
              value={payload.name.firstName}
              onChange={(event) => updateName('firstName', event.target.value)}
              className={textInputClass}
              placeholder="Mohammad"
            />
            {serverFieldErrors.name && <p className="text-xs text-destructive">{serverFieldErrors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Middle Name</label>
            <input
              value={payload.name.middleName ?? ''}
              onChange={(event) => updateName('middleName', event.target.value)}
              className={textInputClass}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Last Name *</label>
            <input
              value={payload.name.lastName}
              onChange={(event) => updateName('lastName', event.target.value)}
              className={textInputClass}
              placeholder="Sohel"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label className={labelClass}>Email *</label>
            <input
              value={payload.email}
              onChange={(event) => updatePayload('email', event.target.value)}
              className={textInputClass}
              placeholder="employee@csrm.com"
              type="email"
            />
            {serverFieldErrors.email && <p className="text-xs text-destructive">{serverFieldErrors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Phone *</label>
            <input
              value={payload.phone}
              onChange={(event) => updatePayload('phone', event.target.value)}
              className={textInputClass}
              placeholder="01700000000"
            />
            {serverFieldErrors.phone && <p className="text-xs text-destructive">{serverFieldErrors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Gender *</label>
            <select
              value={payload.gender}
              onChange={(event) => updatePayload('gender', event.target.value)}
              className={textInputClass}
            >
              {renderOptions(genderOptions)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label className={labelClass}>Company *</label>
            <select
              value={payload.company}
              onChange={(event) => updatePayload('company', event.target.value)}
              className={textInputClass}
            >
              <option value="">Select company</option>
              {renderOptions(companyOptions)}
            </select>
            {serverFieldErrors.company && <p className="text-xs text-destructive">{serverFieldErrors.company}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Major Department *</label>
            <select
              value={payload.majorDepartment}
              onChange={(event) => updatePayload('majorDepartment', event.target.value)}
              className={textInputClass}
              disabled={!payload.company}
            >
              <option value="">Select major department</option>
              {renderOptions(majorDepartmentOptions)}
            </select>
            {serverFieldErrors.majorDepartment && <p className="text-xs text-destructive">{serverFieldErrors.majorDepartment}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Department / Section *</label>
            <select
              value={payload.department}
              onChange={(event) => updatePayload('department', event.target.value)}
              className={textInputClass}
              disabled={!payload.company || !payload.majorDepartment}
            >
              <option value="">Select department</option>
              {renderOptions(departmentOptions)}
            </select>
            {serverFieldErrors.department && <p className="text-xs text-destructive">{serverFieldErrors.department}</p>}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label className={labelClass}>Designation *</label>
            <select
              value={payload.designation}
              onChange={(event) => updatePayload('designation', event.target.value)}
              className={textInputClass}
              disabled={!payload.company}
            >
              <option value="">Select designation</option>
              {renderOptions(designationOptions)}
            </select>
            {serverFieldErrors.designation && <p className="text-xs text-destructive">{serverFieldErrors.designation}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Branch *</label>
            <select
              value={payload.branch}
              onChange={(event) => updatePayload('branch', event.target.value)}
              className={textInputClass}
            >
              <option value="">Select branch</option>
              {renderOptions(branchOptions)}
            </select>
            {serverFieldErrors.branch && <p className="text-xs text-destructive">{serverFieldErrors.branch}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Date of Birth</label>
            <input
              value={payload.dateOfBirth ?? ''}
              onChange={(event) => updatePayload('dateOfBirth', event.target.value)}
              className={textInputClass}
              type="date"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label className={labelClass}>Joining Date *</label>
            <input
              value={payload.joiningDate}
              onChange={(event) => updatePayload('joiningDate', event.target.value)}
              className={textInputClass}
              type="date"
            />
            {serverFieldErrors.joiningDate && <p className="text-xs text-destructive">{serverFieldErrors.joiningDate}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Confirmation Date</label>
            <input
              value={payload.confirmationDate ?? ''}
              onChange={(event) => updatePayload('confirmationDate', event.target.value)}
              className={textInputClass}
              type="date"
            />
          </div>

          {mode === 'create' && (
            <div className="space-y-1.5">
              <label className={labelClass}>Employment Status</label>
              <select
                value={payload.employmentStatus ?? ''}
                onChange={(event) => updatePayload('employmentStatus', event.target.value)}
                className={textInputClass}
              >
                {renderOptions(employmentStatusOptions)}
              </select>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Service Type</label>
            <select
              value={payload.serviceType}
              onChange={(event) => updatePayload('serviceType', event.target.value)}
              className={textInputClass}
            >
              {renderOptions(serviceTypeOptions)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Pay Type</label>
            <select
              value={payload.payType}
              onChange={(event) => updatePayload('payType', event.target.value)}
              className={textInputClass}
            >
              {renderOptions(payTypeOptions)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Duty Hour / Day</label>
            <input
              value={payload.dutyHourPerDay ?? ''}
              onChange={(event) => updatePayload('dutyHourPerDay', event.target.value)}
              className={textInputClass}
              type="number"
              min="0"
              max="24"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Leave Day</label>
            <input
              value={payload.leaveDay ?? ''}
              onChange={(event) => updatePayload('leaveDay', event.target.value)}
              className={textInputClass}
              type="number"
              min="0"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Basic Salary</label>
            <input
              value={payload.basicSalary ?? ''}
              onChange={(event) => updatePayload('basicSalary', event.target.value)}
              className={textInputClass}
              type="number"
              min="0"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
