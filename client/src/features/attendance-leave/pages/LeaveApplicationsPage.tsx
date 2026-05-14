import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArchiveRestore, CheckCircle2, Edit3, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { SimpleDataTable } from '@/components/data-table/SimpleDataTable'
import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import {
  approveLeaveRecord,
  createLeaveRecord,
  deleteLeaveRecord,
  getLeaveRecords,
  restoreLeaveRecord,
  updateLeaveRecord,
} from '@/features/attendance-leave/api/attendanceLeave.api'
import { AttendanceLeaveStatCards } from '@/features/attendance-leave/components/AttendanceLeaveStatCards'
import { LeaveApprovalDialog } from '@/features/attendance-leave/components/LeaveApprovalDialog'
import { LeaveBalancePanel } from '@/features/attendance-leave/components/LeaveBalancePanel'
import { LeaveFormPanel } from '@/features/attendance-leave/components/LeaveFormPanel'
import { LeaveToolbar } from '@/features/attendance-leave/components/LeaveToolbar'
import { leaveFilterDefaults } from '@/features/attendance-leave/config/attendanceLeave.constants'
import type {
  AttendanceLeaveListMode,
  LeaveApprovalPayload,
  LeaveQueryParams,
  LeaveRecord,
} from '@/features/attendance-leave/types/attendanceLeave.types'
import {
  employeesToSelectOptions,
  getAttendanceLeaveEmployeeCode,
  getAttendanceLeaveEmployeeName,
  getEmployeeDepartmentLabel,
  getRecordId,
  normalizeServerFieldErrors,
  statusBadgeVariant,
} from '@/features/attendance-leave/utils/attendanceLeave.utils'
import { getEmployees } from '@/features/employees/api/employee.api'
import { normalizeApiError } from '@/lib/api/apiError'
import { toTitleCase } from '@/lib/format/record.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

export const LeaveApplicationsPage = () => {
  const queryClient = useQueryClient()
  const canAccess = useAuthStore((state) => state.canAccess)
  const [mode, setMode] = useState<AttendanceLeaveListMode>('active')
  const [filters, setFilters] = useState<LeaveQueryParams>({ ...leaveFilterDefaults })
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [selectedRecord, setSelectedRecord] = useState<LeaveRecord | null>(null)
  const [approvalRecord, setApprovalRecord] = useState<LeaveRecord | null>(null)
  const [serverFormError, setServerFormError] = useState<string | null>(null)
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({})

  const canReadLeave = canAccess([PERMISSIONS.LEAVE_READ])
  const canManageLeave = canAccess([PERMISSIONS.LEAVE_MANAGE])
  const canApproveLeave = canAccess([PERMISSIONS.LEAVE_APPROVE])
  const currentYear = new Date().getFullYear()
  const queryKey = queryKeys.leave.list(mode, filters)

  const leaveQuery = useQuery({
    queryKey,
    queryFn: () => getLeaveRecords({ mode, params: filters }),
    enabled: canReadLeave,
  })

  const employeeOptionsQuery = useQuery({
    queryKey: queryKeys.employees.list('active', { leaveSelect: true }),
    queryFn: () => getEmployees({ mode: 'active', params: { status: 'active' } }),
    enabled: canReadLeave,
  })

  const employeeOptions = useMemo(
    () => employeesToSelectOptions(employeeOptionsQuery.data ?? []),
    [employeeOptionsQuery.data],
  )

  const records = leaveQuery.data ?? []

  const clearFormErrors = () => {
    setServerFormError(null)
    setServerFieldErrors({})
  }

  const invalidateLeaves = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.leave.root })
  }

  const closeForm = () => {
    setFormMode('closed')
    setSelectedRecord(null)
    clearFormErrors()
  }

  const setFormError = (error: unknown) => {
    const normalized = normalizeApiError(error)
    setServerFormError(normalized.message)
    setServerFieldErrors(normalizeServerFieldErrors(normalized.errorSources))
    toast.error(normalized.message, { description: normalized.title })
  }

  const createMutation = useMutation({
    mutationFn: createLeaveRecord,
    onSuccess: async () => {
      toast.success('Leave application created successfully')
      closeForm()
      await invalidateLeaves()
    },
    onError: setFormError,
  })

  const updateMutation = useMutation({
    mutationFn: updateLeaveRecord,
    onSuccess: async () => {
      toast.success('Leave application updated successfully')
      closeForm()
      await invalidateLeaves()
    },
    onError: setFormError,
  })

  const approveMutation = useMutation({
    mutationFn: approveLeaveRecord,
    onSuccess: async () => {
      toast.success('Leave approval updated successfully')
      setApprovalRecord(null)
      await invalidateLeaves()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLeaveRecord,
    onSuccess: async () => {
      toast.success('Leave application soft deleted successfully')
      closeForm()
      setApprovalRecord(null)
      await invalidateLeaves()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: restoreLeaveRecord,
    onSuccess: async () => {
      toast.success('Leave application restored successfully')
      await invalidateLeaves()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const handleSubmit = (payload: Record<string, unknown>) => {
    clearFormErrors()

    if (formMode === 'edit' && selectedRecord) {
      updateMutation.mutate({ id: getRecordId(selectedRecord), payload })
      return
    }

    createMutation.mutate(payload)
  }

  const handleApprovalSubmit = (id: string, payload: LeaveApprovalPayload) => {
    approveMutation.mutate({ id, payload })
  }

  const handleDelete = (record: LeaveRecord) => {
    const confirmed = window.confirm('Soft delete this leave application? Approved leave must be rejected/cancelled first.')

    if (!confirmed) {
      return
    }

    deleteMutation.mutate({ id: getRecordId(record), deleteReason: 'Deleted from frontend leave applications.' })
  }

  const handleRestore = (record: LeaveRecord) => {
    restoreMutation.mutate({ id: getRecordId(record), restoreReason: 'Restored from frontend leave applications.' })
  }

  if (!canReadLeave) {
    return <PermissionDeniedInline message="You need leave:read permission to open the leave applications screen." />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge variant="default">Part-F9</Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">Leave Applications</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Backend-connected leave applications, approval workflow, balance snapshot, soft delete, restore, and management concern foundation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void leaveQuery.refetch()} disabled={leaveQuery.isFetching}>
              <RefreshCcw className="h-4 w-4" /> Refresh
            </Button>
            {canManageLeave && mode === 'active' && (
              <Button
                type="button"
                onClick={() => {
                  setSelectedRecord(null)
                  clearFormErrors()
                  setFormMode('create')
                }}
              >
                <Plus className="h-4 w-4" /> New Leave
              </Button>
            )}
          </div>
        </div>
      </section>

      <AttendanceLeaveStatCards type="leave" records={records} />

      <LeaveToolbar
        mode={mode}
        filters={filters}
        employees={employeeOptions}
        onModeChange={(nextMode) => {
          setMode(nextMode)
          closeForm()
          setApprovalRecord(null)
        }}
        onFiltersChange={(nextFilters) => setFilters(nextFilters)}
        onRefresh={() => void leaveQuery.refetch()}
        isRefreshing={leaveQuery.isFetching}
      />

      <LeaveBalancePanel employeeId={filters.employee} year={currentYear} employees={employeeOptions} />

      {employeeOptionsQuery.isError && (
        <ApiErrorState error={employeeOptionsQuery.error} onRetry={() => void employeeOptionsQuery.refetch()} />
      )}

      {formMode !== 'closed' && (
        <LeaveFormPanel
          key={`${formMode}-${selectedRecord?._id ?? selectedRecord?.id ?? 'new'}`}
          mode={formMode}
          record={selectedRecord}
          employees={employeeOptions}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          serverError={serverFormError}
          fieldErrors={serverFieldErrors}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Leave Records</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {records.length} {mode} records from backend leave API.
            </p>
          </div>
        </div>

        {leaveQuery.isLoading ? (
          <LoadingState title="Loading leave records..." />
        ) : leaveQuery.isError ? (
          <ApiErrorState error={leaveQuery.error} onRetry={() => void leaveQuery.refetch()} />
        ) : (
          <SimpleDataTable<LeaveRecord>
            records={records}
            getRowKey={(record) => getRecordId(record)}
            emptyMessage="No leave applications found for selected filters."
            columns={[
              {
                key: 'employee',
                label: 'Employee',
                render: (record) => (
                  <div>
                    <p className="font-semibold text-foreground">{getAttendanceLeaveEmployeeName(record)}</p>
                    <p className="text-xs text-muted-foreground">{getAttendanceLeaveEmployeeCode(record)}</p>
                  </div>
                ),
              },
              {
                key: 'department',
                label: 'Department',
                render: (record) => getEmployeeDepartmentLabel(record),
              },
              {
                key: 'leaveType',
                label: 'Type',
                render: (record) => <Badge variant="muted">{toTitleCase(record.leaveType)}</Badge>,
              },
              {
                key: 'dateRange',
                label: 'Date Range',
                render: (record) => `${record.startDate} → ${record.endDate}`,
              },
              { key: 'totalDays', label: 'Days' },
              {
                key: 'status',
                label: 'Status',
                render: (record) => <Badge variant={statusBadgeVariant(record.status)}>{toTitleCase(record.status ?? 'pending')}</Badge>,
              },
              {
                key: 'managementConcern',
                label: 'Concern',
                render: (record) => (
                  <Badge variant={record.managementConcern ? 'warning' : 'muted'}>
                    {record.managementConcern ? 'Yes' : 'No'}
                  </Badge>
                ),
              },
              { key: 'reason', label: 'Reason' },
            ]}
            actions={(record) => (
              <div className="flex justify-end gap-2">
                {canApproveLeave && mode === 'active' && record.status === 'pending' && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setApprovalRecord(record)}>
                    <CheckCircle2 className="h-4 w-4" /> Review
                  </Button>
                )}
                {canManageLeave && mode === 'active' && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRecord(record)
                        clearFormErrors()
                        setFormMode('edit')
                      }}
                    >
                      <Edit3 className="h-4 w-4" /> Edit
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(record)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </>
                )}
                {canManageLeave && mode === 'deleted' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(record)}
                    disabled={restoreMutation.isPending}
                  >
                    <ArchiveRestore className="h-4 w-4" /> Restore
                  </Button>
                )}
              </div>
            )}
          />
        )}
      </Card>

      {approvalRecord && (
        <LeaveApprovalDialog
          key={getRecordId(approvalRecord)}
          record={approvalRecord}
          isSubmitting={approveMutation.isPending}
          onClose={() => setApprovalRecord(null)}
          onSubmit={handleApprovalSubmit}
        />
      )}
    </div>
  )
}
