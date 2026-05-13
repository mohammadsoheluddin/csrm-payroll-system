import { QueryClient } from '@tanstack/react-query'
import type { QueryCacheNotifyEvent } from '@tanstack/react-query'
import { toast } from 'sonner'

import { normalizeApiError } from '@/lib/api/apiError'

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  const normalizedError = normalizeApiError(error)

  if (normalizedError.status && normalizedError.status >= 400 && normalizedError.status < 500) {
    return false
  }

  return failureCount < 1
}

const showQueryErrorToast = (event: QueryCacheNotifyEvent) => {
  if (event.type !== 'updated') {
    return
  }

  const query = event.query
  const error = query.state.error
  const shouldToast = query.meta?.showErrorToast !== false

  if (error && shouldToast) {
    const normalizedError = normalizeApiError(error)
    toast.error(normalizedError.message, {
      description: normalizedError.title,
    })
  }
}

export const createAppQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  queryClient.getQueryCache().subscribe(showQueryErrorToast)

  return queryClient
}
