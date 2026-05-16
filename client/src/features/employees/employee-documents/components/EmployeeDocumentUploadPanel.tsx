import { CheckCircle2, FileText, UploadCloud, X } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type {
  EmployeeDocumentCategory,
  EmployeeDocumentConfidentiality,
  EmployeeDocumentUploadPayload,
} from '@/features/employees/employee-documents/types/employeeDocument.types'
import {
  deriveDocumentTitleFromFile,
  employeeDocumentAcceptedFileTypes,
  employeeDocumentCategoryOptions,
  employeeDocumentConfidentialityOptions,
  formatFileSize,
  isEmployeeDocumentFileAllowed,
  parseTagsInput,
} from '@/features/employees/employee-documents/utils/employeeDocument.utils'
import type { EmployeeRecord } from '@/features/employees/types/employee.types'
import { getEmployeeDisplayName } from '@/features/employees/utils/employee.utils'
import { cn } from '@/lib/utils/cn'

type UploadPanelState = {
  category: EmployeeDocumentCategory
  title: string
  documentNo: string
  issuingAuthority: string
  issueDate: string
  expiryDate: string
  confidentiality: EmployeeDocumentConfidentiality
  remarks: string
  tags: string
}

const initialFormState: UploadPanelState = {
  category: 'nid',
  title: '',
  documentNo: '',
  issuingAuthority: '',
  issueDate: '',
  expiryDate: '',
  confidentiality: 'internal',
  remarks: '',
  tags: '',
}

export const EmployeeDocumentUploadPanel = ({
  employee,
  companyId,
  canUpload,
  isUploading,
  onUpload,
}: {
  employee?: EmployeeRecord
  companyId?: string
  canUpload: boolean
  isUploading: boolean
  onUpload: (payload: EmployeeDocumentUploadPayload) => void
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [formState, setFormState] = useState<UploadPanelState>(initialFormState)
  const [clientError, setClientError] = useState<string | null>(null)

  const resetForm = () => {
    setFile(null)
    setFormState(initialFormState)
    setClientError(null)
  }

  const updateField = <TKey extends keyof UploadPanelState>(field: TKey, value: UploadPanelState[TKey]) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const handleFileChange = (selectedFile?: File) => {
    setClientError(null)

    if (!selectedFile) {
      setFile(null)
      return
    }

    const validationError = isEmployeeDocumentFileAllowed(selectedFile)
    if (validationError) {
      setFile(null)
      setClientError(validationError)
      return
    }

    setFile(selectedFile)
    setFormState((current) => ({
      ...current,
      title: current.title.trim() ? current.title : deriveDocumentTitleFromFile(selectedFile.name),
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setClientError(null)

    const employeeId = typeof employee?._id === 'string' ? employee._id : typeof employee?.id === 'string' ? employee.id : ''

    if (!employeeId || !companyId) {
      setClientError('Select an employee with a valid company before uploading a document.')
      return
    }

    if (!file) {
      setClientError('Select a document file first.')
      return
    }

    const validationError = isEmployeeDocumentFileAllowed(file)
    if (validationError) {
      setClientError(validationError)
      return
    }

    if (!formState.title.trim()) {
      setClientError('Document title is required.')
      return
    }

    if (formState.issueDate && formState.expiryDate && formState.issueDate > formState.expiryDate) {
      setClientError('Issue date cannot be later than expiry date.')
      return
    }

    onUpload({
      file,
      employee: employeeId,
      company: companyId,
      category: formState.category,
      title: formState.title.trim(),
      documentNo: formState.documentNo.trim() || undefined,
      issuingAuthority: formState.issuingAuthority.trim() || undefined,
      issueDate: formState.issueDate || undefined,
      expiryDate: formState.expiryDate || undefined,
      confidentiality: formState.confidentiality,
      remarks: formState.remarks.trim() || undefined,
      tags: parseTagsInput(formState.tags),
    })
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-muted/40 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">Part-F18.1</Badge>
              <Badge variant="default">Actual Upload</Badge>
              <Badge variant="muted">Profile linked</Badge>
            </div>
            <h3 className="mt-3 text-lg font-bold text-foreground">Upload employee document</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Upload HR documents into the employee digital vault. Files are validated before upload and remain separate
              from native payroll calculation.
            </p>
          </div>
          <div className="rounded-2xl bg-card px-4 py-3 text-sm shadow-sm ring-1 ring-border">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected employee</p>
            <p className="mt-1 font-semibold text-foreground">{employee ? getEmployeeDisplayName(employee) : 'No employee selected'}</p>
          </div>
        </div>
      </div>

      <form className="space-y-5 p-5" onSubmit={handleSubmit}>
        {!canUpload && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-300">
            Your current role can view documents but cannot upload or change document status.
          </div>
        )}

        {clientError && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {clientError}
          </div>
        )}

        <label
          className={cn(
            'flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 px-5 py-6 text-center transition hover:border-primary/40 hover:bg-primary/5',
            file && 'border-primary/40 bg-primary/5',
          )}
        >
          <UploadCloud className="h-10 w-10 text-primary" />
          <span className="mt-3 text-sm font-semibold text-foreground">{file ? file.name : 'Choose document file'}</span>
          <span className="mt-1 text-xs leading-5 text-muted-foreground">
            Allowed: PDF, image, Word, Excel, CSV, text, PowerPoint. Maximum file size: 25 MB.
          </span>
          <input
            type="file"
            className="sr-only"
            accept={employeeDocumentAcceptedFileTypes}
            disabled={!canUpload || isUploading || !employee}
            onChange={(event) => handleFileChange(event.target.files?.[0])}
          />
        </label>

        {file && (
          <div className="rounded-3xl border border-border bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {file.type || 'application/octet-stream'}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Ready
                </Badge>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleFileChange(undefined)} disabled={isUploading}>
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-foreground">
            Category
            <select
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              value={formState.category}
              disabled={!canUpload || isUploading}
              onChange={(event) => updateField('category', event.target.value as EmployeeDocumentCategory)}
            >
              {employeeDocumentCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground xl:col-span-2">
            Document Title
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              value={formState.title}
              disabled={!canUpload || isUploading}
              placeholder="Example: Employee NID Copy"
              onChange={(event) => updateField('title', event.target.value)}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            Document No
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              value={formState.documentNo}
              disabled={!canUpload || isUploading}
              placeholder="Optional"
              onChange={(event) => updateField('documentNo', event.target.value)}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            Issuing Authority
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              value={formState.issuingAuthority}
              disabled={!canUpload || isUploading}
              placeholder="Optional"
              onChange={(event) => updateField('issuingAuthority', event.target.value)}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            Confidentiality
            <select
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              value={formState.confidentiality}
              disabled={!canUpload || isUploading}
              onChange={(event) => updateField('confidentiality', event.target.value as EmployeeDocumentConfidentiality)}
            >
              {employeeDocumentConfidentialityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            Issue Date
            <input
              type="date"
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              value={formState.issueDate}
              disabled={!canUpload || isUploading}
              onChange={(event) => updateField('issueDate', event.target.value)}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            Expiry Date
            <input
              type="date"
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              value={formState.expiryDate}
              disabled={!canUpload || isUploading}
              onChange={(event) => updateField('expiryDate', event.target.value)}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground">
            Tags
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              value={formState.tags}
              disabled={!canUpload || isUploading}
              placeholder="nid, joining, verified"
              onChange={(event) => updateField('tags', event.target.value)}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-foreground md:col-span-2 xl:col-span-3">
            Remarks
            <textarea
              className="min-h-24 w-full rounded-2xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
              value={formState.remarks}
              disabled={!canUpload || isUploading}
              placeholder="Optional remarks"
              onChange={(event) => updateField('remarks', event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" disabled={!canUpload || isUploading} onClick={resetForm}>
            Reset
          </Button>
          <Button type="submit" disabled={!canUpload || isUploading || !employee}>
            <UploadCloud className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
