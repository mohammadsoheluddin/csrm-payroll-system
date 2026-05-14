import type { Permission } from '@/config/permissions'

export type PayrollListMode = 'active' | 'deleted'

export type PayrollStatus = 'draft' | 'processed' | 'approved' | 'paid' | 'locked' | string
export type PayrollWorkflowStatus = 'draft' | 'processed' | 'approved' | 'locked' | string

export type PayrollReference = {
  _id?: string
  id?: string
  name?: string
  shortName?: string
  code?: string
  employeeId?: string
  officeId?: string
  cardNo?: string
  category?: string
  status?: string
}

export type PayrollEmployeeSnapshot = {
  employeeDbId?: string
  employeeId?: string
  employeeName?: string
  officeId?: string
  cardNo?: string
  company?: PayrollReference | null
  majorDepartment?: PayrollReference | null
  department?: PayrollReference | null
  designation?: PayrollReference | null
  branch?: PayrollReference | null
}

export type PayrollRecord = Record<string, unknown> & {
  _id?: string
  id?: string
  employee?: PayrollReference | string
  payrollMonth?: string
  month?: number
  year?: number
  grossSalary?: number
  fixedDeduction?: number
  attendanceDeduction?: number
  netSalary?: number
  payableSalary?: number
  finalPayableSalary?: number
  otHours?: number
  otRate?: number
  otAmount?: number
  status?: PayrollStatus
  isLocked?: boolean
  remarks?: string
  snapshot?: {
    employee?: PayrollEmployeeSnapshot | null
    salary?: Record<string, unknown> | null
    attendanceFinalization?: Record<string, unknown> | null
    payment?: Record<string, unknown> | null
  } | null
  createdAt?: string
  updatedAt?: string
}

export type SalaryStructureRecord = Record<string, unknown> & {
  _id?: string
  id?: string
  employee?: PayrollReference | string
  basicSalary?: number
  houseRent?: number
  medicalAllowance?: number
  transportAllowance?: number
  otherAllowance?: number
  taxDeduction?: number
  providentFund?: number
  loanDeduction?: number
  otherDeduction?: number
  grossSalary?: number
  totalDeduction?: number
  netSalary?: number
  effectiveFrom?: string
  remarks?: string
  isActive?: boolean
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type SalaryStructurePayload = {
  employee: string
  basicSalary: number | string
  houseRent?: number | string
  medicalAllowance?: number | string
  transportAllowance?: number | string
  otherAllowance?: number | string
  taxDeduction?: number | string
  providentFund?: number | string
  loanDeduction?: number | string
  otherDeduction?: number | string
  effectiveFrom: string
  remarks?: string
  isActive?: boolean
}

export type PayrollPeriodQuery = {
  month?: number | string
  year?: number | string
  company?: string
  majorDepartment?: string
  department?: string
  branch?: string
  employee?: string
  status?: string
  paymentMode?: string
  payrollMonth?: string
}

export type PayrollGeneratePayload = PayrollPeriodQuery & {
  overwrite?: boolean
  allowCashFallback?: boolean
  remarks?: string
}

export type PayrollActionPayload = {
  id: string
  note?: string
}

export type PayrollBulkActionPayload = PayrollPeriodQuery & {
  note?: string
  strict?: boolean
}

export type PayrollWorkflowRecord = Record<string, unknown> & {
  _id?: string
  id?: string
  employee?: PayrollReference | string
  company?: PayrollReference | string
  majorDepartment?: PayrollReference | string
  department?: PayrollReference | string
  designation?: PayrollReference | string
  branch?: PayrollReference | string
  payrollMonth?: string
  month?: number
  year?: number
  grossSalary?: number
  fixedDeduction?: number
  attendanceDeduction?: number
  totalDeduction?: number
  netSalary?: number
  payableSalary?: number
  bankAmount?: number
  cashAmount?: number
  mobileBankingAmount?: number
  paymentMode?: string
  status?: PayrollWorkflowStatus
  isLocked?: boolean
  remarks?: string
  snapshot?: {
    employee?: PayrollEmployeeSnapshot | null
    salarySheet?: Record<string, unknown> | null
    salaryStatement?: Record<string, unknown> | null
    paymentInfo?: Record<string, unknown> | null
  } | null
  createdAt?: string
  updatedAt?: string
}

export type PayrollWorkflowModuleKey = 'salarySheets' | 'salaryStatements' | 'salaryPaymentDistributions'

export type PayrollWorkflowModuleConfig = {
  key: PayrollWorkflowModuleKey
  title: string
  shortTitle: string
  description: string
  api: {
    root: string
    generate: string
    summary: string
    deleted: string
    detail: (id: string) => string
    restore: (id: string) => string
    process: (id: string) => string
    approve: (id: string) => string
    lock: (id: string) => string
    unlock: (id: string) => string
    bulkProcess: string
    bulkApprove: string
    bulkLock: string
    bulkUnlock: string
    exportPreview?: string
    exportCsv?: string
    exportExcel?: string
    exportPdf?: string
  }
  permissions: {
    read: Permission
    process: Permission
    approve: Permission
    lock: Permission
    unlock: Permission
    export?: Permission
  }
  supportsPaymentMode?: boolean
  supportsExport?: boolean
}

export type PayrollLookupOption = {
  value: string
  label: string
}
