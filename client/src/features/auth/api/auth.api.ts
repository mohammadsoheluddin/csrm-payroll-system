import { apiClient, requestNewAccessToken } from '@/lib/api/httpClient'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AuthUser,
  LoginRequest,
  LoginResponseData,
} from '@/types/auth.types'

export const loginUser = async (payload: LoginRequest) => {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponseData>>(
    '/auth/login',
    payload,
    {
      skipAuthRefresh: true,
    },
  )

  return response.data.data
}

export const getMyProfile = async () => {
  const response = await apiClient.get<ApiSuccessResponse<AuthUser>>('/users/me')

  return response.data.data
}

export const refreshAccessToken = requestNewAccessToken

export const logoutUser = async () => {
  await apiClient.post<ApiSuccessResponse<null>>(
    '/auth/logout',
    undefined,
    {
      skipAuthRefresh: true,
    },
  )
}
