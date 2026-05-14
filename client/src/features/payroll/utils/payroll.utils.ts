import { format } from 'date-fns'

import type {
  PayrollGeneratePayload,
  PayrollLookupOption,
  PayrollPeriodQuery,
  PayrollRecord,
  PayrollReference,
  PayrollWorkflowRecord,
  SalaryStructurePayload,
} from '@/features/payroll/types/payroll.types'
import { getRecordId, getReferenceLabel } from '@/lib/format/record.utils'

export const currentPayrollMonth = () => {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

export const buildPayrollMonth = (month?: string | number, year?: string | number) => {
  if (!month || !year) {
    return ''
  }

  return `${year}-${String(month).padStart(2, '0')}`
}

export const formatCurrency = (value: unknown) => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0)
}

export const formatPayrollDate = (value: unknown) => {
  if (!value) {
    return '—'
  }

  const date = new Date(String(value))

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return format(date, 'dd MMM yyyy')
}

export const getReferenceId = (value: unknown) => {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object') {
    return getRecordId(value as Record<string, unknown>)
  }

  return ''
}

export const getReferenceDisplay = (value: unknown) => {
  if (!value) {
    return '—'
  }

  if (typeof value === 'string') {
    return value
  }

  return getReferenceLabel(value as Record<string, unknown>)
}

export const getPayrollRecordId = (record: Record<string, unknown>) => {
  return getReferenceId(record)
}

export const getEmployeeDisplayName = (record: PayrollRecord | PayrollWorkflowRecord) => {
  const snapshotEmployee = record.snapshot?.employee

  if (snapshotEmployee?.employeeName) {
    const employeeId = snapshotEmployee.employeeId ? ` (${snapshotEmployee.employeeId})` : ''
    return `${snapshotEmployee.employeeName}${employeeId}`
  }

  return getReferenceDisplay(record.employee)
}

export const getSalaryStructureEmployeeLabel = (value: unknown) => {
  if (!value) {
    return '—'
  }

  if (typeof value === 'object') {
    const employee = value as PayrollReference
    const employeeCode = employee.employeeId || employee.code || employee.officeId
    const name = employee.name || getReferenceLabel(employee as Record<string, unknown>)
    return employeeCode ? `${name} (${employeeCode})` : name
  }

  return String(value)
}

export const normalizeListResponse = <TRecord>(value: unknown): TRecord[] => {
  if (Array.isArray(value)) {
    return value as TRecord[]
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    const candidates = [record.data, record.records, record.result, record.items, record.list]

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as TRecord[]
      }
    }
  }

  return []
}

const emptyToUndefined = (value: unknown) => {
  return value === undefined || value === null || value === '' ? undefined : value
}

const toNumberOrUndefined = (value: unknown) => {
  const normalized = emptyToUndefined(value)

  if (normalized === undefined) {
    return undefined
  }

  const numericValue = Number(normalized)
  return Number.isFinite(numericValue) ? numericValue : undefined
}

const removeEmptyValues = <TRecord extends Record<string, unknown>>(record: TRecord) => {
  return Object.entries(record).reduce<Record<string, unknown>>((accumulator, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      accumulator[key] = value
    }

    return accumulator
  }, {})
}

export const cleanPayrollQuery = (query: PayrollPeriodQuery = {}) => {
  return removeEmptyValues(query) as Record<string, string | number>
}

export const toNumberOrZero = (value: unknown) => {
  const numericValue = Number(value || 0)
  return Number.isFinite(numericValue) ? numericValue : 0
}

export const cleanSalaryStructurePayload = (payload: SalaryStructurePayload) => {
  return {
    employee: payload.employee,
    basicSalary: toNumberOrZero(payload.basicSalary),
    houseRent: toNumberOrZero(payload.houseRent),
    medicalAllowance: toNumberOrZero(payload.medicalAllowance),
    transportAllowance: toNumberOrZero(payload.transportAllowance),
    otherAllowance: toNumberOrZero(payload.otherAllowance),
    taxDeduction: toNumberOrZero(payload.taxDeduction),
    providentFund: toNumberOrZero(payload.providentFund),
    loanDeduction: toNumberOrZero(payload.loanDeduction),
    otherDeduction: toNumberOrZero(payload.otherDeduction),
    effectiveFrom: payload.effectiveFrom,
    remarks: payload.remarks?.trim() || undefined,
    isActive: payload.isActive,
  }
}

export const cleanGeneratePayload = (payload: PayrollGeneratePayload) => {
  const month = toNumberOrUndefined(payload.month)
  const year = toNumberOrUndefined(payload.year)

  return removeEmptyValues({
    company: payload.company,
    branch: payload.branch,
    majorDepartment: payload.majorDepartment,
    department: payload.department,
    employee: payload.employee,
    month,
    year,
    overwrite: payload.overwrite === undefined ? undefined : Boolean(payload.overwrite),
    allowCashFallback:
      payload.allowCashFallback === undefined ? undefined : Boolean(payload.allowCashFallback),
    remarks: payload.remarks?.trim() || undefined,
  })
}

export const cleanBulkActionPayload = (payload: PayrollGeneratePayload & { note?: string; strict?: boolean }) => {
  const month = toNumberOrUndefined(payload.month)
  const year = toNumberOrUndefined(payload.year)

  return removeEmptyValues({
    payrollMonth: payload.payrollMonth,
    company: payload.company,
    branch: payload.branch,
    majorDepartment: payload.majorDepartment,
    department: payload.department,
    employee: payload.employee,
    paymentMode: payload.paymentMode,
    month,
    year,
    note: payload.note?.trim() || undefined,
    strict: payload.strict === undefined ? undefined : Boolean(payload.strict),
  })
}

export const recordsToPayrollOptions = (records: Array<Record<string, unknown>>): PayrollLookupOption[] => {
  return records.map((record) => {
    const id = getReferenceId(record)
    const label = getReferenceLabel(record)
    const code = typeof record.code === 'string' ? record.code : undefined

    return {
      value: id,
      label: code ? `${label} (${code})` : label,
    }
  })
}

export const getStatusBadgeVariant = (status?: string, isLocked?: boolean) => {
  if (isLocked || status === 'locked') {
    return 'warning' as const
  }

  if (status === 'approved' || status === 'paid') {
    return 'success' as const
  }

  if (status === 'processed') {
    return 'default' as const
  }

  if (status === 'draft') {
    return 'muted' as const
  }

  return 'muted' as const
}
