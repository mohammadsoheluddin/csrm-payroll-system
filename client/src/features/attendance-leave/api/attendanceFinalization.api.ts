import { apiRoutes } from '@/config/apiRoutes'
import type {
  AttendanceFinalizationActionScope,
  AttendanceFinalizationGeneratePayload,
  AttendanceFinalizationQueryParams,
  AttendanceFinalizationRecord,
  AttendanceFinalizationSummary,
} from '@/features/attendance-leave/types/attendanceLeave.types'
import { normalizeListData } from '@/features/attendance-leave/utils/attendanceLeave.utils'
import { unwrapApiData } from '@/lib/api/apiResponse'
import { apiClient } from '@/lib/api/httpClient'
import type { ApiSuccessResponse } from '@/types/api.types'

const cleanParams = <TParams extends Record<string, unknown>>(params: TParams) => {
  return Object.entries(params).reduce<Record<string, string>>((accumulator, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      accumulator[key] = String(value)
    }

    return accumulator
  }, {})
}

export const getAttendanceFinalizations = async (params: AttendanceFinalizationQueryParams) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(apiRoutes.attendanceFinalizations.root, {
    params: cleanParams(params),
  })

  return normalizeListData<AttendanceFinalizationRecord>(unwrapApiData(response))
}

export const getAttendanceFinalizationSummary = async (params: AttendanceFinalizationQueryParams) => {
  const response = await apiClient.get<ApiSuccessResponse<AttendanceFinalizationSummary>>(
    apiRoutes.attendanceFinalizations.summary,
    {
      params: cleanParams(params),
    },
  )

  return unwrapApiData(response)
}

export const generateAttendanceFinalization = async (payload: AttendanceFinalizationGeneratePayload) => {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>(
    apiRoutes.attendanceFinalizations.generate,
    payload,
  )

  return unwrapApiData(response)
}

export const runAttendanceFinalizationBulkAction = async ({
  action,
  payload,
}: {
  action: 'finalize' | 'approve' | 'lock' | 'unlock'
  payload: AttendanceFinalizationActionScope
}) => {
  const endpoint =
    action === 'finalize'
      ? apiRoutes.attendanceFinalizations.bulkFinalize
      : action === 'approve'
        ? apiRoutes.attendanceFinalizations.bulkApprove
        : action === 'lock'
          ? apiRoutes.attendanceFinalizations.bulkLock
          : apiRoutes.attendanceFinalizations.bulkUnlock

  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(endpoint, payload)
  return unwrapApiData(response)
}
