import type { Permission } from '@/config/permissions'

export type EmployeeListMode = 'active' | 'deleted'

export type EmployeeStatus = 'active' | 'inactive'

export type EmploymentStatus =
  | 'active'
  | 'probation'
  | 'confirmed'
  | 'resigned'
  | 'terminated'
  | 'retired'
  | 'suspended'

export type EmployeeServiceType =
  | 'permanent'
  | 'probation'
  | 'contractual'
  | 'temporary'
  | 'daily_wage'
  | 'intern'

export type EmployeePayType = 'monthly' | 'daily' | 'hourly'

export type EmployeeGender = 'male' | 'female' | 'other'

export type EmployeeReference = {
  _id?: string
  id?: string
  name?: string
  shortName?: string
  code?: string
  email?: string
  role?: string
  category?: string
  status?: string
}

export type EmployeeName = {
  firstName: string
  middleName?: string
  lastName: string
}

export type EmployeeRecord = Record<string, unknown> & {
  _id?: string
  id?: string
  employeeId: string
  officeId?: string
  cardNo?: string
  user?: EmployeeReference | string
  name: EmployeeName
  email: string
  phone: string
  gender: EmployeeGender
  dateOfBirth?: string
  company: EmployeeReference | string
  majorDepartment: EmployeeReference | string
  department: EmployeeReference | string
  designation: EmployeeReference | string
  branch: EmployeeReference | string
  joiningDate: string
  confirmationDate?: string
  serviceType: EmployeeServiceType
  payType: EmployeePayType
  dutyHourPerDay: number
  leaveDay: number
  employmentStatus: EmploymentStatus
  basicSalary?: number
  status?: EmployeeStatus
  lifecycleChangedAt?: string | Date | null
  lifecycleChangedBy?: EmployeeReference | string | null
  lifecycleChangeReason?: string | null
  lifecycleEffectiveDate?: string | null
  separatedAt?: string | null
  separationReason?: string | null
  statusBeforeDelete?: EmployeeStatus | null
  employmentStatusBeforeDelete?: EmploymentStatus | null
  isDeleted?: boolean
  deletedAt?: string | Date | null
  deletedBy?: EmployeeReference | string | null
  deleteReason?: string | null
  restoredAt?: string | Date | null
  restoredBy?: EmployeeReference | string | null
  restoreReason?: string | null
  createdAt?: string
  updatedAt?: string
}

export type EmployeeQueryParams = {
  status?: EmployeeStatus | ''
  employmentStatus?: EmploymentStatus | ''
  serviceType?: EmployeeServiceType | ''
  payType?: EmployeePayType | ''
  company?: string
  majorDepartment?: string
  department?: string
  designation?: string
  branch?: string
}

export type EmployeePayload = {
  employeeId?: string
  officeId?: string
  cardNo?: string
  name: EmployeeName
  email: string
  phone: string
  gender: EmployeeGender | ''
  dateOfBirth?: string
  company: string
  majorDepartment: string
  department: string
  designation: string
  branch: string
  joiningDate: string
  confirmationDate?: string
  serviceType: EmployeeServiceType | ''
  payType: EmployeePayType | ''
  dutyHourPerDay?: number | string
  leaveDay?: number | string
  employmentStatus?: EmploymentStatus | ''
  basicSalary?: number | string
}

export type EmployeeFormMode = 'closed' | 'create' | 'edit'

export type EmployeeLifecyclePayload = {
  employmentStatus: EmploymentStatus
  effectiveDate?: string
  reason: string
}

export type EmployeeSelectOption = {
  value: string
  label: string
}

export type EmployeeAction = {
  label: string
  permission: Permission
}
