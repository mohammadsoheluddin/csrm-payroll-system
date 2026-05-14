import { useQuery } from '@tanstack/react-query'

import { getEmployees } from '@/features/employees/api/employee.api'
import { useEmployeeLookups } from '@/features/employees/hooks/useEmployeeLookups'
import type { EmployeeRecord } from '@/features/employees/types/employee.types'
import type { PayrollLookupOption } from '@/features/payroll/types/payroll.types'
import { getReferenceId } from '@/features/payroll/utils/payroll.utils'
import { queryKeys } from '@/lib/query/queryKeys'

type EmployeeLookupsWithRetry = ReturnType<typeof useEmployeeLookups> & {
  error?: unknown
  refetch?: () => void
}

const employeeToOption = (employee: EmployeeRecord): PayrollLookupOption => {
  const id = getReferenceId(employee)
  const name = [employee.name?.firstName, employee.name?.middleName, employee.name?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  const code = employee.employeeId || employee.officeId || employee.cardNo

  return {
    value: id,
    label: code ? `${name || code} (${code})` : name || id,
  }
}

export const usePayrollLookups = (options: { enabled?: boolean } = {}) => {
  const enabled = options.enabled ?? true
  const lookups = useEmployeeLookups({ enabled }) as EmployeeLookupsWithRetry

  const employeesQuery = useQuery({
    queryKey: queryKeys.employees.list('active', { payrollLookup: true }),
    queryFn: () => getEmployees({ mode: 'active', params: { status: 'active' } }),
    enabled,
  })

  const refetch = () => {
    lookups.refetch?.()
    void employeesQuery.refetch()
  }

  return {
    ...lookups,
    employees: employeesQuery.data ?? [],
    employeeOptions: (employeesQuery.data ?? []).map(employeeToOption),
    isLoading: lookups.isLoading || employeesQuery.isLoading,
    isError: lookups.isError || employeesQuery.isError,
    error: lookups.error ?? employeesQuery.error ?? null,
    refetch,
  }
}
