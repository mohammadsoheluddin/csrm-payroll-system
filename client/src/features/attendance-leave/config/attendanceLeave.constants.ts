import type {
  AttendanceQueryParams,
  AttendanceSource,
  AttendanceStatus,
  LeaveQueryParams,
  LeaveStatus,
  LeaveType,
} from '@/features/attendance-leave/types/attendanceLeave.types'

export const attendanceStatuses: AttendanceStatus[] = [
  'present',
  'absent',
  'late',
  'leave',
  'half-day',
  'weekend',
  'holiday',
]

export const attendanceSources: AttendanceSource[] = ['manual', 'device', 'import']

export const leaveTypes: LeaveType[] = [
  'casual',
  'sick',
  'earned',
  'paid',
  'unpaid',
  'maternity',
  'paternity',
  'official',
  'replacement',
  'others',
]

export const leaveStatuses: LeaveStatus[] = ['pending', 'approved', 'rejected', 'cancelled']

export const leaveApprovalStatuses = ['approved', 'rejected', 'cancelled'] as const

export const managementControlledLeaveTypes: LeaveType[] = ['paid', 'unpaid', 'others']

export const attendanceFilterDefaults: AttendanceQueryParams = {
  employee: '',
  company: '',
  department: '',
  status: '',
  source: '',
  attendanceDate: '',
  fromDate: '',
  toDate: '',
}

export const leaveFilterDefaults: LeaveQueryParams = {
  employee: '',
  leaveType: '',
  status: '',
  fromDate: '',
  toDate: '',
  managementConcern: '',
}

export const emptyAttendancePayload = {
  employee: '',
  attendanceDate: new Date().toISOString().slice(0, 10),
  checkInTime: '',
  checkOutTime: '',
  status: 'present' as AttendanceStatus,
  source: 'manual' as AttendanceSource,
  remarks: '',
  deviceId: '',
}

export const emptyLeavePayload = {
  employee: '',
  leaveType: 'casual' as LeaveType,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  reason: '',
  managementConcern: false,
  managementConcernNote: '',
  replacementForDate: '',
}
