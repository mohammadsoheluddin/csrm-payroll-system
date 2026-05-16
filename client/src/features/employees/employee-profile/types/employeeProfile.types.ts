export type EmployeeProfileReference = {
  id: string
  name: string
  code?: string
}

export type EmployeeProfileSummary = {
  employeeDbId: string
  employeeId: string
  officeId?: string
  cardNo?: string
  employeeName: string
  status?: string
  employmentStatus?: string
  serviceType?: string
  payType?: string
  joiningDate?: string
  confirmationDate?: string
  separatedAt?: string | null
  company: EmployeeProfileReference | null
  majorDepartment: EmployeeProfileReference | null
  department: EmployeeProfileReference | null
  designation: EmployeeProfileReference | null
  branch: EmployeeProfileReference | null
}

export type EmployeeProfileTimelineEventType =
  | 'joining'
  | 'confirmation'
  | 'lifecycle'
  | 'movement'
  | 'document'
  | 'salary_structure'
  | 'payroll'
  | 'legacy_salary'

export type EmployeeProfileTimelineEvent = {
  type: EmployeeProfileTimelineEventType
  title: string
  date?: string | null
  status?: string
  description?: string
  referenceId?: string
  metadata?: Record<string, unknown>
}

export type EmployeeProfileDataGapSeverity = 'info' | 'warning' | 'critical'

export type EmployeeProfileDataGap = {
  key: string
  label: string
  severity: EmployeeProfileDataGapSeverity
  message: string
}

export type EmployeeProfileSections = {
  personal: Record<string, unknown>
  office: Record<string, unknown>
  lifecycle: Record<string, unknown>
  salary: {
    activeSalaryStructure?: Record<string, unknown> | null
    salaryStructureHistory?: Record<string, unknown>[]
    latestSalarySheet?: Record<string, unknown> | null
    latestPayroll?: Record<string, unknown> | null
  }
  payment: {
    primaryBankInfo?: Record<string, unknown> | null
    paymentOptions?: Record<string, unknown>[]
  }
  documents: {
    count: number
    pendingCount: number
    verifiedCount: number
    rejectedCount: number
    expiredCount: number
    records: Record<string, unknown>[]
  }
  attendance: {
    latestAttendanceFinalization?: Record<string, unknown> | null
    history?: Record<string, unknown>[]
  }
  leave: {
    year?: number | string | null
    leaveTypeCount?: number
    totals?: Record<string, number>
    balances?: Record<string, unknown>[]
  }
  movements: {
    count: number
    latest?: Record<string, unknown> | null
    history?: Record<string, unknown>[]
  }
  payrollHistory: {
    nativePayroll?: Record<string, unknown>[]
    salarySheets?: Record<string, unknown>[]
  }
  legacySalaryArchive: {
    count: number
    records: Record<string, unknown>[]
    note?: string
  }
  dataGaps: EmployeeProfileDataGap[]
  timeline: EmployeeProfileTimelineEvent[]
}

export type EmployeeProfileResponse = {
  profileGeneratedAt: string
  selectedYear: number
  selectedPayrollMonth?: string | null
  summary: EmployeeProfileSummary
  sections: EmployeeProfileSections
}

export type EmployeeProfileSummaryResponse = {
  profileGeneratedAt: string
  summary: EmployeeProfileSummary
  counters: {
    salaryStructureCount: number
    bankInfoCount: number
    documentCount: number
    pendingDocumentCount: number
    movementCount: number
    payrollCount: number
  }
  serviceBookReady: boolean
}

export type EmployeeProfileQueryParams = {
  year?: string | number
  payrollMonth?: string
  historyLimit?: string | number
  movementLimit?: string | number
  legacyLimit?: string | number
}
