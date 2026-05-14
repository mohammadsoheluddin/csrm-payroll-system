import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Eye, LockKeyhole, Play, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { SimpleDataTable, type SimpleDataTableColumn } from '@/components/data-table/SimpleDataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import {
  deletePayrollRecord,
  downloadMonthlyPayrollReport,
  generatePayroll,
  getPayrollRecords,
  payrollActionEndpoint,
  restorePayrollRecord,
  runPayrollAction,
} from '@/features/payroll/api/payroll.api'
import { PayrollActionDialog } from '@/features/payroll/components/PayrollActionDialog'
import { PayrollDetailDrawer } from '@/features/payroll/components/PayrollDetailDrawer'
import { PayrollGeneratePanel } from '@/features/payroll/components/PayrollGeneratePanel'
import { PayrollPeriodToolbar } from '@/features/payroll/components/PayrollPeriodToolbar'
import { PayrollStatCards } from '@/features/payroll/components/PayrollStatCards'
import { usePayrollLookups } from '@/features/payroll/hooks/usePayrollLookups'
import type { PayrollListMode, PayrollPeriodQuery, PayrollRecord } from '@/features/payroll/types/payroll.types'
import {
  currentPayrollMonth,
  formatCurrency,
  getEmployeeDisplayName,
  getPayrollRecordId,
  getStatusBadgeVariant,
} from '@/features/payroll/utils/payroll.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useApiMutation } from '@/lib/query/useApiMutation'
import { useAuthStore } from '@/stores/auth.store'

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'processed', label: 'Processed' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
]

const columns: SimpleDataTableColumn<PayrollRecord>[] = [
  {
    key: 'employee',
    label: 'Employee',
    render: (record) => getEmployeeDisplayName(record),
  },
  {
    key: 'payrollMonth',
    label: 'Month',
  },
  {
    key: 'grossSalary',
    label: 'Gross',
    render: (record) => formatCurrency(record.grossSalary),
  },
  {
    key: 'netSalary',
    label: 'Net',
    render: (record) => formatCurrency(record.netSalary),
  },
  {
    key: 'finalPayableSalary',
    label: 'Final Payable',
    render: (record) => formatCurrency(record.finalPayableSalary ?? record.payableSalary),
  },
  {
    key: 'status',
    label: 'Status',
    render: (record) => <Badge variant={getStatusBadgeVariant(record.status, record.isLocked)}>{record.status ?? 'Unknown'}</Badge>,
  },
]

type PendingAction = {
  id: string
  label: string
  action: 'process' | 'approve' | 'lock' | 'delete' | 'restore'
} | null

export const PayrollRunPage = () => {
  const role = useAuthStore((state) => state.user?.role)
  const canAccess = useAuthStore((state) => state.canAccess)
  const canRead = canAccess([PERMISSIONS.PAYROLL_READ])
  const canProcess = canAccess([PERMISSIONS.PAYROLL_PROCESS])
  const canApprove = canAccess([PERMISSIONS.PAYROLL_APPROVE])
  const canLock = canAccess([PERMISSIONS.PAYROLL_LOCK])
  const canUpdate = canAccess([PERMISSIONS.PAYROLL_UPDATE])
  const canExport = canAccess([PERMISSIONS.PAYROLL_REPORT_EXPORT])
  const [mode, setMode] = useState<PayrollListMode>('active')
  const [filters, setFilters] = useState<PayrollPeriodQuery>(() => currentPayrollMonth())
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [actionNote, setActionNote] = useState('')

  const lookups = usePayrollLookups({ enabled: canRead })
  const queryKey = queryKeys.payroll.list(mode, filters)

  const payrollQuery = useQuery({
    queryKey,
    queryFn: () => getPayrollRecords({ mode, params: filters }),
    enabled: canRead,
  })

  const invalidate = [queryKeys.payroll.list(mode, filters)]

  const generateMutation = useApiMutation({
    mutationFn: generatePayroll,
    invalidateQueries: invalidate,
    successMessage: 'Payroll generated successfully',
  })

  const actionMutation = useApiMutation({
    mutationFn: runPayrollAction,
    invalidateQueries: invalidate,
    successMessage: 'Payroll action completed successfully',
    onSuccess: () => {
      setPendingAction(null)
      setActionNote('')
    },
  })

  const deleteMutation = useApiMutation({
    mutationFn: deletePayrollRecord,
    invalidateQueries: invalidate,
    successMessage: 'Payroll record deleted successfully',
    onSuccess: () => setPendingAction(null),
  })

  const restoreMutation = useApiMutation({
    mutationFn: restorePayrollRecord,
    invalidateQueries: invalidate,
    successMessage: 'Payroll record restored successfully',
    onSuccess: () => setPendingAction(null),
  })

  const exportMutation = useApiMutation({
    mutationFn: (type: 'excel' | 'csv') => downloadMonthlyPayrollReport(filters, type),
    successMessage: 'Monthly payroll report download started',
  })

  const records = useMemo<PayrollRecord[]>(() => (payrollQuery.data ?? []) as PayrollRecord[], [payrollQuery.data])
  const stats = useMemo(() => {
    return records.reduce(
      (accumulator, record) => {
        accumulator.totalPayable += Number(record.finalPayableSalary ?? record.payableSalary ?? 0)
        if (['processed', 'approved', 'paid'].includes(String(record.status))) accumulator.processed += 1
        if (record.isLocked) accumulator.locked += 1
        return accumulator
      },
      { totalPayable: 0, processed: 0, locked: 0 } as { totalPayable: number; processed: number; locked: number },
    )
  }, [records])

  if (!canRead) {
    return <PermissionDeniedInline message={`Role ${role ?? 'guest'} cannot access payroll run.`} />
  }

  const submitPendingAction = () => {
    if (!pendingAction) return

    if (pendingAction.action === 'delete') {
      deleteMutation.mutate({ id: pendingAction.id, deleteReason: actionNote || 'Deleted from frontend Part-F10' })
      return
    }

    if (pendingAction.action === 'restore') {
      restoreMutation.mutate({ id: pendingAction.id, restoreReason: actionNote || 'Restored from frontend Part-F10' })
      return
    }

    actionMutation.mutate({ endpoint: payrollActionEndpoint(pendingAction.id, pendingAction.action), note: actionNote })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F10</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Payroll Run Foundation</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Generate, review, process, approve, lock, soft-delete, and export monthly payroll records from the backend payroll engine.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={mode === 'active' ? 'primary' : 'outline'} onClick={() => setMode('active')}>
            Active
          </Button>
          <Button variant={mode === 'deleted' ? 'primary' : 'outline'} onClick={() => setMode('deleted')}>
            Deleted
          </Button>
          <Button variant="outline" onClick={() => void payrollQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <PayrollPeriodToolbar
        filters={filters}
        onChange={setFilters}
        onRefresh={() => void payrollQuery.refetch()}
        companyOptions={lookups.companyOptions}
        majorDepartmentOptions={lookups.majorDepartmentOptions}
        departmentOptions={lookups.departmentOptions}
        branchOptions={lookups.branchOptions}
        employeeOptions={lookups.employeeOptions}
        statusOptions={statusOptions}
        isLoading={payrollQuery.isFetching || lookups.isLoading}
      />

      <PayrollStatCards
        totalRecords={records.length}
        totalAmount={stats.totalPayable}
        processedCount={stats.processed}
        lockedCount={stats.locked}
      />

      {mode === 'active' && canProcess && (
        <PayrollGeneratePanel
          title="Generate Monthly Payroll"
          description="Generates payroll records from active employees and active salary structures. Attendance deduction remains backend-controlled."
          filters={filters}
          onGenerate={generateMutation.mutate}
          isPending={generateMutation.isPending}
          error={generateMutation.error}
        />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Payroll Records</CardTitle>
            <CardDescription>Payroll records returned by backend `/payroll` route.</CardDescription>
          </div>
          {canExport && (
            <div className="flex gap-2">
              <Button variant="outline" disabled={exportMutation.isPending || !filters.month || !filters.year} onClick={() => exportMutation.mutate('excel')}>
                Export Excel
              </Button>
              <Button variant="outline" disabled={exportMutation.isPending || !filters.month || !filters.year} onClick={() => exportMutation.mutate('csv')}>
                Export CSV
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {lookups.isError && <ApiErrorState error={lookups.error} onRetry={lookups.refetch} />}
          {payrollQuery.isLoading ? (
            <LoadingState title="Loading payroll records" />
          ) : payrollQuery.isError ? (
            <ApiErrorState error={payrollQuery.error} onRetry={() => void payrollQuery.refetch()} />
          ) : (
            <SimpleDataTable
              records={records}
              columns={columns}
              getRowKey={getPayrollRecordId}
              emptyMessage="No payroll records found for selected filters."
              actions={(record) => {
                const id = getPayrollRecordId(record)
                return (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                    {mode === 'active' && canProcess && record.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={() => setPendingAction({ id, label: 'Process Payroll', action: 'process' })}>
                        <Play className="h-3.5 w-3.5" />
                        Process
                      </Button>
                    )}
                    {mode === 'active' && canApprove && record.status === 'processed' && (
                      <Button size="sm" variant="outline" onClick={() => setPendingAction({ id, label: 'Approve Payroll', action: 'approve' })}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                    )}
                    {mode === 'active' && canLock && record.status === 'approved' && !record.isLocked && (
                      <Button size="sm" variant="outline" onClick={() => setPendingAction({ id, label: 'Lock Payroll', action: 'lock' })}>
                        <LockKeyhole className="h-3.5 w-3.5" />
                        Lock
                      </Button>
                    )}
                    {mode === 'active' && canUpdate && !record.isLocked && (
                      <Button size="sm" variant="danger" onClick={() => setPendingAction({ id, label: 'Delete Payroll', action: 'delete' })}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    )}
                    {mode === 'deleted' && canUpdate && (
                      <Button size="sm" variant="outline" onClick={() => setPendingAction({ id, label: 'Restore Payroll', action: 'restore' })}>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </Button>
                    )}
                  </div>
                )
              }}
            />
          )}
        </CardContent>
      </Card>

      <PayrollDetailDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />

      {pendingAction && (
        <PayrollActionDialog
          title={pendingAction.label}
          description="Confirm the payroll action. A note is optional but recommended for audit clarity."
          note={actionNote}
          onNoteChange={setActionNote}
          onCancel={() => {
            setPendingAction(null)
            setActionNote('')
          }}
          onConfirm={submitPendingAction}
          confirmLabel={pendingAction.label}
          variant={pendingAction.action === 'delete' ? 'danger' : 'primary'}
          isPending={actionMutation.isPending || deleteMutation.isPending || restoreMutation.isPending}
        />
      )}
    </div>
  )
}
