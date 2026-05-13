import { apiClient } from '@/lib/api/httpClient'
import { unwrapApiData } from '@/lib/api/apiResponse'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  MasterDataListMode,
  MasterDataMutationPayload,
  MasterDataQueryParams,
  MasterDataRecord,
} from '@/features/master-data/types/masterData.types'
import type { MasterDataModuleConfig } from '@/features/master-data/types/masterData.types'

const toRequestParams = (params?: MasterDataQueryParams) => {
  return Object.entries(params ?? {}).reduce<Record<string, string | boolean>>((accumulator, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      accumulator[key] = value as string | boolean
    }

    return accumulator
  }, {})
}

const toMutationPayload = (payload: MasterDataMutationPayload) => {
  return Object.entries(payload).reduce<Record<string, unknown>>((accumulator, [key, value]) => {
    if (value === '' || value === undefined || value === null) {
      return accumulator
    }

    accumulator[key] = value
    return accumulator
  }, {})
}

const getListPath = (module: MasterDataModuleConfig, mode: MasterDataListMode) => {
  if (mode === 'deleted' && module.supportsDeletedView) {
    return `${module.apiPath}/deleted`
  }

  return module.apiPath
}

export const getMasterDataRecords = async ({
  module,
  mode,
  params,
}: {
  module: MasterDataModuleConfig
  mode: MasterDataListMode
  params?: MasterDataQueryParams
}) => {
  const response = await apiClient.get<ApiSuccessResponse<MasterDataRecord[]>>(getListPath(module, mode), {
    params: toRequestParams(params),
  })

  return unwrapApiData(response)
}

export const createMasterDataRecord = async ({
  module,
  payload,
}: {
  module: MasterDataModuleConfig
  payload: MasterDataMutationPayload
}) => {
  const response = await apiClient.post<ApiSuccessResponse<MasterDataRecord>>(
    module.apiPath,
    toMutationPayload(payload),
  )

  return unwrapApiData(response)
}

export const updateMasterDataRecord = async ({
  module,
  id,
  payload,
}: {
  module: MasterDataModuleConfig
  id: string
  payload: MasterDataMutationPayload
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<MasterDataRecord>>(
    `${module.apiPath}/${id}`,
    toMutationPayload(payload),
  )

  return unwrapApiData(response)
}

export const deleteMasterDataRecord = async ({
  module,
  id,
  deleteReason,
}: {
  module: MasterDataModuleConfig
  id: string
  deleteReason?: string
}) => {
  const response = await apiClient.delete<ApiSuccessResponse<MasterDataRecord>>(`${module.apiPath}/${id}`, {
    data: deleteReason ? { deleteReason } : undefined,
  })

  return unwrapApiData(response)
}

export const restoreMasterDataRecord = async ({
  module,
  id,
  restoreReason,
}: {
  module: MasterDataModuleConfig
  id: string
  restoreReason?: string
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<MasterDataRecord>>(
    `${module.apiPath}/${id}/restore`,
    restoreReason ? { restoreReason } : undefined,
  )

  return unwrapApiData(response)
}
