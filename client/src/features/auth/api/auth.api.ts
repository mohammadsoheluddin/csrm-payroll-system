import { apiRoutes } from '@/config/apiRoutes'
import { apiClient, requestNewAccessToken } from '@/lib/api/httpClient'
import { unwrapApiData } from '@/lib/api/apiResponse'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AuthUser,
  LoginRequest,
  LoginResponseData,
} from '@/types/auth.types'

export const loginUser = async (payload: LoginRequest) => {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponseData>>(
    apiRoutes.auth.login,
    payload,
    {
      skipAuthRefresh: true,
    },
  )

  return unwrapApiData(response)
}

export const getMyProfile = async () => {
  const response = await apiClient.get<ApiSuccessResponse<AuthUser>>(apiRoutes.users.me)

  return unwrapApiData(response)
}

export const refreshAccessToken = requestNewAccessToken

export const logoutUser = async () => {
  await apiClient.post<ApiSuccessResponse<null>>(
    apiRoutes.auth.logout,
    undefined,
    {
      skipAuthRefresh: true,
    },
  )
}
