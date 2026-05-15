import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  ArchiveRestore,
  Edit3,
  Eye,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
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
  changeEmployeeLifecycle,
  createEmployee,
  deleteEmployee,
  getEmployees,
  restoreEmployee,
  updateEmployee,
} from '@/features/employees/api/employee.api'
import { EmployeeDirectoryToolbar } from '@/features/employees/components/EmployeeDirectoryToolbar'
import { EmployeeFormPanel } from '@/features/employees/components/EmployeeFormPanel'
import { EmployeeLifecycleDialog } from '@/features/employees/components/EmployeeLifecycleDialog'
import { EmployeeProfileDrawer } from '@/features/employees/components/EmployeeProfileDrawer'
import { EmployeeStatCards } from '@/features/employees/components/EmployeeStatCards'
import { employeeFilterDefaults } from '@/features/employees/config/employee.constants'
import { useEmployeeLookups } from '@/features/employees/hooks/useEmployeeLookups'
import type {
  EmployeeFormMode,
  EmployeeListMode,
  EmployeeQueryParams,
  EmployeeRecord,
} from '@/features/employees/types/employee.types'
import {
  getEmployeeFullName,
  getEmployeeId,
  getEmployeeReferenceLabel,
} from '@/features/employees/utils/employee.utils'
import { normalizeApiError } from '@/lib/api/apiError'
import { toTitleCase } from '@/lib/format/record.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

const matchesSearch = (employee: EmployeeRecord, searchText: string) => {
  const normalizedSearch = searchText.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  const values = [
    employee.employeeId,
    employee.officeId,
    employee.cardNo,
    getEmployeeFullName(employee),
    employee.email,
    employee.phone,
    getEmployeeReferenceLabel(employee.company),
    getEmployeeReferenceLabel(employee.majorDepartment),
    getEmployeeReferenceLabel(employee.department),
    getEmployeeReferenceLabel(employee.designation),
    getEmployeeReferenceLabel(employee.branch),
  ]

  return values.some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch))
}

const toServerFieldErrors = (error: unknown) => {
  const normalized = normalizeApiError(error)

  const fieldErrors = normalized.errorSources.reduce<Record<string, string>>((accumulator, source) => {
    const normalizedPath = source.path.replace(/^body\./, '').replace(/^query\./, '')
    const fieldName = normalizedPath.split('.')[0]

    if (fieldName) {
      accumulator[fieldName] = source.message
    }

    return accumulator
  }, {})

  return {
    message: normalized.message,
    fieldErrors,
  }
}

export const EmployeeDirectoryPage = () => {
  const queryClient = useQueryClient()
  const canAccess = useAuthStore((state) => state.canAccess)
  const [mode, setMode] = useState<EmployeeListMode>('active')
  const [searchText, setSearchText] = useState('')
  const [filters, setFilters] = useState<EmployeeQueryParams>({ ...employeeFilterDefaults })
  const [formMode, setFormMode] = useState<EmployeeFormMode>('closed')
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null)
  const [profileEmployee, setProfileEmployee] = useState<EmployeeRecord | null>(null)
  const [lifecycleEmployee, setLifecycleEmployee] = useState<EmployeeRecord | null>(null)
  const [serverFormError, setServerFormError] = useState<string | null>(null)
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({})

  const lookups = useEmployeeLookups()
  const canManageEmployee = canAccess([PERMISSIONS.EMPLOYEE_MANAGE])
  const queryKey = queryKeys.employees.list(mode, filters)

  const employeesQuery = useQuery({
    queryKey,
    queryFn: () => getEmployees({ mode, params: filters }),
  })

  const employees = useMemo(() => {
    return (employeesQuery.data ?? []).filter((employee) => matchesSearch(employee, searchText))
  }, [employeesQuery.data, searchText])

  const selectedMajorDepartmentOptions = useMemo(() => {
    return lookups.getMajorDepartmentOptions(filters.company)
  }, [filters.company, lookups])

  const selectedDepartmentOptions = useMemo(() => {
    return lookups.getDepartmentOptions(filters.company, filters.majorDepartment)
  }, [filters.company, filters.majorDepartment, lookups])

  const selectedDesignationOptions = useMemo(() => {
    return lookups.getDesignationOptions(filters.company)
  }, [filters.company, lookups])

  const clearFormErrors = () => {
    setServerFormError(null)
    setServerFieldErrors({})
  }

  const invalidateEmployees = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.employees.root })
  }

  const closeForm = () => {
    setFormMode('closed')
    setSelectedEmployee(null)
    clearFormErrors()
  }

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: async () => {
      toast.success('Employee created successfully')
      closeForm()
      await invalidateEmployees()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      const formError = toServerFieldErrors(error)
      setServerFormError(formError.message)
      setServerFieldErrors(formError.fieldErrors)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: async (employee) => {
      toast.success('Employee updated successfully')
      setProfileEmployee(employee)
      closeForm()
      await invalidateEmployees()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      const formError = toServerFieldErrors(error)
      setServerFormError(formError.message)
      setServerFieldErrors(formError.fieldErrors)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: async () => {
      toast.success('Employee soft deleted successfully')
      setProfileEmployee(null)
      await invalidateEmployees()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: restoreEmployee,
    onSuccess: async () => {
      toast.success('Employee restored successfully')
      await invalidateEmployees()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const lifecycleMutation = useMutation({
    mutationFn: changeEmployeeLifecycle,
    onSuccess: async (employee) => {
      toast.success('Employee lifecycle updated successfully')
      setLifecycleEmployee(null)
      setProfileEmployee(employee)
      await invalidateEmployees()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const openCreateForm = () => {
    setSelectedEmployee(null)
    clearFormErrors()
    setFormMode('create')
  }

  const openEditForm = (employee: EmployeeRecord) => {
    setSelectedEmployee(employee)
    clearFormErrors()
    setFormMode('edit')
  }

  const submitForm = (payload: Record<string, unknown>) => {
    clearFormErrors()

    if (formMode === 'edit' && selectedEmployee) {
      updateMutation.mutate({ id: getEmployeeId(selectedEmployee), payload })
      return
    }

    createMutation.mutate(payload)
  }

  const switchMode = (nextMode: EmployeeListMode) => {
    setMode(nextMode)
    closeForm()
    setProfileEmployee(null)
    setLifecycleEmployee(null)
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  if (!canAccess([PERMISSIONS.EMPLOYEE_READ])) {
    return (
      <PermissionDeniedInline
        title="Employee permission required"
        message="Your current role does not have employee:read permission."
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
                <Badge variant="success">Part-F8 employee foundation</Badge>
                <Badge variant="muted">Employee Lifecycle</Badge>
                <Badge variant="default">API: /employees</Badge>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">Employee Directory</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
                Search, filter, create, update, soft-delete, restore, and review employee profile foundation data
                using the backend employee module. Full payroll/bank/attendance tabs will be connected in later parts.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={mode === 'active' ? 'primary' : 'outline'} onClick={() => switchMode('active')}>
                <Archive className="h-4 w-4" />
                Active
              </Button>
              <Button type="button" variant={mode === 'deleted' ? 'primary' : 'outline'} onClick={() => switchMode('deleted')}>
                <ArchiveRestore className="h-4 w-4" />
                Deleted
              </Button>
              <Button type="button" variant="outline" onClick={() => employeesQuery.refetch()}>
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
              {canManageEmployee && mode === 'active' && (
                <Button type="button" onClick={openCreateForm}>
                  <Plus className="h-4 w-4" />
                  New Employee
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <EmployeeStatCards employees={employees} />

      <EmployeeDirectoryToolbar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        filters={filters}
        onFiltersChange={setFilters}
        companyOptions={lookups.companyOptions}
        majorDepartmentOptions={selectedMajorDepartmentOptions}
        departmentOptions={selectedDepartmentOptions}
        designationOptions={selectedDesignationOptions}
        branchOptions={lookups.branchOptions}
      />

      <EmployeeFormPanel
        key={`${formMode}-${selectedEmployee ? getEmployeeId(selectedEmployee) : 'new'}`}
        mode={formMode}
        selectedEmployee={selectedEmployee}
        isSubmitting={isSubmitting}
        serverError={serverFormError}
        serverFieldErrors={serverFieldErrors}
        companyOptions={lookups.companyOptions}
        branchOptions={lookups.branchOptions}
        getMajorDepartmentOptions={lookups.getMajorDepartmentOptions}
        getDepartmentOptions={lookups.getDepartmentOptions}
        getDesignationOptions={lookups.getDesignationOptions}
        onClose={closeForm}
        onSubmit={submitForm}
      />

      {lookups.isLoading && <LoadingState title="Loading employee lookup data" message="Preparing companies, branches, departments, and designations." />}

      {employeesQuery.isError && <ApiErrorState error={employeesQuery.error} onRetry={() => employeesQuery.refetch()} />}

      {!employeesQuery.isError && (
        <SimpleDataTable<EmployeeRecord>
          records={employees}
          getRowKey={getEmployeeId}
          emptyMessage={mode === 'deleted' ? 'No deleted employees found.' : 'No employees found.'}
          actionsColumnClassName="min-w-[25rem] lg:min-w-[27rem]"
          columns={[
            {
              key: 'employeeId',
              label: 'Employee',
              render: (employee) => (
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{employee.employeeId}</p>
                  <p className="truncate text-xs text-muted-foreground">{getEmployeeFullName(employee)}</p>
                </div>
              ),
            },
            { key: 'officeId', label: 'Office ID' },
            { key: 'cardNo', label: 'Card No' },
            { key: 'company', label: 'Company', type: 'reference' },
            { key: 'department', label: 'Department', type: 'reference' },
            { key: 'designation', label: 'Designation', type: 'reference' },
            {
              key: 'employmentStatus',
              label: 'Lifecycle',
              render: (employee) => <Badge variant="default">{toTitleCase(employee.employmentStatus)}</Badge>,
            },
            { key: 'status', label: 'Status', type: 'status' },
            { key: 'payType', label: 'Pay', type: 'badge' },
          ]}
          actions={(employee) => (
            <div className="flex min-w-max flex-nowrap items-center justify-end gap-2">
              <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setProfileEmployee(employee)}>
                <Eye className="h-4 w-4" />
                View
              </Button>

              {canManageEmployee && mode === 'active' && (
                <>
                  <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => openEditForm(employee)}>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setLifecycleEmployee(employee)}>
                    <ShieldCheck className="h-4 w-4" />
                    Lifecycle
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      deleteMutation.mutate({
                        id: getEmployeeId(employee),
                        deleteReason: 'Deleted from employee directory frontend foundation screen',
                      })
                    }
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}

              {canManageEmployee && mode === 'deleted' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() =>
                    restoreMutation.mutate({
                      id: getEmployeeId(employee),
                      restoreReason: 'Restored from employee directory frontend foundation screen',
                    })
                  }
                  disabled={restoreMutation.isPending}
                >
                  <ArchiveRestore className="h-4 w-4" />
                  Restore
                </Button>
              )}
            </div>
          )}
        />
      )}

      <EmployeeProfileDrawer employee={profileEmployee} isOpen={Boolean(profileEmployee)} onClose={() => setProfileEmployee(null)} />

      <EmployeeLifecycleDialog
        key={lifecycleEmployee ? getEmployeeId(lifecycleEmployee) : 'closed'}
        employee={lifecycleEmployee}
        isOpen={Boolean(lifecycleEmployee)}
        isSubmitting={lifecycleMutation.isPending}
        onClose={() => setLifecycleEmployee(null)}
        onSubmit={(payload) => {
          if (lifecycleEmployee) {
            lifecycleMutation.mutate({ id: getEmployeeId(lifecycleEmployee), payload })
          }
        }}
      />

      <Card className="p-5">
        <div className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Part-F8 integration note</p>
            <p>
              This screen uses existing backend employee APIs. Employee ID remains immutable after creation, and lifecycle
              status changes use the dedicated <span className="font-semibold text-foreground">PATCH /employees/:id/lifecycle</span> endpoint.
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
