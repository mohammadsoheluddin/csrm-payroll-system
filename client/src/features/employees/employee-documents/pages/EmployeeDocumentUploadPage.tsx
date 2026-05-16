import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, ArchiveRestore, FileUp, RefreshCcw, Search, ShieldCheck, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import {
  deleteEmployeeDocument,
  downloadEmployeeDocumentFile,
  getEmployeeDocumentSummary,
  getEmployeeDocuments,
  rejectEmployeeDocument,
  restoreEmployeeDocument,
  uploadEmployeeDocumentFile,
  verifyEmployeeDocument,
} from '@/features/employees/employee-documents/api/employeeDocument.api'
import { EmployeeDocumentSummaryCards } from '@/features/employees/employee-documents/components/EmployeeDocumentSummaryCards'
import { EmployeeDocumentStatusDialog, type EmployeeDocumentStatusDialogState } from '@/features/employees/employee-documents/components/EmployeeDocumentStatusDialog'
import { EmployeeDocumentTable } from '@/features/employees/employee-documents/components/EmployeeDocumentTable'
import { EmployeeDocumentUploadPanel } from '@/features/employees/employee-documents/components/EmployeeDocumentUploadPanel'
import type {
  EmployeeDocumentCategory,
  EmployeeDocumentConfidentiality,
  EmployeeDocumentListMode,
  EmployeeDocumentQueryParams,
  EmployeeDocumentStatus,
} from '@/features/employees/employee-documents/types/employeeDocument.types'
import {
  cleanEmployeeDocumentParams,
  employeeDocumentCategoryOptions,
  employeeDocumentConfidentialityOptions,
  employeeDocumentStatusOptions,
  getEmployeeDocumentId,
} from '@/features/employees/employee-documents/utils/employeeDocument.utils'
import { getEmployees } from '@/features/employees/api/employee.api'
import type { EmployeeRecord } from '@/features/employees/types/employee.types'
import {
  getEmployeeDisplayName,
  getEmployeeId,
  getEmployeeReferenceId,
} from '@/features/employees/utils/employee.utils'
import { normalizeApiError } from '@/lib/api/apiError'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

const filterDefaults: EmployeeDocumentQueryParams = {
  category: '',
  status: '',
  confidentiality: '',
  expiryStatus: '',
  searchTerm: '',
}

const getEmployeeSearchText = (employee: EmployeeRecord) => {
  return [
    employee.employeeId,
    employee.officeId,
    employee.cardNo,
    getEmployeeDisplayName(employee),
    employee.phone,
    employee.email,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export const EmployeeDocumentUploadPage = () => {
  const queryClient = useQueryClient()
  const canAccess = useAuthStore((state) => state.canAccess)
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState<EmployeeDocumentListMode>('active')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(searchParams.get('employee') ?? '')
  const [filters, setFilters] = useState<EmployeeDocumentQueryParams>(filterDefaults)
  const [actionDialog, setActionDialog] = useState<EmployeeDocumentStatusDialogState>(null)
  const [uploadResetSignal, setUploadResetSignal] = useState(0)

  const canReadDocuments = canAccess([PERMISSIONS.EMPLOYEE_DOCUMENT_READ])
  const canUploadDocuments = canAccess([PERMISSIONS.EMPLOYEE_DOCUMENT_MANAGE])
  const canVerifyDocuments = canAccess([PERMISSIONS.EMPLOYEE_DOCUMENT_VERIFY])
  const canDeleteDocuments = canAccess([PERMISSIONS.EMPLOYEE_DOCUMENT_DELETE])

  const employeesQuery = useQuery({
    queryKey: queryKeys.employees.list('active', { status: 'active' }),
    queryFn: () => getEmployees({ mode: 'active', params: { status: 'active' } }),
    enabled: canReadDocuments,
  })

  const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data])

  const selectedEmployee = useMemo(() => {
    return employees.find((employee) => getEmployeeId(employee) === selectedEmployeeId)
  }, [employees, selectedEmployeeId])

  const selectedCompanyId = selectedEmployee ? getEmployeeReferenceId(selectedEmployee.company) : ''

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = employeeSearch.trim().toLowerCase()

    if (!normalizedSearch) {
      return employees.slice(0, 50)
    }

    return employees
      .filter((employee) => getEmployeeSearchText(employee).includes(normalizedSearch))
      .slice(0, 50)
  }, [employeeSearch, employees])

  const documentQueryParams = useMemo<EmployeeDocumentQueryParams>(() => {
    return {
      ...filters,
      employee: selectedEmployeeId || undefined,
      company: selectedCompanyId || undefined,
    }
  }, [filters, selectedCompanyId, selectedEmployeeId])

  const documentQueryKey = queryKeys.employeeDocuments.list(mode, cleanEmployeeDocumentParams(documentQueryParams))

  const documentsQuery = useQuery({
    queryKey: documentQueryKey,
    queryFn: () => getEmployeeDocuments({ mode, params: documentQueryParams }),
    enabled: canReadDocuments && Boolean(selectedEmployeeId),
  })

  const summaryQuery = useQuery({
    queryKey: queryKeys.employeeDocuments.summary(selectedEmployeeId),
    queryFn: () => getEmployeeDocumentSummary(selectedEmployeeId),
    enabled: canReadDocuments && Boolean(selectedEmployeeId),
  })

  const invalidateDocumentQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeDocuments.root }),
      selectedEmployeeId
        ? queryClient.invalidateQueries({ queryKey: queryKeys.employeeDocuments.summary(selectedEmployeeId) })
        : Promise.resolve(),
    ])
  }

  const uploadMutation = useMutation({
    mutationFn: uploadEmployeeDocumentFile,
    onSuccess: async () => {
      toast.success('Employee document uploaded successfully')
      setUploadResetSignal((current) => current + 1)
      await invalidateDocumentQueries()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: verifyEmployeeDocument,
    onSuccess: async () => {
      toast.success('Employee document verified')
      setActionDialog(null)
      await invalidateDocumentQueries()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectEmployeeDocument,
    onSuccess: async () => {
      toast.success('Employee document rejected')
      setActionDialog(null)
      await invalidateDocumentQueries()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEmployeeDocument,
    onSuccess: async () => {
      toast.success('Employee document soft deleted')
      setActionDialog(null)
      await invalidateDocumentQueries()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: restoreEmployeeDocument,
    onSuccess: async () => {
      toast.success('Employee document restored')
      setActionDialog(null)
      await invalidateDocumentQueries()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const downloadMutation = useMutation({
    mutationFn: downloadEmployeeDocumentFile,
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const isStatusMutating =
    verifyMutation.isPending || rejectMutation.isPending || deleteMutation.isPending || restoreMutation.isPending

  const confirmDocumentAction = (state: Exclude<EmployeeDocumentStatusDialogState, null>, note: string) => {
    const documentId = getEmployeeDocumentId(state.document)

    if (!documentId) {
      toast.error('Employee document id is missing')
      return
    }

    if (state.action === 'verify') {
      verifyMutation.mutate({ id: documentId, verificationRemarks: note })
      return
    }

    if (state.action === 'reject') {
      rejectMutation.mutate({ id: documentId, rejectionReason: note })
      return
    }

    if (state.action === 'delete') {
      deleteMutation.mutate({ id: documentId, deleteReason: note })
      return
    }

    restoreMutation.mutate({ id: documentId, restoreReason: note })
  }

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)

    const nextParams = new URLSearchParams(searchParams)
    if (employeeId) {
      nextParams.set('employee', employeeId)
    } else {
      nextParams.delete('employee')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const clearFilters = () => {
    setFilters(filterDefaults)
    setEmployeeSearch('')
  }

  if (!canReadDocuments) {
    return (
      <PermissionDeniedInline
        title="Employee document permission required"
        message="Your current role does not have employee_document:read permission. Ask admin/HR to update your access."
      />
    )
  }

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-muted/40 px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Part-F18.1</Badge>
                <Badge variant="default">Document Vault UI</Badge>
                <Badge variant="muted">Profile integrated</Badge>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">Employee Document Upload</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
                Upload, review, verify, reject, download, soft-delete, and restore employee documents. This polish pass
                adds safer upload validation, action dialogs, and employee profile document snapshot integration.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={mode === 'active' ? 'primary' : 'outline'} onClick={() => setMode('active')}>
                <Archive className="h-4 w-4" />
                Active
              </Button>
              <Button type="button" variant={mode === 'deleted' ? 'primary' : 'outline'} onClick={() => setMode('deleted')}>
                <ArchiveRestore className="h-4 w-4" />
                Deleted
              </Button>
              <Button type="button" variant="outline" onClick={() => documentsQuery.refetch()} disabled={!selectedEmployeeId}>
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 xl:grid-cols-[1.1fr_2fr]">
          <div className="space-y-3">
            <label className="space-y-2 text-sm font-medium text-foreground">
              Search employee
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
                  value={employeeSearch}
                  placeholder="Search ID, office ID, card no, name, phone"
                  onChange={(event) => setEmployeeSearch(event.target.value)}
                />
              </div>
            </label>

            <label className="space-y-2 text-sm font-medium text-foreground">
              Employee
              <select
                className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                value={selectedEmployeeId}
                onChange={(event) => handleEmployeeSelect(event.target.value)}
              >
                <option value="">Select employee</option>
                {filteredEmployees.map((employee) => (
                  <option key={getEmployeeId(employee)} value={getEmployeeId(employee)}>
                    {getEmployeeDisplayName(employee)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm font-medium text-foreground">
              Category
              <select
                className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                value={filters.category ?? ''}
                onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value as EmployeeDocumentCategory | '' }))}
              >
                <option value="">All categories</option>
                {employeeDocumentCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-foreground">
              Status
              <select
                className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                value={filters.status ?? ''}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as EmployeeDocumentStatus | '' }))}
              >
                <option value="">All status</option>
                {employeeDocumentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-foreground">
              Confidentiality
              <select
                className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                value={filters.confidentiality ?? ''}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    confidentiality: event.target.value as EmployeeDocumentConfidentiality | '',
                  }))
                }
              >
                <option value="">All confidentiality</option>
                {employeeDocumentConfidentialityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-foreground">
              Search document
              <input
                className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                value={filters.searchTerm ?? ''}
                placeholder="Title, file, doc no, remarks"
                onChange={(event) => setFilters((current) => ({ ...current, searchTerm: event.target.value }))}
              />
            </label>

            <div className="sm:col-span-2 xl:col-span-4">
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {employeesQuery.isLoading && (
        <LoadingState title="Loading employees" message="Preparing employee selector for document upload." />
      )}

      {employeesQuery.isError && <ApiErrorState error={employeesQuery.error} onRetry={() => employeesQuery.refetch()} />}

      {!selectedEmployee && !employeesQuery.isLoading && (
        <EmptyState
          title="Select employee first"
          message="Choose an employee from the selector above to upload and manage employee documents."
        />
      )}

      {selectedEmployee && (
        <>
          <EmployeeDocumentSummaryCards summary={summaryQuery.data} />

          {summaryQuery.isError && <ApiErrorState error={summaryQuery.error} onRetry={() => summaryQuery.refetch()} />}

          <Card className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Selected employee document workspace</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {getEmployeeDisplayName(selectedEmployee)} • Uploads and verification actions will be linked to this employee.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Total</p>
                  <p className="mt-1 font-black text-foreground">{summaryQuery.data?.counters.total ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Verified</p>
                  <p className="mt-1 font-black text-foreground">{summaryQuery.data?.counters.verified ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Pending</p>
                  <p className="mt-1 font-black text-foreground">{summaryQuery.data?.counters.pending ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Rejected</p>
                  <p className="mt-1 font-black text-foreground">{summaryQuery.data?.counters.rejected ?? 0}</p>
                </div>
              </div>
            </div>
          </Card>

          <EmployeeDocumentUploadPanel
            key={`${selectedEmployeeId}-${uploadResetSignal}`}
            employee={selectedEmployee}
            companyId={selectedCompanyId}
            canUpload={canUploadDocuments}
            isUploading={uploadMutation.isPending}
            onUpload={(payload) => uploadMutation.mutate(payload)}
          />

          <Card className="overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default">Selected: {getEmployeeDisplayName(selectedEmployee)}</Badge>
                    {mode === 'deleted' && <Badge variant="warning">Deleted Archive</Badge>}
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-foreground">Document List</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review uploaded documents, download secured files, and perform verification actions based on role permission.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {documentsQuery.data?.length ?? 0} document(s)
                </div>
              </div>
            </div>

            {documentsQuery.isLoading && (
              <LoadingState title="Loading employee documents" message="Fetching document vault records." />
            )}

            {documentsQuery.isError && <ApiErrorState error={documentsQuery.error} onRetry={() => documentsQuery.refetch()} />}

            {!documentsQuery.isLoading && !documentsQuery.isError && (
              <EmployeeDocumentTable
                records={documentsQuery.data ?? []}
                mode={mode}
                canManage={canUploadDocuments}
                canVerify={canVerifyDocuments}
                canDelete={canDeleteDocuments}
                isMutating={isStatusMutating}
                onDownload={(document) => downloadMutation.mutate(document)}
                onVerify={(document) => setActionDialog({ action: 'verify', document })}
                onReject={(document) => setActionDialog({ action: 'reject', document })}
                onDelete={(document) => setActionDialog({ action: 'delete', document })}
                onRestore={(document) => setActionDialog({ action: 'restore', document })}
              />
            )}
          </Card>
        </>
      )}

      <Card className="p-5">
        <div className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <FileUp className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Part-F18 integration note</p>
            <p>
              This frontend sends binary files to <span className="font-semibold text-foreground">POST /employee-documents/upload</span>. Document metadata
              is saved in MongoDB, actual files are stored by the backend file-storage abstraction, and document records are connected
              to Employee Profile / Digital Service Book without touching payroll calculations.
            </p>
          </div>
        </div>
      </Card>
      <EmployeeDocumentStatusDialog
        state={actionDialog}
        isSubmitting={isStatusMutating}
        onClose={() => setActionDialog(null)}
        onConfirm={confirmDocumentAction}
      />
    </section>
  )
}
