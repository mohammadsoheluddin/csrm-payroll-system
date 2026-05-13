import { apiRoutes } from '@/config/apiRoutes'
import { unwrapApiData } from '@/lib/api/apiResponse'
import { apiClient } from '@/lib/api/httpClient'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  EmployeeLifecyclePayload,
  EmployeeListMode,
  EmployeeQueryParams,
  EmployeeRecord,
} from '@/features/employees/types/employee.types'

const toRequestParams = (params?: EmployeeQueryParams) => {
  return Object.entries(params ?? {}).reduce<Record<string, string>>((accumulator, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      accumulator[key] = String(value)
    }

    return accumulator
  }, {})
}

const getEmployeeListPath = (mode: EmployeeListMode) => {
  if (mode === 'deleted') {
    return apiRoutes.employees.deleted
  }

  return apiRoutes.employees.root
}

export const getEmployees = async ({
  mode,
  params,
}: {
  mode: EmployeeListMode
  params?: EmployeeQueryParams
}) => {
  const response = await apiClient.get<ApiSuccessResponse<EmployeeRecord[]>>(getEmployeeListPath(mode), {
    params: toRequestParams(params),
  })

  return unwrapApiData(response)
}

export const getEmployeeById = async (id: string) => {
  const response = await apiClient.get<ApiSuccessResponse<EmployeeRecord>>(apiRoutes.employees.detail(id))
  return unwrapApiData(response)
}

export const createEmployee = async (payload: Record<string, unknown>) => {
  const response = await apiClient.post<ApiSuccessResponse<EmployeeRecord>>(apiRoutes.employees.create, payload)
  return unwrapApiData(response)
}

export const updateEmployee = async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
  const response = await apiClient.patch<ApiSuccessResponse<EmployeeRecord>>(apiRoutes.employees.detail(id), payload)
  return unwrapApiData(response)
}

export const deleteEmployee = async ({ id, deleteReason }: { id: string; deleteReason?: string }) => {
  const response = await apiClient.delete<ApiSuccessResponse<EmployeeRecord>>(apiRoutes.employees.detail(id), {
    data: deleteReason ? { deleteReason } : undefined,
  })

  return unwrapApiData(response)
}

export const restoreEmployee = async ({ id, restoreReason }: { id: string; restoreReason?: string }) => {
  const response = await apiClient.patch<ApiSuccessResponse<EmployeeRecord>>(
    apiRoutes.employees.restore(id),
    restoreReason ? { restoreReason } : undefined,
  )

  return unwrapApiData(response)
}

export const changeEmployeeLifecycle = async ({
  id,
  payload,
}: {
  id: string
  payload: EmployeeLifecyclePayload
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<EmployeeRecord>>(
    apiRoutes.employees.lifecycle(id),
    payload,
  )

  return unwrapApiData(response)
}
