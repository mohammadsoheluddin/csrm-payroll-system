import type { ApiErrorSource } from '@/types/api.types'
import type { EmployeeRecord } from '@/features/employees/types/employee.types'
import type {
  AttendancePayload,
  AttendanceRecord,
  EmployeeSelectOption,
  LeavePayload,
  LeaveRecord,
} from '@/features/attendance-leave/types/attendanceLeave.types'
import {
  emptyAttendancePayload,
  emptyLeavePayload,
  managementControlledLeaveTypes,
} from '@/features/attendance-leave/config/attendanceLeave.constants'
import {
  getEmployeeFullName,
  getEmployeeId,
  getEmployeeReferenceLabel,
} from '@/features/employees/utils/employee.utils'

export const getRecordId = (record: { _id?: string; id?: string }) => record._id ?? record.id ?? ''

export const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 10)
}

const addCleanString = (payload: Record<string, unknown>, key: string, value: unknown) => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    if (trimmedValue) {
      payload[key] = trimmedValue
    }

    return
  }

  if (value !== undefined && value !== null && value !== '') {
    payload[key] = value
  }
}

export const normalizeListData = <TRecord>(value: unknown): TRecord[] => {
  if (Array.isArray(value)) {
    return value as TRecord[]
  }

  if (typeof value === 'object' && value !== null) {
    const data = value as Record<string, unknown>

    if (Array.isArray(data.data)) {
      return data.data as TRecord[]
    }

    if (Array.isArray(data.records)) {
      return data.records as TRecord[]
    }

    if (Array.isArray(data.result)) {
      return data.result as TRecord[]
    }
  }

  return []
}

export const getEmployeeFromRecord = (record: AttendanceRecord | LeaveRecord) => {
  const employee = record.employee
  return typeof employee === 'object' && employee !== null ? (employee as EmployeeRecord) : null
}

export const getAttendanceLeaveEmployeeName = (record: AttendanceRecord | LeaveRecord) => {
  const employee = getEmployeeFromRecord(record)
  if (!employee) {
    return typeof record.employee === 'string' ? record.employee : '—'
  }

  return getEmployeeFullName(employee) || getEmployeeReferenceLabel(employee)
}

export const getAttendanceLeaveEmployeeCode = (record: AttendanceRecord | LeaveRecord) => {
  const employee = getEmployeeFromRecord(record)
  if (!employee) {
    return '—'
  }

  return employee.employeeId ?? employee.officeId ?? getEmployeeId(employee) ?? '—'
}

export const getEmployeeDepartmentLabel = (record: AttendanceRecord | LeaveRecord) => {
  const employee = getEmployeeFromRecord(record)
  if (!employee) {
    return '—'
  }

  return getEmployeeReferenceLabel(employee.department) || '—'
}

export const employeesToSelectOptions = (employees: EmployeeRecord[]): EmployeeSelectOption[] => {
  return employees.map((employee) => {
    const code = employee.employeeId ?? employee.officeId ?? getEmployeeId(employee)
    const designation = getEmployeeReferenceLabel(employee.designation)

    return {
      value: getEmployeeId(employee),
      label: `${code ? `${code} — ` : ''}${getEmployeeFullName(employee)}`,
      meta: [designation, getEmployeeReferenceLabel(employee.department)].filter(Boolean).join(' · '),
    }
  })
}

export const toAttendancePayload = (formValue: AttendancePayload) => {
  const payload: Record<string, unknown> = {}

  addCleanString(payload, 'employee', formValue.employee)
  addCleanString(payload, 'attendanceDate', toDateInputValue(formValue.attendanceDate))
  addCleanString(payload, 'checkInTime', formValue.checkInTime)
  addCleanString(payload, 'checkOutTime', formValue.checkOutTime)
  addCleanString(payload, 'status', formValue.status)
  addCleanString(payload, 'source', formValue.source)
  addCleanString(payload, 'remarks', formValue.remarks)
  addCleanString(payload, 'deviceId', formValue.deviceId)

  return payload
}

export const toLeavePayload = (formValue: LeavePayload) => {
  const payload: Record<string, unknown> = {}
  const leaveType = formValue.leaveType

  addCleanString(payload, 'employee', formValue.employee)
  addCleanString(payload, 'leaveType', leaveType)
  addCleanString(payload, 'startDate', toDateInputValue(formValue.startDate))
  addCleanString(payload, 'endDate', toDateInputValue(formValue.endDate))
  addCleanString(payload, 'reason', formValue.reason)

  if (isManagementControlledLeaveType(leaveType)) {
    payload.managementConcern = formValue.managementConcern === true
    addCleanString(payload, 'managementConcernNote', formValue.managementConcernNote)
  }

  if (leaveType === 'replacement') {
    addCleanString(payload, 'replacementForDate', toDateInputValue(formValue.replacementForDate))
  }

  return payload
}

export const attendanceRecordToFormValue = (record?: AttendanceRecord | null): AttendancePayload => {
  if (!record) {
    return { ...emptyAttendancePayload }
  }

  const employee = getEmployeeFromRecord(record)

  return {
    employee: employee ? getEmployeeId(employee) : String(record.employee ?? ''),
    attendanceDate: toDateInputValue(record.attendanceDate),
    checkInTime: record.checkInTime ?? '',
    checkOutTime: record.checkOutTime ?? '',
    status: record.status ?? 'present',
    source: record.source ?? 'manual',
    remarks: record.remarks ?? '',
    deviceId: record.deviceId ?? '',
  }
}

export const leaveRecordToFormValue = (record?: LeaveRecord | null): LeavePayload => {
  if (!record) {
    return { ...emptyLeavePayload }
  }

  const employee = getEmployeeFromRecord(record)

  return {
    employee: employee ? getEmployeeId(employee) : String(record.employee ?? ''),
    leaveType: record.leaveType ?? 'casual',
    startDate: toDateInputValue(record.startDate),
    endDate: toDateInputValue(record.endDate),
    reason: record.reason ?? '',
    managementConcern: record.managementConcern ?? false,
    managementConcernNote: record.managementConcernNote ?? '',
    replacementForDate: toDateInputValue(record.replacementForDate),
  }
}

export const isManagementControlledLeaveType = (leaveType?: string) => {
  return managementControlledLeaveTypes.includes(leaveType as never)
}

export const calculateDateDiffDays = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) {
    return 0
  }

  const start = new Date(`${startDate}T00:00:00.000Z`).getTime()
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime()

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return 0
  }

  return Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1
}

export const normalizeServerFieldErrors = (sources: ApiErrorSource[]) => {
  return sources.reduce<Record<string, string>>((accumulator, source) => {
    const cleanedPath = source.path
      .replace(/^body\./, '')
      .replace(/^query\./, '')
      .replace(/^params\./, '')
      .replace(/\[\d+\]/g, '')

    const formField = cleanedPath.split('.').pop() ?? cleanedPath

    if (formField) {
      accumulator[formField] = source.message
    }

    return accumulator
  }, {})
}

export const statusBadgeVariant = (status?: string) => {
  if (status === 'present' || status === 'approved') {
    return 'success' as const
  }

  if (status === 'late' || status === 'pending' || status === 'half-day') {
    return 'warning' as const
  }

  if (status === 'absent' || status === 'rejected' || status === 'cancelled') {
    return 'danger' as const
  }

  return 'muted' as const
}
