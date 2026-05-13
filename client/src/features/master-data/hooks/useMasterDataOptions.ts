import type { MasterDataFieldConfig, MasterDataOption } from '@/features/master-data/types/masterData.types'
import { useMasterDataLookups } from './useMasterDataLookups'

export const useMasterDataOptions = () => {
  const lookups = useMasterDataLookups()

  const getFieldOptions = (field: MasterDataFieldConfig): MasterDataOption[] => {
    if (field.options) {
      return field.options
    }

    if (field.optionSource === 'companies') {
      return lookups.companyOptions
    }

    if (field.optionSource === 'majorDepartments') {
      return lookups.majorDepartmentOptions
    }

    return []
  }

  return {
    ...lookups,
    getFieldOptions,
  }
}
