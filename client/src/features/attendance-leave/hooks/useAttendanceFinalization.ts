import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  generateAttendanceFinalization,
  getAttendanceFinalizations,
  getAttendanceFinalizationSummary,
  runAttendanceFinalizationBulkAction,
} from '@/features/attendance-leave/api/attendanceFinalization.api'
import type {
  AttendanceFinalizationActionScope,
  AttendanceFinalizationGeneratePayload,
  AttendanceFinalizationQueryParams,
} from '@/features/attendance-leave/types/attendanceLeave.types'
import { normalizeApiError } from '@/lib/api/apiError'
import { queryKeys } from '@/lib/query/queryKeys'

export const useAttendanceFinalization = ({
  params,
  enabled,
}: {
  params: AttendanceFinalizationQueryParams
  enabled: boolean
}) => {
  const queryClient = useQueryClient()
  const canLoadSummary = Boolean(enabled && params.payrollMonth && params.company)

  const recordsQuery = useQuery({
    queryKey: queryKeys.attendanceFinalization.list(params),
    queryFn: () => getAttendanceFinalizations(params),
    enabled: canLoadSummary,
  })

  const summaryQuery = useQuery({
    queryKey: queryKeys.attendanceFinalization.summary(params),
    queryFn: () => getAttendanceFinalizationSummary(params),
    enabled: canLoadSummary,
  })

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.attendanceFinalization.root }),
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.root }),
    ])
  }

  const onError = (error: unknown) => {
    const normalized = normalizeApiError(error)
    toast.error(normalized.message, { description: normalized.title })
  }

  const generateMutation = useMutation({
    mutationFn: generateAttendanceFinalization,
    onSuccess: async () => {
      toast.success('Attendance finalization generated successfully')
      await invalidate()
    },
    onError,
  })

  const actionMutation = useMutation({
    mutationFn: runAttendanceFinalizationBulkAction,
    onSuccess: async (_, variables) => {
      toast.success(`Attendance finalization ${variables.action} completed successfully`)
      await invalidate()
    },
    onError,
  })

  const generate = (payload: AttendanceFinalizationGeneratePayload) => generateMutation.mutate(payload)
  const runAction = (action: 'finalize' | 'approve' | 'lock' | 'unlock', payload: AttendanceFinalizationActionScope) =>
    actionMutation.mutate({ action, payload })

  return {
    recordsQuery,
    summaryQuery,
    generate,
    runAction,
    isGenerating: generateMutation.isPending,
    isRunningAction: actionMutation.isPending,
  }
}
