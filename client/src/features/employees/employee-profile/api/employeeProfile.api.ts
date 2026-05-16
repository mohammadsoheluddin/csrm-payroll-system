import { apiRoutes } from '@/config/apiRoutes'
import type {
  EmployeeProfileQueryParams,
  EmployeeProfileResponse,
  EmployeeProfileSummaryResponse,
} from '@/features/employees/employee-profile/types/employeeProfile.types'
import { unwrapApiData } from '@/lib/api/apiResponse'
import { apiClient } from '@/lib/api/httpClient'
import type { ApiSuccessResponse } from '@/types/api.types'

const cleanProfileParams = (params?: EmployeeProfileQueryParams) => {
  return Object.entries(params ?? {}).reduce<Record<string, string>>((accumulator, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      accumulator[key] = String(value)
    }

    return accumulator
  }, {})
}

export const getEmployeeProfile = async (employeeRef: string, params?: EmployeeProfileQueryParams) => {
  const response = await apiClient.get<ApiSuccessResponse<EmployeeProfileResponse>>(
    apiRoutes.employeeProfiles.detail(employeeRef),
    {
      params: cleanProfileParams(params),
    },
  )

  return unwrapApiData(response)
}

export const getEmployeeProfileSummary = async (employeeRef: string) => {
  const response = await apiClient.get<ApiSuccessResponse<EmployeeProfileSummaryResponse>>(
    apiRoutes.employeeProfiles.summary(employeeRef),
  )

  return unwrapApiData(response)
}
