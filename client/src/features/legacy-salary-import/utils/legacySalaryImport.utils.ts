import type {
  LegacySalaryBatch,
  LegacySalaryFilters,
  LegacySalaryImportPayload,
  LegacySalaryImportRowInput,
  LegacySalaryParseOptions,
  LegacySalaryParsedResult,
  LegacySalaryRecord,
  LegacySalarySummaryResult,
  LegacySalaryTotals,
} from '@/features/legacy-salary-import/types/legacySalaryImport.types'
import { getReferenceLabel, toTitleCase } from '@/lib/format/record.utils'

export const legacySalaryDefaultFilters = (): LegacySalaryFilters => {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return {
    payrollMonth: `${date.getFullYear()}-${month}`,
    source: 'current_payroll_software',
    sheetType: 'salary_and_wages',
    groupBy: 'department',
  }
}


export const legacySalaryDefaultParseOptions = (): LegacySalaryParseOptions => ({
  sheetName: '',
  headerRow: '',
  dataStartRow: '',
  maxRows: '10000',
})

export const sourceOptions = [
  { value: 'current_payroll_software', label: 'Current Payroll Software' },
  { value: 'old_payroll_software', label: 'Old Payroll Software' },
  { value: 'manual_excel', label: 'Manual Excel' },
  { value: 'other', label: 'Other Source' },
] as const

export const sheetTypeOptions = [
  { value: 'salary_and_wages', label: 'Salary & Wages' },
  { value: 'salary', label: 'Salary' },
  { value: 'wages', label: 'Wages' },
  { value: 'ot', label: 'OT' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'mixed', label: 'Mixed' },
] as const

export const matchByOptions = [
  { value: 'employeeId', label: 'Employee ID' },
  { value: 'officeId', label: 'Office ID' },
  { value: 'cardNo', label: 'Card No' },
  { value: 'name', label: 'Name' },
] as const

export const summaryGroupByOptions = [
  { value: 'department', label: 'Department' },
  { value: 'majorDepartment', label: 'Major Department' },
  { value: 'company', label: 'Company' },
  { value: 'sheetType', label: 'Sheet Type' },
  { value: 'status', label: 'Status' },
] as const

export const getLegacySalaryRecordId = (record: { _id?: string; id?: string }) => record._id ?? record.id ?? ''

export const formatMoney = (value?: unknown) => {
  const numericValue = Number(value ?? 0)
  return new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number.isFinite(numericValue) ? numericValue : 0)
}

export const formatLegacyDate = (value?: unknown) => {
  if (!value) {
    return '—'
  }

  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const getLegacyStatusVariant = (status?: string) => {
  if (!status) {
    return 'muted' as const
  }

  if (['matched', 'committed', 'archived'].includes(status)) {
    return 'success' as const
  }

  if (['unmatched', 'duplicate_identifier'].includes(status)) {
    return 'warning' as const
  }

  if (['invalid', 'deleted'].includes(status)) {
    return 'danger' as const
  }

  return 'muted' as const
}

export const cleanLegacySalaryParams = (filters: Partial<LegacySalaryFilters> = {}) => {
  const params: Record<string, string | number | boolean> = {}

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value as string | number | boolean
    }
  })

  return params
}

export const totalsToMetrics = (totals?: LegacySalaryTotals) => [
  {
    label: 'Employees',
    value: String(totals?.employeeCount ?? 0),
    description: 'Imported/archived employee rows',
  },
  {
    label: 'Gross Amount',
    value: `৳ ${formatMoney(totals?.grossAmount)}`,
    description: 'Total gross from uploaded salary data',
  },
  {
    label: 'Net Amount',
    value: `৳ ${formatMoney(totals?.netAmount)}`,
    description: 'Total net amount from legacy archive',
  },
  {
    label: 'Payable Amount',
    value: `৳ ${formatMoney(totals?.payableAmount)}`,
    description: 'Total payable amount from external source',
  },
]

export const parsedRowsToImportRows = (parsed?: LegacySalaryParsedResult | null): LegacySalaryImportRowInput[] => {
  return (parsed?.rows ?? []).map((row) => {
    const mappedPayload = row.mappedPayload ?? {}
    const employeeIdentifier =
      mappedPayload.employeeIdentifier ??
      mappedPayload.employeeId ??
      mappedPayload.officeId ??
      mappedPayload.cardNo ??
      mappedPayload.employeeName

    return {
      rowNo: row.rowNo,
      employeeIdentifier: typeof employeeIdentifier === 'string' ? employeeIdentifier : undefined,
      rawPayload: row.rawPayload,
      ...mappedPayload,
    }
  })
}

export const buildLegacySalaryPayload = ({
  filters,
  rows,
  sourceFileName,
  sourceSheetName,
  matchBy,
  remarks,
}: {
  filters: LegacySalaryFilters
  rows: LegacySalaryImportRowInput[]
  sourceFileName?: string
  sourceSheetName?: string
  matchBy: LegacySalaryImportPayload['matchBy']
  remarks?: string
}): LegacySalaryImportPayload => {
  return {
    source: (filters.source || 'current_payroll_software') as LegacySalaryImportPayload['source'],
    sheetType: (filters.sheetType || 'salary_and_wages') as LegacySalaryImportPayload['sheetType'],
    payrollMonth: filters.payrollMonth,
    company: filters.company || undefined,
    sourceFileName: sourceFileName || undefined,
    sourceSheetName: sourceSheetName || undefined,
    matchBy,
    remarks: remarks?.trim() || undefined,
    rows,
  }
}

export const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })

export const parseManualRowsJson = (value: string): LegacySalaryImportRowInput[] => {
  const parsedValue = JSON.parse(value) as unknown

  if (!Array.isArray(parsedValue)) {
    throw new Error('Manual rows JSON must be an array of row objects.')
  }

  return parsedValue.map((row, index) => ({
    rowNo: index + 1,
    ...(typeof row === 'object' && row !== null ? (row as LegacySalaryImportRowInput) : {}),
  }))
}

export const getBatchDisplayName = (batch?: LegacySalaryBatch | null) => {
  if (!batch) {
    return 'Legacy Salary Batch'
  }

  return `${batch.batchNo ?? getLegacySalaryRecordId(batch)} • ${batch.payrollMonth ?? 'Month N/A'}`
}

export const getBatchFileInfo = (batch: LegacySalaryBatch) => {
  return [batch.sourceFileName, batch.sourceSheetName].filter(Boolean).join(' / ') || 'No source file noted'
}

export const getRecordEmployeeLabel = (record: LegacySalaryRecord) => {
  return [record.employeeId, record.officeId, record.employeeName].filter(Boolean).join(' • ') || 'Employee not available'
}

export const normalizeSummaryRows = (summary?: LegacySalarySummaryResult | null) => {
  return (summary?.rows ?? []).map((row, index) => ({
    id: String(row.groupKey ?? row.groupLabel ?? index),
    groupLabel: String(row.groupLabel ?? row.groupName ?? row.groupKey ?? 'Unknown'),
    employeeCount: Number(row.employeeCount ?? row.totals?.employeeCount ?? 0),
    grossAmount: Number(row.totals?.grossAmount ?? row.grossAmount ?? 0),
    netAmount: Number(row.totals?.netAmount ?? row.netAmount ?? 0),
    payableAmount: Number(row.totals?.payableAmount ?? row.payableAmount ?? 0),
    suspenseAmount: Number(row.totals?.suspenseAmount ?? row.suspenseAmount ?? 0),
    bankAmount: Number(row.totals?.bankAmount ?? row.bankAmount ?? 0),
    cashAmount: Number(row.totals?.cashAmount ?? row.cashAmount ?? 0),
    status: typeof row.status === 'string' ? row.status : undefined,
  }))
}

export const getReferenceText = (value: unknown) => getReferenceLabel(value)
export const formatSource = (value?: string) => (value ? toTitleCase(value.replaceAll('_', ' ')) : '—')
