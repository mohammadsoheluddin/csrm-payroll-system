import { useQuery } from '@tanstack/react-query'

import { getMasterDataRecords } from '@/features/master-data/api/masterData.api'
import { masterDataModuleConfigs } from '@/features/master-data/config/masterData.config'
import type { MasterDataOption, MasterDataRecord } from '@/features/master-data/types/masterData.types'
import { queryKeys } from '@/lib/query/queryKeys'
import { getRecordId, getReferenceLabel } from '@/lib/format/record.utils'

type LookupOptions = {
  enabled?: boolean
}

const toOptions = (records?: MasterDataRecord[]): MasterDataOption[] => {
  return (records ?? []).map((record) => {
    const id = getRecordId(record)
    const label = getReferenceLabel(record)
    const code = typeof record.code === 'string' ? record.code : undefined

    return {
      value: id,
      label: code ? `${label} (${code})` : label,
    }
  })
}

export const useMasterDataLookups = (options: LookupOptions = {}) => {
  const enabled = options.enabled ?? true

  const companiesQuery = useQuery({
    queryKey: queryKeys.masterData.companies({ lookup: true }),
    queryFn: () =>
      getMasterDataRecords({
        module: masterDataModuleConfigs.companies,
        mode: 'active',
        params: { status: 'active' },
      }),
    enabled,
  })

  const majorDepartmentsQuery = useQuery({
    queryKey: queryKeys.masterData.majorDepartments({ lookup: true }),
    queryFn: () =>
      getMasterDataRecords({
        module: masterDataModuleConfigs.majorDepartments,
        mode: 'active',
        params: { status: 'active' },
      }),
    enabled,
  })

  return {
    companies: companiesQuery.data ?? [],
    majorDepartments: majorDepartmentsQuery.data ?? [],
    companyOptions: toOptions(companiesQuery.data),
    majorDepartmentOptions: toOptions(majorDepartmentsQuery.data),
    isLoading: companiesQuery.isLoading || majorDepartmentsQuery.isLoading,
    isError: companiesQuery.isError || majorDepartmentsQuery.isError,
  }
}
