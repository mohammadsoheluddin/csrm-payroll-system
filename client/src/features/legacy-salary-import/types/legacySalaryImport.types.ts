export type LegacySalarySource =
  | 'old_payroll_software'
  | 'current_payroll_software'
  | 'manual_excel'
  | 'other'

export type LegacySalarySheetType =
  | 'salary'
  | 'wages'
  | 'salary_and_wages'
  | 'ot'
  | 'bonus'
  | 'mixed'

export type LegacySalaryMatchBy = 'employeeId' | 'officeId' | 'cardNo' | 'name'
export type LegacySalaryPaymentMode = 'bank' | 'cash' | 'mobile' | 'mixed' | 'unknown' | string
export type LegacySalaryRecordStatus = 'matched' | 'unmatched' | 'duplicate_identifier' | 'invalid' | string
export type LegacySalaryBatchStatus = 'committed' | 'archived' | 'deleted' | string
export type LegacySalaryListMode = 'active' | 'deleted'
export type LegacySalaryExportType = 'csv' | 'excel'
export type LegacySalarySummaryGroupBy = 'department' | 'majorDepartment' | 'company' | 'sheetType' | 'status'

export type LegacySalaryTotals = Record<string, number> & {
  employeeCount?: number
  grossAmount?: number
  basicAmount?: number
  overtimeAmount?: number
  tiffinAmount?: number
  bonusAmount?: number
  otherAllowanceAmount?: number
  bankAmount?: number
  cashAmount?: number
  mobileBankAmount?: number
  aitAmount?: number
  loanAmount?: number
  advanceAmount?: number
  pfAmount?: number
  stampAmount?: number
  foodAmount?: number
  absentDeductionAmount?: number
  leaveDeductionAmount?: number
  otherDeductionAmount?: number
  totalDeductionAmount?: number
  netAmount?: number
  payableAmount?: number
}

export type LegacySalaryImportRowInput = Record<string, unknown> & {
  rowNo?: number
  employeeIdentifier?: string
  employeeId?: string
  officeId?: string
  cardNo?: string
  employeeName?: string
  companyName?: string
  majorDepartmentName?: string
  departmentName?: string
  designationName?: string
  branchName?: string
  payType?: string
  paymentMode?: LegacySalaryPaymentMode
  grossAmount?: number
  basicAmount?: number
  houseRentAmount?: number
  medicalAmount?: number
  conveyanceAmount?: number
  tiffinAmount?: number
  overtimeHour?: number
  overtimeRate?: number
  overtimeAmount?: number
  bonusAmount?: number
  otherAllowanceAmount?: number
  bankAmount?: number
  cashAmount?: number
  mobileBankAmount?: number
  aitAmount?: number
  loanAmount?: number
  advanceAmount?: number
  pfAmount?: number
  stampAmount?: number
  foodAmount?: number
  absentDeductionAmount?: number
  leaveDeductionAmount?: number
  otherDeductionAmount?: number
  totalDeductionAmount?: number
  netAmount?: number
  payableAmount?: number
  remarks?: string
  rawPayload?: Record<string, unknown>
}

export type LegacySalaryImportPayload = {
  source: LegacySalarySource
  sheetType: LegacySalarySheetType
  payrollMonth: string
  company?: string
  sourceFileName?: string
  sourceSheetName?: string
  matchBy?: LegacySalaryMatchBy
  remarks?: string
  rows: LegacySalaryImportRowInput[]
}

export type LegacySalaryParseExcelPayload = {
  fileName: string
  fileBase64: string
  sheetName?: string
  headerRow?: number | string
  dataStartRow?: number | string
  maxRows?: number | string
}

export type LegacySalaryParsedRow = {
  rowNo: number
  rawPayload: Record<string, unknown>
  mappedPayload: Partial<LegacySalaryImportRowInput>
  unmappedHeaders: string[]
}

export type LegacySalaryParsedResult = {
  fileName: string
  sheetName: string
  headerRow: number
  dataStartRow: number
  totalRows: number
  rows: LegacySalaryParsedRow[]
  headers: string[]
  mappedHeaders: string[]
  unmappedHeaders: string[]
  notes: string[]
}

export type LegacySalaryPreviewRow = LegacySalaryImportRowInput & {
  rowNo: number
  status?: LegacySalaryRecordStatus
  employee?: unknown
  employeeIdentifier?: string
  paymentMode?: LegacySalaryPaymentMode
}

export type LegacySalaryRejectedRow = {
  rowNo: number
  employeeIdentifier?: string
  employeeName?: string
  reason: string
  rawPayload?: Record<string, unknown>
}

export type LegacySalaryPreviewResult = {
  payrollMonth: string
  source: LegacySalarySource
  sheetType: LegacySalarySheetType
  matchBy: LegacySalaryMatchBy
  sourceFileName?: string
  sourceSheetName?: string
  totalRows: number
  validRows: number
  invalidRows: number
  matchedRows: number
  unmatchedRows: number
  duplicateIdentifierRows: number
  totals: LegacySalaryTotals
  rows: LegacySalaryPreviewRow[]
  rejectedRows: LegacySalaryRejectedRow[]
}

export type LegacySalaryBatch = Record<string, unknown> & {
  _id?: string
  id?: string
  batchNo?: string
  source?: LegacySalarySource
  sheetType?: LegacySalarySheetType
  payrollMonth?: string
  month?: number
  year?: number
  sourceFileName?: string
  sourceSheetName?: string
  matchBy?: LegacySalaryMatchBy
  status?: LegacySalaryBatchStatus
  totalRows?: number
  validRows?: number
  invalidRows?: number
  matchedRows?: number
  unmatchedRows?: number
  duplicateIdentifierRows?: number
  totals?: LegacySalaryTotals
  rejectedRows?: LegacySalaryRejectedRow[]
  remarks?: string
  committedAt?: string
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

export type LegacySalaryRecord = Record<string, unknown> & {
  _id?: string
  id?: string
  batch?: string | LegacySalaryBatch
  payrollMonth?: string
  source?: LegacySalarySource
  sheetType?: LegacySalarySheetType
  rowNo?: number
  status?: LegacySalaryRecordStatus
  employeeId?: string
  officeId?: string
  cardNo?: string
  employeeIdentifier?: string
  employeeName?: string
  companyName?: string
  majorDepartmentName?: string
  departmentName?: string
  designationName?: string
  branchName?: string
  paymentMode?: LegacySalaryPaymentMode
  grossAmount?: number
  bankAmount?: number
  cashAmount?: number
  mobileBankAmount?: number
  aitAmount?: number
  loanAmount?: number
  netAmount?: number
  payableAmount?: number
  createdAt?: string
  updatedAt?: string
}

export type LegacySalarySummaryRow = Record<string, unknown> & {
  groupKey?: string
  groupLabel?: string
  employeeCount?: number
  totals?: LegacySalaryTotals
}

export type LegacySalarySummaryResult = {
  filters?: Record<string, unknown>
  groupBy?: LegacySalarySummaryGroupBy
  rows?: LegacySalarySummaryRow[]
  totals?: LegacySalaryTotals
}

export type LegacySalaryFilters = {
  payrollMonth: string
  company?: string
  source?: LegacySalarySource | ''
  sheetType?: LegacySalarySheetType | ''
  status?: string
  batchNo?: string
  employeeId?: string
  officeId?: string
  employeeName?: string
  departmentName?: string
  groupBy?: LegacySalarySummaryGroupBy
}
