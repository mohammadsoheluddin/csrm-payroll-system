import type { EmployeeRecord } from '@/features/employees/types/employee.types'

export type AttendanceLeaveListMode = 'active' | 'deleted'

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'leave'
  | 'half-day'
  | 'weekend'
  | 'holiday'

export type AttendanceSource = 'manual' | 'device' | 'import'

export type AttendanceRecord = Record<string, unknown> & {
  _id?: string
  id?: string
  employee: EmployeeRecord | string
  attendanceDate: string
  checkInTime?: string
  checkOutTime?: string
  status?: AttendanceStatus
  source?: AttendanceSource
  remarks?: string
  deviceId?: string
  importBatchNo?: string
  isDeleted?: boolean
  deleteReason?: string | null
  restoreReason?: string | null
  createdAt?: string
  updatedAt?: string
}

export type AttendanceQueryParams = {
  employee?: string
  company?: string
  department?: string
  status?: AttendanceStatus | ''
  source?: AttendanceSource | ''
  attendanceDate?: string
  fromDate?: string
  toDate?: string
}

export type AttendancePayload = {
  employee: string
  attendanceDate: string
  checkInTime?: string
  checkOutTime?: string
  status?: AttendanceStatus | ''
  source?: AttendanceSource | ''
  remarks?: string
  deviceId?: string
}

export type LeaveType =
  | 'casual'
  | 'sick'
  | 'earned'
  | 'paid'
  | 'unpaid'
  | 'maternity'
  | 'paternity'
  | 'official'
  | 'replacement'
  | 'others'

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type LeaveApprovalStatus = Extract<LeaveStatus, 'approved' | 'rejected' | 'cancelled'>

export type LeaveRecord = Record<string, unknown> & {
  _id?: string
  id?: string
  employee: EmployeeRecord | string
  leaveType: LeaveType
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status?: LeaveStatus
  approvedBy?: Record<string, unknown> | string
  approvalNote?: string
  managementConcern?: boolean
  managementConcernNote?: string
  managementConcernBy?: Record<string, unknown> | string
  replacementForDate?: string
  isDeleted?: boolean
  deleteReason?: string | null
  restoreReason?: string | null
  createdAt?: string
  updatedAt?: string
}

export type LeaveQueryParams = {
  employee?: string
  leaveType?: LeaveType | ''
  status?: LeaveStatus | ''
  fromDate?: string
  toDate?: string
  startDate?: string
  endDate?: string
  replacementForDate?: string
  managementConcern?: '' | 'true' | 'false'
}

export type LeavePayload = {
  employee: string
  leaveType: LeaveType | ''
  startDate: string
  endDate: string
  reason: string
  managementConcern?: boolean
  managementConcernNote?: string
  replacementForDate?: string
}

export type LeaveApprovalPayload = {
  status: LeaveApprovalStatus
  approvalNote?: string
}

export type LeaveBalanceItem = {
  leaveType: string
  label: string
  annualLimit: number
  usedDays: number
  remainingDays: number
}

export type LeaveBalanceResponse = {
  employee: string
  year: number
  activeStatusesCounted: LeaveStatus[]
  balances: LeaveBalanceItem[]
}

export type EmployeeSelectOption = {
  value: string
  label: string
  meta?: string
}
