import { useQuery } from '@tanstack/react-query'

import { getMasterDataRecords } from '@/features/master-data/api/masterData.api'
import { masterDataModuleConfigs } from '@/features/master-data/config/masterData.config'
import type { MasterDataRecord } from '@/features/master-data/types/masterData.types'
import type { EmployeeSelectOption } from '@/features/employees/types/employee.types'
import { recordsToOptions, getEmployeeReferenceId } from '@/features/employees/utils/employee.utils'
import { queryKeys } from '@/lib/query/queryKeys'

const activeParams = { status: 'active' }

const filterByCompany = (records: MasterDataRecord[], companyId?: string) => {
  if (!companyId) {
    return records
  }

  return records.filter((record) => getEmployeeReferenceId(record.company) === companyId)
}

const filterDepartments = (records: MasterDataRecord[], companyId?: string, majorDepartmentId?: string) => {
  return records.filter((record) => {
    const matchesCompany = companyId ? getEmployeeReferenceId(record.company) === companyId : true
    const matchesMajorDepartment = majorDepartmentId
      ? getEmployeeReferenceId(record.majorDepartment) === majorDepartmentId
      : true

    return matchesCompany && matchesMajorDepartment
  })
}

export const useEmployeeLookups = (options: { enabled?: boolean } = {}) => {
  const enabled = options.enabled ?? true

  const companiesQuery = useQuery({
    queryKey: queryKeys.masterData.companies({ employeeLookup: true }),
    queryFn: () =>
      getMasterDataRecords({
        module: masterDataModuleConfigs.companies,
        mode: 'active',
        params: activeParams,
      }),
    enabled,
  })

  const branchesQuery = useQuery({
    queryKey: queryKeys.masterData.branches({ employeeLookup: true }),
    queryFn: () =>
      getMasterDataRecords({
        module: masterDataModuleConfigs.branches,
        mode: 'active',
        params: activeParams,
      }),
    enabled,
  })

  const majorDepartmentsQuery = useQuery({
    queryKey: queryKeys.masterData.majorDepartments({ employeeLookup: true }),
    queryFn: () =>
      getMasterDataRecords({
        module: masterDataModuleConfigs.majorDepartments,
        mode: 'active',
        params: activeParams,
      }),
    enabled,
  })

  const departmentsQuery = useQuery({
    queryKey: queryKeys.masterData.departments({ employeeLookup: true }),
    queryFn: () =>
      getMasterDataRecords({
        module: masterDataModuleConfigs.departments,
        mode: 'active',
        params: activeParams,
      }),
    enabled,
  })

  const designationsQuery = useQuery({
    queryKey: queryKeys.masterData.designations({ employeeLookup: true }),
    queryFn: () =>
      getMasterDataRecords({
        module: masterDataModuleConfigs.designations,
        mode: 'active',
        params: activeParams,
      }),
    enabled,
  })

  const companies = companiesQuery.data ?? []
  const branches = branchesQuery.data ?? []
  const majorDepartments = majorDepartmentsQuery.data ?? []
  const departments = departmentsQuery.data ?? []
  const designations = designationsQuery.data ?? []

  const getMajorDepartmentOptions = (companyId?: string): EmployeeSelectOption[] => {
    return recordsToOptions(filterByCompany(majorDepartments, companyId))
  }

  const getDepartmentOptions = (companyId?: string, majorDepartmentId?: string): EmployeeSelectOption[] => {
    return recordsToOptions(filterDepartments(departments, companyId, majorDepartmentId))
  }

  const getDesignationOptions = (companyId?: string): EmployeeSelectOption[] => {
    return recordsToOptions(filterByCompany(designations, companyId))
  }

  return {
    companies,
    branches,
    majorDepartments,
    departments,
    designations,
    companyOptions: recordsToOptions(companies),
    branchOptions: recordsToOptions(branches),
    majorDepartmentOptions: recordsToOptions(majorDepartments),
    departmentOptions: recordsToOptions(departments),
    designationOptions: recordsToOptions(designations),
    getMajorDepartmentOptions,
    getDepartmentOptions,
    getDesignationOptions,
    isLoading:
      companiesQuery.isLoading ||
      branchesQuery.isLoading ||
      majorDepartmentsQuery.isLoading ||
      departmentsQuery.isLoading ||
      designationsQuery.isLoading,
    isError:
      companiesQuery.isError ||
      branchesQuery.isError ||
      majorDepartmentsQuery.isError ||
      departmentsQuery.isError ||
      designationsQuery.isError,
  }
}
