import { getReferenceId, getReferenceLabel, toTitleCase } from '@/lib/format/record.utils'
import type {
  EmployeePayload,
  EmployeeRecord,
  EmployeeReference,
  EmployeeSelectOption,
} from '@/features/employees/types/employee.types'

export const getEmployeeId = (employee: EmployeeRecord) => {
  const id = employee._id ?? employee.id
  return typeof id === 'string' ? id : ''
}

export const getEmployeeFullName = (employee: Pick<EmployeeRecord, 'name'>) => {
  return [employee.name?.firstName, employee.name?.middleName, employee.name?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
}

export const getEmployeeDisplayName = (employee?: EmployeeRecord | null) => {
  if (!employee) {
    return 'Employee'
  }

  const fullName = getEmployeeFullName(employee)
  return fullName ? `${employee.employeeId} - ${fullName}` : employee.employeeId
}

export const referenceToOption = (record: EmployeeReference | Record<string, unknown>): EmployeeSelectOption => {
  const id = getReferenceId(record)
  const code = typeof record.code === 'string' ? record.code : undefined
  const label = getReferenceLabel(record)

  return {
    value: id,
    label: code ? `${label} (${code})` : label,
  }
}

export const recordsToOptions = (records?: Array<EmployeeReference | Record<string, unknown>>): EmployeeSelectOption[] => {
  return (records ?? [])
    .map(referenceToOption)
    .filter((option) => Boolean(option.value))
}

export const getEmployeeReferenceLabel = (value: unknown) => {
  return getReferenceLabel(value)
}

export const getEmployeeReferenceId = (value: unknown) => {
  return getReferenceId(value)
}

const emptyToUndefined = (value: unknown) => {
  return value === '' || value === null || value === undefined ? undefined : value
}

const numberOrUndefined = (value: unknown) => {
  const normalized = emptyToUndefined(value)

  if (normalized === undefined) {
    return undefined
  }

  const numberValue = Number(normalized)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

export const toEmployeeMutationPayload = (payload: EmployeePayload, mode: 'create' | 'edit') => {
  const normalized: Record<string, unknown> = {
    name: {
      firstName: payload.name.firstName.trim(),
      lastName: payload.name.lastName.trim(),
    },
    officeId: emptyToUndefined(payload.officeId?.trim()),
    cardNo: emptyToUndefined(payload.cardNo?.trim()),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    gender: payload.gender,
    dateOfBirth: emptyToUndefined(payload.dateOfBirth),
    company: payload.company,
    majorDepartment: payload.majorDepartment,
    department: payload.department,
    designation: payload.designation,
    branch: payload.branch,
    joiningDate: payload.joiningDate,
    confirmationDate: emptyToUndefined(payload.confirmationDate),
    serviceType: payload.serviceType,
    payType: payload.payType,
    dutyHourPerDay: numberOrUndefined(payload.dutyHourPerDay),
    leaveDay: numberOrUndefined(payload.leaveDay),
    basicSalary: numberOrUndefined(payload.basicSalary),
  }

  if (payload.name.middleName?.trim()) {
    normalized.name = {
      ...(normalized.name as Record<string, string>),
      middleName: payload.name.middleName.trim(),
    }
  }

  if (mode === 'create') {
    normalized.employeeId = payload.employeeId?.trim().toUpperCase()
    normalized.employmentStatus = payload.employmentStatus
  }

  return Object.entries(normalized).reduce<Record<string, unknown>>((accumulator, [key, value]) => {
    if (value !== undefined && value !== '') {
      accumulator[key] = value
    }

    return accumulator
  }, {})
}

export const getEmployeeInitials = (employee: EmployeeRecord) => {
  const fullName = getEmployeeFullName(employee)
  const fallback = employee.employeeId.slice(0, 2)

  return (fullName || fallback)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export const getEmploymentStatusLabel = (status?: string) => {
  return status ? toTitleCase(status) : 'Unknown'
}
