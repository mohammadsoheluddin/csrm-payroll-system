import { isAxiosError } from 'axios'
import type { FieldErrors, FieldValues, Path, UseFormSetError } from 'react-hook-form'

import type { ApiErrorResponse, ApiErrorSource } from '@/types/api.types'

export type NormalizedApiError = {
  status?: number
  code: ApiErrorCode
  title: string
  message: string
  errorSources: ApiErrorSource[]
  raw?: unknown
}

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

export type ErrorDisplayVariant = 'destructive' | 'warning' | 'info'

const fallbackMessage = 'Something went wrong. Please try again.'

const statusCodeToErrorCode = (status?: number): ApiErrorCode => {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 422:
      return 'VALIDATION_ERROR'
    case 500:
      return 'SERVER_ERROR'
    default:
      return status ? 'UNKNOWN_ERROR' : 'NETWORK_ERROR'
  }
}

const statusCodeToTitle = (status?: number) => {
  switch (status) {
    case 400:
      return 'Invalid request'
    case 401:
      return 'Session expired'
    case 403:
      return 'Forbidden access'
    case 404:
      return 'Resource not found'
    case 409:
      return 'Duplicate or conflicting data'
    case 422:
      return 'Validation failed'
    case 500:
      return 'Server error'
    default:
      return status ? 'Request failed' : 'Network error'
  }
}

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status
    const errorSources = error.response?.data?.errorSources ?? []
    const code = errorSources.length > 0 ? 'VALIDATION_ERROR' : statusCodeToErrorCode(status)

    return {
      status,
      code,
      title: statusCodeToTitle(status),
      message: error.response?.data?.message ?? error.message ?? fallbackMessage,
      errorSources,
      raw: error,
    }
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      title: 'Unexpected error',
      message: error.message,
      errorSources: [],
      raw: error,
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    title: 'Unexpected error',
    message: fallbackMessage,
    errorSources: [],
    raw: error,
  }
}

export const getApiErrorMessage = (error: unknown) => normalizeApiError(error).message

export const getErrorDisplayVariant = (error: NormalizedApiError): ErrorDisplayVariant => {
  if (error.status === 401 || error.status === 403 || error.status === 409) {
    return 'warning'
  }

  if (error.status === 400 || error.status === 422 || error.errorSources.length > 0) {
    return 'info'
  }

  return 'destructive'
}

const normalizeServerFieldPath = (path: string) => {
  return path.replace(/^body\./, '').replace(/^query\./, '').replace(/^params\./, '')
}

export const getFieldErrorMap = (error: unknown) => {
  const normalizedError = normalizeApiError(error)

  return normalizedError.errorSources.reduce<Record<string, string>>((acc, source) => {
    const normalizedPath = normalizeServerFieldPath(source.path)

    if (source.path) {
      acc[source.path] = source.message
    }

    if (normalizedPath) {
      acc[normalizedPath] = source.message
    }

    const topLevelField = normalizedPath.split('.')[0]

    if (topLevelField && !acc[topLevelField]) {
      acc[topLevelField] = source.message
    }

    return acc
  }, {})
}

export const applyApiFieldErrors = <TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
) => {
  const fieldErrors = getFieldErrorMap(error)

  Object.entries(fieldErrors).forEach(([path, message]) => {
    setError(path as Path<TFieldValues>, {
      type: 'server',
      message,
    })
  })
}

export const getFirstFormErrorMessage = <TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
) => {
  const firstError = Object.values(errors)[0]
  const message = firstError?.message

  return typeof message === 'string' ? message : undefined
}
