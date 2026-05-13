import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryKey, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

import { normalizeApiError } from '@/lib/api/apiError'

type UseApiMutationOptions<TData, TVariables, TContext> = UseMutationOptions<
  TData,
  unknown,
  TVariables,
  TContext
> & {
  successMessage?: string
  errorMessage?: string
  invalidateQueries?: QueryKey[]
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

export const useApiMutation = <TData, TVariables = void, TContext = unknown>(
  options: UseApiMutationOptions<TData, TVariables, TContext>,
) => {
  const queryClient = useQueryClient()
  const {
    successMessage,
    errorMessage,
    invalidateQueries = [],
    showSuccessToast = Boolean(successMessage),
    showErrorToast = true,
    onSuccess,
    onError,
    ...mutationOptions
  } = options

  return useMutation<TData, unknown, TVariables, TContext>({
    ...mutationOptions,
    onSuccess: async (data, variables, context, mutationContext) => {
      await Promise.all(
        invalidateQueries.map((queryKey) =>
          queryClient.invalidateQueries({
            queryKey,
          }),
        ),
      )

      if (showSuccessToast && successMessage) {
        toast.success(successMessage)
      }

      await onSuccess?.(data, variables, context, mutationContext)
    },
    onError: (error, variables, context, mutationContext) => {
      if (showErrorToast) {
        const normalizedError = normalizeApiError(error)
        toast.error(errorMessage ?? normalizedError.message, {
          description: normalizedError.title,
        })
      }

      onError?.(error, variables, context, mutationContext)
    },
  })
}
