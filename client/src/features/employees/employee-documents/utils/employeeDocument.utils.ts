import type {
  EmployeeDocumentCategory,
  EmployeeDocumentConfidentiality,
  EmployeeDocumentQueryParams,
  EmployeeDocumentRecord,
  EmployeeDocumentStatus,
} from '@/features/employees/employee-documents/types/employeeDocument.types'

export const EMPLOYEE_DOCUMENT_MAX_UPLOAD_SIZE = 25 * 1024 * 1024

export const employeeDocumentAcceptedFileExtensions = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.txt',
  '.ppt',
  '.pptx',
] as const

export const employeeDocumentAcceptedFileTypes = employeeDocumentAcceptedFileExtensions.join(',')

const acceptedExtensionSet = new Set(employeeDocumentAcceptedFileExtensions.map((extension) => extension.replace('.', '')))

export const employeeDocumentCategoryOptions: Array<{ value: EmployeeDocumentCategory; label: string }> = [
  { value: 'nid', label: 'NID' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'passport', label: 'Passport' },
  { value: 'photo', label: 'Photo' },
  { value: 'cv', label: 'CV / Resume' },
  { value: 'educational_certificate', label: 'Educational Certificate' },
  { value: 'experience_certificate', label: 'Experience Certificate' },
  { value: 'appointment_letter', label: 'Appointment Letter' },
  { value: 'joining_letter', label: 'Joining Letter' },
  { value: 'confirmation_letter', label: 'Confirmation Letter' },
  { value: 'increment_letter', label: 'Increment Letter' },
  { value: 'promotion_letter', label: 'Promotion Letter' },
  { value: 'transfer_letter', label: 'Transfer Letter' },
  { value: 'warning_letter', label: 'Warning Letter' },
  { value: 'show_cause_letter', label: 'Show Cause Letter' },
  { value: 'termination_letter', label: 'Termination Letter' },
  { value: 'resignation_letter', label: 'Resignation Letter' },
  { value: 'clearance', label: 'Clearance' },
  { value: 'salary_certificate', label: 'Salary Certificate' },
  { value: 'training_certificate', label: 'Training Certificate' },
  { value: 'medical_certificate', label: 'Medical Certificate' },
  { value: 'bank_document', label: 'Bank Document' },
  { value: 'nominee_document', label: 'Nominee Document' },
  { value: 'other', label: 'Other' },
]

export const employeeDocumentStatusOptions: Array<{ value: EmployeeDocumentStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
  { value: 'archived', label: 'Archived' },
]

export const employeeDocumentConfidentialityOptions: Array<{
  value: EmployeeDocumentConfidentiality
  label: string
}> = [
  { value: 'internal', label: 'Internal' },
  { value: 'confidential', label: 'Confidential' },
  { value: 'highly_confidential', label: 'Highly Confidential' },
]

export const getEmployeeDocumentId = (record: Pick<EmployeeDocumentRecord, '_id' | 'id'>) => {
  const id = record._id ?? record.id
  return typeof id === 'string' ? id : ''
}

export const getEmployeeDocumentCategoryLabel = (category?: string) => {
  return employeeDocumentCategoryOptions.find((option) => option.value === category)?.label ?? 'Unknown'
}

export const getEmployeeDocumentStatusLabel = (status?: string) => {
  return employeeDocumentStatusOptions.find((option) => option.value === status)?.label ?? 'Unknown'
}

export const getEmployeeDocumentConfidentialityLabel = (confidentiality?: string) => {
  return employeeDocumentConfidentialityOptions.find((option) => option.value === confidentiality)?.label ?? 'Internal'
}

export const getEmployeeDocumentStatusVariant = (status?: string) => {
  if (status === 'verified') {
    return 'success' as const
  }

  if (status === 'rejected' || status === 'expired') {
    return 'danger' as const
  }

  if (status === 'archived') {
    return 'muted' as const
  }

  return 'warning' as const
}

export const getEmployeeDocumentConfidentialityVariant = (confidentiality?: string) => {
  if (confidentiality === 'highly_confidential') {
    return 'danger' as const
  }

  if (confidentiality === 'confidential') {
    return 'warning' as const
  }

  return 'muted' as const
}

export const formatFileSize = (size?: number) => {
  if (!size || !Number.isFinite(size)) {
    return '—'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let currentSize = size
  let unitIndex = 0

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024
    unitIndex += 1
  }

  return `${currentSize.toFixed(currentSize >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export const cleanEmployeeDocumentParams = (params: Partial<EmployeeDocumentQueryParams>) => {
  return Object.entries(params).reduce<Record<string, string>>((accumulator, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      accumulator[key] = String(value)
    }

    return accumulator
  }, {})
}

export const parseTagsInput = (value: string) => {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export const hasEmployeeDocumentExpired = (expiryDate?: string) => {
  if (!expiryDate) {
    return false
  }

  const today = new Date().toISOString().slice(0, 10)
  return expiryDate < today
}

export const getEmployeeDocumentDaysUntilExpiry = (expiryDate?: string) => {
  if (!expiryDate) {
    return null
  }

  const expiry = new Date(`${expiryDate.slice(0, 10)}T00:00:00.000Z`).getTime()
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`).getTime()

  if (!Number.isFinite(expiry) || !Number.isFinite(today)) {
    return null
  }

  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

export const getEmployeeDocumentExpiryLabel = (expiryDate?: string) => {
  const days = getEmployeeDocumentDaysUntilExpiry(expiryDate)

  if (days === null) {
    return 'No expiry'
  }

  if (days < 0) {
    return `Expired ${Math.abs(days)} day(s) ago`
  }

  if (days === 0) {
    return 'Expires today'
  }

  if (days <= 30) {
    return `Expires in ${days} day(s)`
  }

  return String(expiryDate).slice(0, 10)
}

export const getEmployeeDocumentExpiryVariant = (expiryDate?: string) => {
  const days = getEmployeeDocumentDaysUntilExpiry(expiryDate)

  if (days === null) {
    return 'muted' as const
  }

  if (days < 0) {
    return 'danger' as const
  }

  if (days <= 30) {
    return 'warning' as const
  }

  return 'success' as const
}

export const isEmployeeDocumentFileAllowed = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (!acceptedExtensionSet.has(extension)) {
    return `Unsupported file type .${extension || 'unknown'}. Allowed file types: ${employeeDocumentAcceptedFileExtensions.join(', ')}`
  }

  if (file.size > EMPLOYEE_DOCUMENT_MAX_UPLOAD_SIZE) {
    return `File is too large. Maximum allowed size is ${formatFileSize(EMPLOYEE_DOCUMENT_MAX_UPLOAD_SIZE)}.`
  }

  return null
}

export const deriveDocumentTitleFromFile = (fileName: string) => {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
}
