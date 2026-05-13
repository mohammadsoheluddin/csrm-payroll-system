import type { MasterDataFieldConfig, MasterDataOption, MasterDataRecord } from '@/features/master-data/types/masterData.types'
import { getRecordId, getReferenceId, getReferenceLabel } from '@/lib/format/record.utils'
import { useMasterDataLookups } from './useMasterDataLookups'

type OptionContext = Record<string, unknown>

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

const getContextReferenceId = (context: OptionContext, key: string) => {
  const value = context[key]

  if (typeof value === 'string') {
    return value
  }

  return getReferenceId(value)
}

const filterMajorDepartmentsByCompany = (records: MasterDataRecord[], context: OptionContext) => {
  const selectedCompanyId = getContextReferenceId(context, 'company')

  if (!selectedCompanyId) {
    return records
  }

  return records.filter((record) => getReferenceId(record.company) === selectedCompanyId)
}

export const useMasterDataOptions = () => {
  const lookups = useMasterDataLookups()

  const getFieldOptions = (field: MasterDataFieldConfig, context: OptionContext = {}): MasterDataOption[] => {
    if (field.options) {
      return field.options
    }

    if (field.optionSource === 'companies') {
      return lookups.companyOptions
    }

    if (field.optionSource === 'majorDepartments') {
      return toOptions(filterMajorDepartmentsByCompany(lookups.majorDepartments, context))
    }

    return []
  }

  return {
    ...lookups,
    getFieldOptions,
  }
}
