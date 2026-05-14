import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Download, Eye, LockKeyhole, Play, RefreshCw, RotateCcw, Trash2, UnlockKeyhole } from 'lucide-react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { SimpleDataTable, type SimpleDataTableColumn } from '@/components/data-table/SimpleDataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  deleteWorkflowRecord,
  downloadWorkflowFile,
  generateWorkflowRecords,
  getWorkflowRecords,
  getWorkflowSummary,
  restoreWorkflowRecord,
  runWorkflowAction,
  runWorkflowBulkAction,
  workflowActionEndpoint,
} from '@/features/payroll/api/payroll.api'
import { PayrollActionDialog } from '@/features/payroll/components/PayrollActionDialog'
import { PayrollDetailDrawer } from '@/features/payroll/components/PayrollDetailDrawer'
import { PayrollGeneratePanel } from '@/features/payroll/components/PayrollGeneratePanel'
import { PayrollPeriodToolbar } from '@/features/payroll/components/PayrollPeriodToolbar'
import { PayrollStatCards } from '@/features/payroll/components/PayrollStatCards'
import { usePayrollLookups } from '@/features/payroll/hooks/usePayrollLookups'
import type {
  PayrollListMode,
  PayrollPeriodQuery,
  PayrollWorkflowModuleConfig,
  PayrollWorkflowRecord,
} from '@/features/payroll/types/payroll.types'
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

type PayrollWorkflowPageProps = {
  module: PayrollWorkflowModuleConfig
}

type PendingAction = {
  id?: string
  label: string
  action: 'process' | 'approve' | 'lock' | 'unlock' | 'delete' | 'restore' | 'bulk-process' | 'bulk-approve' | 'bulk-lock' | 'bulk-unlock'
} | null

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'processed', label: 'Processed' },
  { value: 'approved', label: 'Approved' },
  { value: 'locked', label: 'Locked' },
]

const paymentModeOptions = [
  { value: 'bank', label: 'Bank' },
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_banking', label: 'Mobile Banking' },
]

const buildColumns = (supportsPaymentMode?: boolean): SimpleDataTableColumn<PayrollWorkflowRecord>[] => {
  const columns: SimpleDataTableColumn<PayrollWorkflowRecord>[] = [
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
      key: 'payableSalary',
      label: 'Payable',
      render: (record) => formatCurrency(record.payableSalary),
    },
  ]

  if (supportsPaymentMode) {
    columns.push({
      key: 'paymentMode',
      label: 'Mode',
      render: (record) => <Badge variant="muted">{String(record.paymentMode ?? '—')}</Badge>,
    })
  }

  columns.push({
    key: 'status',
    label: 'Status',
    render: (record) => <Badge variant={getStatusBadgeVariant(record.status, record.isLocked)}>{record.status ?? 'Unknown'}</Badge>,
  })

  return columns
}

export const PayrollWorkflowPage = ({ module }: PayrollWorkflowPageProps) => {
  const role = useAuthStore((state) => state.user?.role)
  const canAccess = useAuthStore((state) => state.canAccess)
  const canRead = canAccess([module.permissions.read])
  const canProcess = canAccess([module.permissions.process])
  const canApprove = canAccess([module.permissions.approve])
  const canLock = canAccess([module.permissions.lock])
  const canUnlock = canAccess([module.permissions.unlock])
  const canExport = module.permissions.export ? canAccess([module.permissions.export]) : false
  const [mode, setMode] = useState<PayrollListMode>('active')
  const [filters, setFilters] = useState<PayrollPeriodQuery>(() => currentPayrollMonth())
  const [selectedRecord, setSelectedRecord] = useState<PayrollWorkflowRecord | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [actionNote, setActionNote] = useState('')
  const isPeriodReady = Boolean(filters.company && filters.month && filters.year)
  const isExportReady = module.supportsPaymentMode ? Boolean(isPeriodReady && filters.paymentMode) : isPeriodReady

  const lookups = usePayrollLookups({ enabled: canRead })

  const recordsQuery = useQuery({
    queryKey: queryKeys.payroll.workflow(module.key, mode, filters),
    queryFn: () => getWorkflowRecords({ module, mode, params: filters }),
    enabled: canRead,
  })

  const summaryQuery = useQuery({
    queryKey: queryKeys.payroll.workflowSummary(module.key, filters),
    queryFn: () => getWorkflowSummary({ module, params: filters }),
    enabled: canRead && isPeriodReady,
  })

  const invalidate = [queryKeys.payroll.workflow(module.key, mode, filters), queryKeys.payroll.workflowSummary(module.key, filters)]

  const generateMutation = useApiMutation({
    mutationFn: (payload: PayrollPeriodQuery) => generateWorkflowRecords({ module, payload }),
    invalidateQueries: invalidate,
    successMessage: `${module.shortTitle} generated successfully`,
  })

  const actionMutation = useApiMutation({
    mutationFn: runWorkflowAction,
    invalidateQueries: invalidate,
    successMessage: `${module.shortTitle} action completed successfully`,
    onSuccess: () => {
      setPendingAction(null)
      setActionNote('')
    },
  })

  const bulkActionMutation = useApiMutation({
    mutationFn: ({ endpoint, note }: { endpoint: string; note?: string }) =>
      runWorkflowBulkAction({ endpoint, payload: { ...filters, note, strict: true } }),
    invalidateQueries: invalidate,
    successMessage: `${module.shortTitle} bulk action completed successfully`,
    onSuccess: () => {
      setPendingAction(null)
      setActionNote('')
    },
  })

  const deleteMutation = useApiMutation({
    mutationFn: deleteWorkflowRecord,
    invalidateQueries: invalidate,
    successMessage: `${module.shortTitle} record deleted successfully`,
    onSuccess: () => setPendingAction(null),
  })

  const restoreMutation = useApiMutation({
    mutationFn: restoreWorkflowRecord,
    invalidateQueries: invalidate,
    successMessage: `${module.shortTitle} record restored successfully`,
    onSuccess: () => setPendingAction(null),
  })

  const exportMutation = useApiMutation({
    mutationFn: (type: 'excel' | 'csv' | 'pdf') => downloadWorkflowFile({ module, params: filters, type }),
    successMessage: `${module.shortTitle} download started`,
  })

  const records = useMemo<PayrollWorkflowRecord[]>(() => (recordsQuery.data ?? []) as PayrollWorkflowRecord[], [recordsQuery.data])
  const stats = useMemo(() => {
    return records.reduce(
      (accumulator, record) => {
        accumulator.total += Number(record.payableSalary || 0)
        if (['processed', 'approved', 'locked'].includes(String(record.status))) accumulator.processed += 1
        if (record.isLocked || record.status === 'locked') accumulator.locked += 1
        return accumulator
      },
      { total: 0, processed: 0, locked: 0 } as { total: number; processed: number; locked: number },
    )
  }, [records])

  const columns = useMemo(() => buildColumns(module.supportsPaymentMode), [module.supportsPaymentMode])

  if (!canRead) {
    return <PermissionDeniedInline message={`Role ${role ?? 'guest'} cannot access this payroll workflow.`} />
  }

  const submitPendingAction = () => {
    if (!pendingAction) return

    if (pendingAction.action === 'delete' && pendingAction.id) {
      deleteMutation.mutate({ module, id: pendingAction.id, deleteReason: actionNote || 'Deleted from frontend Part-F10' })
      return
    }

    if (pendingAction.action === 'restore' && pendingAction.id) {
      restoreMutation.mutate({ module, id: pendingAction.id, restoreReason: actionNote || 'Restored from frontend Part-F10' })
      return
    }

    if (pendingAction.action === 'bulk-process') {
      bulkActionMutation.mutate({ endpoint: module.api.bulkProcess, note: actionNote })
      return
    }

    if (pendingAction.action === 'bulk-approve') {
      bulkActionMutation.mutate({ endpoint: module.api.bulkApprove, note: actionNote })
      return
    }

    if (pendingAction.action === 'bulk-lock') {
      bulkActionMutation.mutate({ endpoint: module.api.bulkLock, note: actionNote })
      return
    }

    if (pendingAction.action === 'bulk-unlock') {
      bulkActionMutation.mutate({ endpoint: module.api.bulkUnlock, note: actionNote })
      return
    }

    if (
      pendingAction.id &&
      ['process', 'approve', 'lock', 'unlock'].includes(pendingAction.action)
    ) {
      actionMutation.mutate({
        endpoint: workflowActionEndpoint({
          module,
          id: pendingAction.id,
          action: pendingAction.action as 'process' | 'approve' | 'lock' | 'unlock',
        }),
        note: actionNote,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F10</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{module.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{module.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={mode === 'active' ? 'primary' : 'outline'} onClick={() => setMode('active')}>
            Active
          </Button>
          <Button variant={mode === 'deleted' ? 'primary' : 'outline'} onClick={() => setMode('deleted')}>
            Deleted
          </Button>
          <Button variant="outline" onClick={() => void recordsQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <PayrollPeriodToolbar
        filters={filters}
        onChange={setFilters}
        onRefresh={() => {
          void recordsQuery.refetch()
          void summaryQuery.refetch()
        }}
        companyOptions={lookups.companyOptions}
        majorDepartmentOptions={lookups.getMajorDepartmentOptions(filters.company)}
        departmentOptions={lookups.getDepartmentOptions(filters.company, filters.majorDepartment)}
        branchOptions={lookups.branchOptions}
        employeeOptions={lookups.getEmployeeOptions({
          company: filters.company,
          majorDepartment: filters.majorDepartment,
          department: filters.department,
          branch: filters.branch,
        })}
        statusOptions={statusOptions}
        paymentModeOptions={paymentModeOptions}
        showPaymentMode={module.supportsPaymentMode}
        isLoading={recordsQuery.isFetching || lookups.isLoading}
      />

      <PayrollStatCards totalRecords={records.length} totalAmount={stats.total} processedCount={stats.processed} lockedCount={stats.locked} />

      {summaryQuery.data ? (
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm font-semibold text-foreground">Operational summary loaded</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Backend summary endpoint responded for selected period. Details will be expanded in the integration fix pass.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {mode === 'active' && canProcess && (
        <PayrollGeneratePanel
          title={`Generate ${module.shortTitle}`}
          description={`Generate backend ${module.shortTitle.toLowerCase()} records for the selected month/year/company.`}
          filters={filters}
          onGenerate={generateMutation.mutate}
          isPending={generateMutation.isPending}
          error={generateMutation.error}
          supportsCashFallback={module.supportsPaymentMode}
        />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <CardTitle>{module.title} Records</CardTitle>
            <CardDescription>Backend-connected records with lifecycle action foundation.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {mode === 'active' && canProcess && (
              <Button variant="outline" disabled={!isPeriodReady} onClick={() => setPendingAction({ label: `Bulk Process ${module.shortTitle}`, action: 'bulk-process' })}>
                Bulk Process
              </Button>
            )}
            {mode === 'active' && canApprove && (
              <Button variant="outline" disabled={!isPeriodReady} onClick={() => setPendingAction({ label: `Bulk Approve ${module.shortTitle}`, action: 'bulk-approve' })}>
                Bulk Approve
              </Button>
            )}
            {mode === 'active' && canLock && (
              <Button variant="outline" disabled={!isPeriodReady} onClick={() => setPendingAction({ label: `Bulk Lock ${module.shortTitle}`, action: 'bulk-lock' })}>
                Bulk Lock
              </Button>
            )}
            {mode === 'active' && canUnlock && (
              <Button variant="outline" disabled={!isPeriodReady} onClick={() => setPendingAction({ label: `Bulk Unlock ${module.shortTitle}`, action: 'bulk-unlock' })}>
                Bulk Unlock
              </Button>
            )}
            {canExport && module.supportsExport && (
              <>
                <Button variant="outline" onClick={() => exportMutation.mutate('excel')} disabled={exportMutation.isPending || !isExportReady}>
                  <Download className="h-4 w-4" />
                  Excel
                </Button>
                <Button variant="outline" onClick={() => exportMutation.mutate('pdf')} disabled={exportMutation.isPending || !isExportReady}>
                  PDF
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {lookups.isError && <ApiErrorState error={lookups.error} onRetry={lookups.refetch} />}
          {recordsQuery.isLoading ? (
            <LoadingState title={`Loading ${module.shortTitle.toLowerCase()} records`} />
          ) : recordsQuery.isError ? (
            <ApiErrorState error={recordsQuery.error} onRetry={() => void recordsQuery.refetch()} />
          ) : (
            <SimpleDataTable
              records={records}
              columns={columns}
              getRowKey={getPayrollRecordId}
              emptyMessage={`No ${module.shortTitle.toLowerCase()} records found for selected filters.`}
              actions={(record) => {
                const id = getPayrollRecordId(record)
                return (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                    {mode === 'active' && canProcess && record.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={() => setPendingAction({ id, label: 'Process Record', action: 'process' })}>
                        <Play className="h-3.5 w-3.5" />
                        Process
                      </Button>
                    )}
                    {mode === 'active' && canApprove && record.status === 'processed' && (
                      <Button size="sm" variant="outline" onClick={() => setPendingAction({ id, label: 'Approve Record', action: 'approve' })}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                    )}
                    {mode === 'active' && canLock && record.status === 'approved' && !record.isLocked && (
                      <Button size="sm" variant="outline" onClick={() => setPendingAction({ id, label: 'Lock Record', action: 'lock' })}>
                        <LockKeyhole className="h-3.5 w-3.5" />
                        Lock
                      </Button>
                    )}
                    {mode === 'active' && canUnlock && record.isLocked && (
                      <Button size="sm" variant="outline" onClick={() => setPendingAction({ id, label: 'Unlock Record', action: 'unlock' })}>
                        <UnlockKeyhole className="h-3.5 w-3.5" />
                        Unlock
                      </Button>
                    )}
                    {mode === 'active' && canProcess && !record.isLocked && (
                      <Button size="sm" variant="danger" onClick={() => setPendingAction({ id, label: 'Delete Record', action: 'delete' })}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    )}
                    {mode === 'deleted' && canProcess && (
                      <Button size="sm" variant="outline" onClick={() => setPendingAction({ id, label: 'Restore Record', action: 'restore' })}>
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

      <PayrollDetailDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} title={`${module.shortTitle} Detail`} />

      {pendingAction && (
        <PayrollActionDialog
          title={pendingAction.label}
          description="Confirm this payroll workflow action. Month, year, and company filters are required for bulk actions."
          note={actionNote}
          onNoteChange={setActionNote}
          onCancel={() => {
            setPendingAction(null)
            setActionNote('')
          }}
          onConfirm={submitPendingAction}
          confirmLabel={pendingAction.label}
          variant={pendingAction.action === 'delete' ? 'danger' : 'primary'}
          isPending={actionMutation.isPending || bulkActionMutation.isPending || deleteMutation.isPending || restoreMutation.isPending}
        />
      )}
    </div>
  )
}
