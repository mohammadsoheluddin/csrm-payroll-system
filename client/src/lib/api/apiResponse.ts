import type { AxiosResponse } from 'axios'

import type { ApiMeta, ApiSuccessResponse } from '@/types/api.types'

export type PaginatedResult<TData> = {
  data: TData
  meta?: ApiMeta
}

export const unwrapApiData = <TData>(response: AxiosResponse<ApiSuccessResponse<TData>>) => {
  return response.data.data
}

export const unwrapApiResult = <TData>(
  response: AxiosResponse<ApiSuccessResponse<TData>>,
): PaginatedResult<TData> => {
  return {
    data: response.data.data,
    meta: response.data.meta,
  }
}

export const isApiSuccessResponse = <TData>(value: unknown): value is ApiSuccessResponse<TData> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as ApiSuccessResponse<TData>).success === true &&
    'data' in value
  )
}
