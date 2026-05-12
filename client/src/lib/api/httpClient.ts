import axios from 'axios'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { routePaths } from '@/config/routePaths'
import { useAuthStore } from '@/stores/auth.store'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { RefreshTokenResponseData } from '@/types/auth.types'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean
    _retry?: boolean
  }

  export interface InternalAxiosRequestConfig {
    skipAuthRefresh?: boolean
    _retry?: boolean
  }
}

const authPathPrefixes = ['/auth/login', '/auth/register', '/auth/refresh-token']

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const requestNewAccessToken = async () => {
  const response = await refreshClient.post<
    ApiSuccessResponse<RefreshTokenResponseData>
  >('/auth/refresh-token')

  return response.data.data.accessToken
}

const isAuthPath = (url?: string) => {
  if (!url) {
    return false
  }

  return authPathPrefixes.some((prefix) => url.includes(prefix))
}

const redirectToSessionExpired = () => {
  if (typeof window === 'undefined') {
    return
  }

  const currentPath = window.location.pathname

  if (
    currentPath !== routePaths.login &&
    currentPath !== routePaths.sessionExpired
  ) {
    window.location.assign(routePaths.sessionExpired)
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = useAuthStore.getState().accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined
    const status = error.response?.status

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      !isAuthPath(originalRequest.url)
    ) {
      originalRequest._retry = true

      try {
        const accessToken = await requestNewAccessToken()
        useAuthStore.getState().setAccessToken(accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return apiClient(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().clearAuth()
        redirectToSessionExpired()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
