import type {
  EmployeeGender,
  EmployeePayType,
  EmployeeSelectOption,
  EmployeeServiceType,
  EmployeeStatus,
  EmploymentStatus,
} from '@/features/employees/types/employee.types'

export const employeeStatusOptions: EmployeeSelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const employmentStatusOptions: EmployeeSelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'probation', label: 'Probation' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'resigned', label: 'Resigned' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'retired', label: 'Retired' },
  { value: 'suspended', label: 'Suspended' },
]

export const serviceTypeOptions: EmployeeSelectOption[] = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'probation', label: 'Probation' },
  { value: 'contractual', label: 'Contractual' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'daily_wage', label: 'Daily Wage' },
  { value: 'intern', label: 'Intern' },
]

export const payTypeOptions: EmployeeSelectOption[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
  { value: 'hourly', label: 'Hourly' },
]

export const genderOptions: EmployeeSelectOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export const defaultEmployeePayload = (): import('@/features/employees/types/employee.types').EmployeePayload => ({
  employeeId: '',
  officeId: '',
  cardNo: '',
  name: {
    firstName: '',
    middleName: '',
    lastName: '',
  },
  email: '',
  phone: '',
  gender: 'male',
  dateOfBirth: '',
  company: '',
  majorDepartment: '',
  department: '',
  designation: '',
  branch: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  confirmationDate: '',
  serviceType: 'permanent',
  payType: 'monthly',
  dutyHourPerDay: 8,
  leaveDay: 0,
  employmentStatus: 'active',
  basicSalary: 0,
})

export const employeeFilterDefaults = {
  status: '' as EmployeeStatus | '',
  employmentStatus: '' as EmploymentStatus | '',
  serviceType: '' as EmployeeServiceType | '',
  payType: '' as EmployeePayType | '',
  company: '',
  majorDepartment: '',
  department: '',
  designation: '',
  branch: '',
}

export const isEmployeeGender = (value: string): value is EmployeeGender => {
  return genderOptions.some((option) => option.value === value)
}
