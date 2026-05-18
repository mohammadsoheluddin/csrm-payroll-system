import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArchiveRestore, Edit3, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { SimpleDataTable } from '@/components/data-table/SimpleDataTable'
import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import {
  createAttendanceRecord,
  deleteAttendanceRecord,
  getAttendanceRecords,
  restoreAttendanceRecord,
  updateAttendanceRecord,
} from '@/features/attendance-leave/api/attendanceLeave.api'
import { AttendanceFormPanel } from '@/features/attendance-leave/components/AttendanceFormPanel'
import { AttendanceFinalizationFoundationPanel } from '@/features/attendance-leave/components/AttendanceFinalizationFoundationPanel'
import { AttendanceLeaveStatCards } from '@/features/attendance-leave/components/AttendanceLeaveStatCards'
import { AttendanceToolbar } from '@/features/attendance-leave/components/AttendanceToolbar'
import { attendanceFilterDefaults } from '@/features/attendance-leave/config/attendanceLeave.constants'
import type {
  AttendanceLeaveListMode,
  AttendanceQueryParams,
  AttendanceRecord,
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
import { useEmployeeLookups } from '@/features/employees/hooks/useEmployeeLookups'
import { getEmployeeId, getEmployeeReferenceId } from '@/features/employees/utils/employee.utils'
import { normalizeApiError } from '@/lib/api/apiError'
import { toTitleCase } from '@/lib/format/record.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

export const AttendanceRegisterPage = () => {
  const queryClient = useQueryClient()
  const canAccess = useAuthStore((state) => state.canAccess)
  const [mode, setMode] = useState<AttendanceLeaveListMode>('active')
  const [filters, setFilters] = useState<AttendanceQueryParams>({ ...attendanceFilterDefaults })
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [serverFormError, setServerFormError] = useState<string | null>(null)
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({})
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const canReadAttendance = canAccess([PERMISSIONS.ATTENDANCE_READ])
  const canManageAttendance = canAccess([PERMISSIONS.ATTENDANCE_MANAGE])
  const canReadFinalization = canAccess([PERMISSIONS.ATTENDANCE_FINALIZATION_READ])
  const canProcessFinalization = canAccess([PERMISSIONS.ATTENDANCE_FINALIZATION_PROCESS])
  const canApproveFinalization = canAccess([PERMISSIONS.ATTENDANCE_FINALIZATION_APPROVE])
  const canLockFinalization = canAccess([PERMISSIONS.ATTENDANCE_FINALIZATION_LOCK])
  const canUnlockFinalization = canAccess([PERMISSIONS.ATTENDANCE_FINALIZATION_UNLOCK])
  const queryKey = queryKeys.attendance.list(mode, filters)

  const attendanceQuery = useQuery({
    queryKey,
    queryFn: () => getAttendanceRecords({ mode, params: filters }),
    enabled: canReadAttendance,
  })

  const employeeOptionsQuery = useQuery({
    queryKey: queryKeys.employees.list('active', { attendanceSelect: true }),
    queryFn: () => getEmployees({ mode: 'active', params: { status: 'active' } }),
    enabled: canReadAttendance,
  })
  const employeeLookups = useEmployeeLookups({ enabled: canReadAttendance })

  const employeeOptions = useMemo(
    () => employeesToSelectOptions(employeeOptionsQuery.data ?? []),
    [employeeOptionsQuery.data],
  )

  const records = useMemo(() => attendanceQuery.data ?? [], [attendanceQuery.data])
  const employeesById = useMemo(() => {
    return new Map((employeeOptionsQuery.data ?? []).map((employee) => [getEmployeeId(employee), employee]))
  }, [employeeOptionsQuery.data])
  const visibleRecords = useMemo(() => {
    return records.filter((record) => {
      const employee =
        typeof record.employee === 'object' && record.employee !== null
          ? record.employee
          : employeesById.get(String(record.employee))

      const matchesCompany = filters.company
        ? getEmployeeReferenceId(employee?.company) === filters.company
        : true
      const matchesDepartment = filters.department
        ? getEmployeeReferenceId(employee?.department) === filters.department
        : true

      return matchesCompany && matchesDepartment
    })
  }, [employeesById, filters.company, filters.department, records])

  const clearFormErrors = () => {
    setServerFormError(null)
    setServerFieldErrors({})
  }

  const invalidateAttendance = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.attendance.root })
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
    mutationFn: createAttendanceRecord,
    onSuccess: async () => {
      toast.success('Attendance created successfully')
      closeForm()
      await invalidateAttendance()
    },
    onError: setFormError,
  })

  const updateMutation = useMutation({
    mutationFn: updateAttendanceRecord,
    onSuccess: async () => {
      toast.success('Attendance updated successfully')
      closeForm()
      await invalidateAttendance()
    },
    onError: setFormError,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAttendanceRecord,
    onSuccess: async () => {
      toast.success('Attendance soft deleted successfully')
      closeForm()
      await invalidateAttendance()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: restoreAttendanceRecord,
    onSuccess: async () => {
      toast.success('Attendance restored successfully')
      await invalidateAttendance()
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

  const handleDelete = (record: AttendanceRecord) => {
    const confirmed = window.confirm('Soft delete this attendance record?')

    if (!confirmed) {
      return
    }

    deleteMutation.mutate({ id: getRecordId(record), deleteReason: 'Deleted from frontend attendance register.' })
  }

  const handleRestore = (record: AttendanceRecord) => {
    restoreMutation.mutate({ id: getRecordId(record), restoreReason: 'Restored from frontend attendance register.' })
  }

  if (!canReadAttendance) {
    return <PermissionDeniedInline message="You need attendance:read permission to open the attendance register." />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Badge variant="default">Part-F20</Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">Attendance Register</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Attendance register foundation with filters, manual entry review, and monthly finalization preparation for payroll-safe workflows.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={() => void attendanceQuery.refetch()}
              disabled={attendanceQuery.isFetching}
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </Button>
            {canManageAttendance && mode === 'active' && (
              <Button
                type="button"
                onClick={() => {
                  setSelectedRecord(null)
                  clearFormErrors()
                  setFormMode('create')
                }}
              >
                <Plus className="h-4 w-4" /> New Attendance
              </Button>
            )}
          </div>
        </div>
      </section>

      <AttendanceLeaveStatCards type="attendance" records={visibleRecords} />

      <AttendanceToolbar
        mode={mode}
        filters={filters}
        employees={employeeOptions}
        companies={employeeLookups.companyOptions}
        departments={employeeLookups.getDepartmentOptions(filters.company)}
        onModeChange={(nextMode) => {
          setMode(nextMode)
          closeForm()
        }}
        onFiltersChange={(nextFilters) => setFilters(nextFilters)}
        onRefresh={() => void attendanceQuery.refetch()}
        isRefreshing={attendanceQuery.isFetching}
      />

      {employeeOptionsQuery.isError && (
        <ApiErrorState error={employeeOptionsQuery.error} onRetry={() => void employeeOptionsQuery.refetch()} />
      )}

      {employeeLookups.isError && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
          Company and department lookup options could not be loaded. Attendance records are still available through the backend-supported filters.
        </Card>
      )}

      {formMode !== 'closed' && (
        <AttendanceFormPanel
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
            <h2 className="text-base font-semibold text-foreground">Attendance Records</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {visibleRecords.length} of {records.length} {mode} records after the current UI filters.
            </p>
          </div>
        </div>

        {attendanceQuery.isLoading ? (
          <LoadingState title="Loading attendance records..." />
        ) : attendanceQuery.isError ? (
          <ApiErrorState error={attendanceQuery.error} onRetry={() => void attendanceQuery.refetch()} />
        ) : visibleRecords.length === 0 ? (
          <EmptyState
            title="No attendance records match these filters"
            message="Try clearing one or more filters, or create a new attendance entry if your role allows it."
          />
        ) : (
          <SimpleDataTable<AttendanceRecord>
            records={visibleRecords}
            getRowKey={(record) => getRecordId(record)}
            emptyMessage="No attendance records found for selected filters."
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
              { key: 'attendanceDate', label: 'Date' },
              {
                key: 'status',
                label: 'Status',
                render: (record) => <Badge variant={statusBadgeVariant(record.status)}>{toTitleCase(record.status ?? '—')}</Badge>,
              },
              {
                key: 'time',
                label: 'Time',
                render: (record) => `${record.checkInTime ?? '—'} → ${record.checkOutTime ?? '—'}`,
              },
              {
                key: 'source',
                label: 'Source',
                render: (record) => <Badge variant="muted">{toTitleCase(record.source ?? 'manual')}</Badge>,
              },
              { key: 'remarks', label: 'Remarks' },
            ]}
            actions={canManageAttendance ? (record) => (
              <div className="flex justify-end gap-2">
                {mode === 'active' && (
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
                {mode === 'deleted' && (
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
            ) : undefined}
          />
        )}
      </Card>

      <AttendanceFinalizationFoundationPanel
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        company={filters.company}
        department={filters.department}
        employee={filters.employee}
        canReadFinalization={canReadFinalization}
        canProcessFinalization={canProcessFinalization}
        canApproveFinalization={canApproveFinalization}
        canLockFinalization={canLockFinalization}
        canUnlockFinalization={canUnlockFinalization}
      />
    </div>
  )
}
