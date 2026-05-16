import type { EmployeeReference } from '@/features/employees/types/employee.types'

export type EmployeeDocumentCategory =
  | 'nid'
  | 'birth_certificate'
  | 'passport'
  | 'photo'
  | 'cv'
  | 'educational_certificate'
  | 'experience_certificate'
  | 'appointment_letter'
  | 'joining_letter'
  | 'confirmation_letter'
  | 'increment_letter'
  | 'promotion_letter'
  | 'transfer_letter'
  | 'warning_letter'
  | 'show_cause_letter'
  | 'termination_letter'
  | 'resignation_letter'
  | 'clearance'
  | 'salary_certificate'
  | 'training_certificate'
  | 'medical_certificate'
  | 'bank_document'
  | 'nominee_document'
  | 'other'

export type EmployeeDocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired' | 'archived'

export type EmployeeDocumentConfidentiality = 'internal' | 'confidential' | 'highly_confidential'

export type EmployeeDocumentStorageProvider = 'local' | 'url' | 'external' | 'pending'

export type EmployeeDocumentQueryParams = {
  employee?: string
  company?: string
  category?: EmployeeDocumentCategory | ''
  status?: EmployeeDocumentStatus | ''
  confidentiality?: EmployeeDocumentConfidentiality | ''
  storageProvider?: EmployeeDocumentStorageProvider | ''
  expiryStatus?: 'expired' | 'expiring_soon' | 'valid' | 'no_expiry' | ''
  searchTerm?: string
  fromDate?: string
  toDate?: string
}

export type EmployeeDocumentRecord = Record<string, unknown> & {
  _id?: string
  id?: string
  employee: EmployeeReference | string
  company: EmployeeReference | string
  category: EmployeeDocumentCategory
  title: string
  documentNo?: string
  issuingAuthority?: string
  issueDate?: string
  expiryDate?: string
  fileName: string
  originalFileName?: string
  fileExtension?: string
  mimeType?: string
  fileSize?: number
  fileUrl?: string
  storageProvider: EmployeeDocumentStorageProvider
  storagePath?: string
  checksum?: string
  confidentiality: EmployeeDocumentConfidentiality
  status: EmployeeDocumentStatus
  verifiedAt?: string | Date | null
  verifiedBy?: EmployeeReference | string | null
  verificationRemarks?: string | null
  rejectedAt?: string | Date | null
  rejectedBy?: EmployeeReference | string | null
  rejectionReason?: string | null
  uploadedBy?: EmployeeReference | string | null
  remarks?: string
  tags?: string[]
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

export type EmployeeDocumentUploadPayload = {
  file: File
  employee: string
  company: string
  category: EmployeeDocumentCategory
  title: string
  documentNo?: string
  issuingAuthority?: string
  issueDate?: string
  expiryDate?: string
  confidentiality?: EmployeeDocumentConfidentiality
  status?: Extract<EmployeeDocumentStatus, 'pending' | 'archived'>
  remarks?: string
  tags?: string[]
}

export type EmployeeDocumentVerifyPayload = {
  id: string
  verificationRemarks?: string
}

export type EmployeeDocumentRejectPayload = {
  id: string
  rejectionReason: string
}

export type EmployeeDocumentDeletePayload = {
  id: string
  deleteReason?: string
}

export type EmployeeDocumentRestorePayload = {
  id: string
  restoreReason?: string
}

export type EmployeeDocumentSummary = {
  employee: {
    id: string
    employeeId?: string
    officeId?: string
    cardNo?: string
  }
  counters: {
    total: number
    pending: number
    verified: number
    rejected: number
    expired: number
    highlyConfidential: number
  }
  documentProfileReady: boolean
}

export type EmployeeDocumentListMode = 'active' | 'deleted'
