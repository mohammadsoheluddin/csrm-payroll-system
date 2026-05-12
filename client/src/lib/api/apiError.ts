import { isAxiosError } from 'axios'

import type { ApiErrorResponse, ApiErrorSource } from '@/types/api.types'

export type NormalizedApiError = {
  status?: number
  message: string
  errorSources: ApiErrorSource[]
}

const fallbackMessage = 'Something went wrong. Please try again.'

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return {
      status: error.response?.status,
      message:
        error.response?.data?.message ?? error.message ?? fallbackMessage,
      errorSources: error.response?.data?.errorSources ?? [],
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      errorSources: [],
    }
  }

  return {
    message: fallbackMessage,
    errorSources: [],
  }
}

export const getApiErrorMessage = (error: unknown) => normalizeApiError(error).message
