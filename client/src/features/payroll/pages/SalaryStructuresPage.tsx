import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Edit3, Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { SimpleDataTable, type SimpleDataTableColumn } from '@/components/data-table/SimpleDataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import {
  createSalaryStructure,
  deleteSalaryStructure,
  getSalaryStructures,
  restoreSalaryStructure,
  updateSalaryStructure,
} from '@/features/payroll/api/payroll.api'
import { SalaryStructureFormPanel } from '@/features/payroll/components/SalaryStructureFormPanel'
import { usePayrollLookups } from '@/features/payroll/hooks/usePayrollLookups'
import type { PayrollListMode, SalaryStructurePayload, SalaryStructureRecord } from '@/features/payroll/types/payroll.types'
import {
  formatCurrency,
  formatPayrollDate,
  getPayrollRecordId,
  getSalaryStructureEmployeeLabel,
} from '@/features/payroll/utils/payroll.utils'
import { useApiMutation } from '@/lib/query/useApiMutation'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

const columns: SimpleDataTableColumn<SalaryStructureRecord>[] = [
  {
    key: 'employee',
    label: 'Employee',
    render: (record) => getSalaryStructureEmployeeLabel(record.employee),
  },
  {
    key: 'basicSalary',
    label: 'Basic',
    render: (record) => formatCurrency(record.basicSalary),
  },
  {
    key: 'grossSalary',
    label: 'Gross',
    render: (record) => formatCurrency(record.grossSalary),
  },
  {
    key: 'totalDeduction',
    label: 'Deduction',
    render: (record) => formatCurrency(record.totalDeduction),
  },
  {
    key: 'netSalary',
    label: 'Net',
    render: (record) => formatCurrency(record.netSalary),
  },
  {
    key: 'effectiveFrom',
    label: 'Effective From',
    render: (record) => formatPayrollDate(record.effectiveFrom),
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (record) => <Badge variant={record.isActive === false ? 'muted' : 'success'}>{record.isActive === false ? 'Inactive' : 'Active'}</Badge>,
  },
]

export const SalaryStructuresPage = () => {
  const role = useAuthStore((state) => state.user?.role)
  const canAccess = useAuthStore((state) => state.canAccess)
  const canRead = canAccess([PERMISSIONS.SALARY_STRUCTURE_READ])
  const canManage = canAccess([PERMISSIONS.SALARY_STRUCTURE_MANAGE])
  const [mode, setMode] = useState<PayrollListMode>('active')
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [selectedRecord, setSelectedRecord] = useState<SalaryStructureRecord | null>(null)

  const lookups = usePayrollLookups({ enabled: canRead })

  const queryKey = queryKeys.payroll.salaryStructures(mode, { mode })
  const salaryStructuresQuery = useQuery({
    queryKey,
    queryFn: () => getSalaryStructures({ mode }),
    enabled: canRead,
  })

  const invalidate = [queryKeys.payroll.salaryStructures(mode, { mode })]

  const createMutation = useApiMutation({
    mutationFn: createSalaryStructure,
    invalidateQueries: invalidate,
    successMessage: 'Salary structure created successfully',
    onSuccess: () => setFormMode('closed'),
  })

  const updateMutation = useApiMutation({
    mutationFn: updateSalaryStructure,
    invalidateQueries: invalidate,
    successMessage: 'Salary structure updated successfully',
    onSuccess: () => setFormMode('closed'),
  })

  const deleteMutation = useApiMutation({
    mutationFn: deleteSalaryStructure,
    invalidateQueries: invalidate,
    successMessage: 'Salary structure deleted successfully',
  })

  const restoreMutation = useApiMutation({
    mutationFn: restoreSalaryStructure,
    invalidateQueries: invalidate,
    successMessage: 'Salary structure restored successfully',
  })

  const records = useMemo<SalaryStructureRecord[]>(() => (salaryStructuresQuery.data ?? []) as SalaryStructureRecord[], [salaryStructuresQuery.data])
  const totals = useMemo(() => {
    return records.reduce(
      (accumulator, record) => {
        accumulator.gross += Number(record.grossSalary || 0)
        accumulator.net += Number(record.netSalary || 0)
        return accumulator
      },
      { gross: 0, net: 0 } as { gross: number; net: number },
    )
  }, [records])

  if (!canRead) {
    return <PermissionDeniedInline message={`Role ${role ?? 'guest'} cannot access salary structures.`} />
  }

  const activeError = createMutation.error ?? updateMutation.error

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F10</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Salary Structure Foundation</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Maintain employee salary structures used by payroll, salary sheet, statement, and payment distribution modules.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={mode === 'active' ? 'primary' : 'outline'} onClick={() => setMode('active')}>
            Active
          </Button>
          <Button variant={mode === 'deleted' ? 'primary' : 'outline'} onClick={() => setMode('deleted')}>
            Deleted
          </Button>
          <Button variant="outline" onClick={() => void salaryStructuresQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {canManage && mode === 'active' && (
            <Button
              onClick={() => {
                setSelectedRecord(null)
                setFormMode('create')
              }}
            >
              <Plus className="h-4 w-4" />
              New Structure
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Records</p>
            <p className="mt-2 text-2xl font-semibold">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Gross Total</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totals.gross)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Net Total</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totals.net)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Structures</CardTitle>
          <CardDescription>Backend-connected list with create, edit, soft delete, and restore foundation.</CardDescription>
        </CardHeader>
        <CardContent>
          {lookups.isError && <ApiErrorState error={lookups.error} onRetry={lookups.refetch} />}
          {salaryStructuresQuery.isLoading ? (
            <LoadingState title="Loading salary structures" />
          ) : salaryStructuresQuery.isError ? (
            <ApiErrorState error={salaryStructuresQuery.error} onRetry={() => void salaryStructuresQuery.refetch()} />
          ) : (
            <SimpleDataTable
              records={records}
              columns={columns}
              getRowKey={getPayrollRecordId}
              emptyMessage="No salary structure records found."
              actions={(record) => {
                const id = getPayrollRecordId(record)
                return (
                  <div className="flex justify-end gap-2">
                    {canManage && mode === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRecord(record)
                            setFormMode('edit')
                          }}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (window.confirm('Delete this salary structure?')) {
                              deleteMutation.mutate({ id, deleteReason: 'Deleted from frontend Part-F10' })
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </>
                    )}
                    {canManage && mode === 'deleted' && (
                      <Button size="sm" variant="outline" onClick={() => restoreMutation.mutate({ id, restoreReason: 'Restored from frontend Part-F10' })}>
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

      {formMode !== 'closed' && (
        <SalaryStructureFormPanel
          mode={formMode}
          record={selectedRecord}
          employeeOptions={lookups.employeeOptions}
          error={activeError}
          isPending={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setFormMode('closed')
            setSelectedRecord(null)
            createMutation.reset()
            updateMutation.reset()
          }}
          onSubmit={(payload: SalaryStructurePayload) => {
            if (formMode === 'create') {
              createMutation.mutate(payload)
              return
            }

            if (selectedRecord) {
              updateMutation.mutate({ id: getPayrollRecordId(selectedRecord), payload })
            }
          }}
        />
      )}
    </div>
  )
}
