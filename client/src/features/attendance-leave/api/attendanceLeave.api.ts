import { apiRoutes } from '@/config/apiRoutes'
import type {
  AttendanceLeaveListMode,
  AttendanceQueryParams,
  AttendanceRecord,
  LeaveApprovalPayload,
  LeaveBalanceResponse,
  LeaveQueryParams,
  LeaveRecord,
} from '@/features/attendance-leave/types/attendanceLeave.types'
import { normalizeListData } from '@/features/attendance-leave/utils/attendanceLeave.utils'
import { unwrapApiData } from '@/lib/api/apiResponse'
import { apiClient } from '@/lib/api/httpClient'
import type { ApiSuccessResponse } from '@/types/api.types'

const attendanceQueryKeys: Array<keyof AttendanceQueryParams> = [
  'employee',
  'status',
  'source',
  'attendanceDate',
  'fromDate',
  'toDate',
]

const leaveQueryKeys: Array<keyof LeaveQueryParams> = [
  'employee',
  'leaveType',
  'status',
  'fromDate',
  'toDate',
  'startDate',
  'endDate',
  'replacementForDate',
  'managementConcern',
]

const toRequestParams = <TParams extends Record<string, unknown>>(
  params: TParams | undefined,
  keys: Array<keyof TParams>,
) => {
  return keys.reduce<Record<string, string>>((accumulator, key) => {
    const value = params?.[key]

    if (value !== undefined && value !== null && value !== '') {
      accumulator[String(key)] = String(value)
    }

    return accumulator
  }, {})
}

const getAttendanceListPath = (mode: AttendanceLeaveListMode) => {
  return mode === 'deleted' ? apiRoutes.attendance.deleted : apiRoutes.attendance.root
}

const getLeaveListPath = (mode: AttendanceLeaveListMode) => {
  return mode === 'deleted' ? apiRoutes.leave.deleted : apiRoutes.leave.root
}

export const getAttendanceRecords = async ({
  mode,
  params,
}: {
  mode: AttendanceLeaveListMode
  params?: AttendanceQueryParams
}) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(getAttendanceListPath(mode), {
    params: toRequestParams(params, attendanceQueryKeys),
  })

  return normalizeListData<AttendanceRecord>(unwrapApiData(response))
}

export const createAttendanceRecord = async (payload: Record<string, unknown>) => {
  const response = await apiClient.post<ApiSuccessResponse<AttendanceRecord>>(
    apiRoutes.attendance.create,
    payload,
  )

  return unwrapApiData(response)
}

export const updateAttendanceRecord = async ({
  id,
  payload,
}: {
  id: string
  payload: Record<string, unknown>
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<AttendanceRecord>>(
    apiRoutes.attendance.detail(id),
    payload,
  )

  return unwrapApiData(response)
}

export const deleteAttendanceRecord = async ({ id, deleteReason }: { id: string; deleteReason?: string }) => {
  const response = await apiClient.delete<ApiSuccessResponse<AttendanceRecord>>(
    apiRoutes.attendance.detail(id),
    {
      data: deleteReason ? { deleteReason } : undefined,
    },
  )

  return unwrapApiData(response)
}

export const restoreAttendanceRecord = async ({ id, restoreReason }: { id: string; restoreReason?: string }) => {
  const response = await apiClient.patch<ApiSuccessResponse<AttendanceRecord>>(
    apiRoutes.attendance.restore(id),
    restoreReason ? { restoreReason } : {},
  )

  return unwrapApiData(response)
}

export const getLeaveRecords = async ({
  mode,
  params,
}: {
  mode: AttendanceLeaveListMode
  params?: LeaveQueryParams
}) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(getLeaveListPath(mode), {
    params: toRequestParams(params, leaveQueryKeys),
  })

  return normalizeListData<LeaveRecord>(unwrapApiData(response))
}

export const createLeaveRecord = async (payload: Record<string, unknown>) => {
  const response = await apiClient.post<ApiSuccessResponse<LeaveRecord>>(
    apiRoutes.leave.create,
    payload,
  )

  return unwrapApiData(response)
}

export const updateLeaveRecord = async ({
  id,
  payload,
}: {
  id: string
  payload: Record<string, unknown>
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<LeaveRecord>>(
    apiRoutes.leave.detail(id),
    payload,
  )

  return unwrapApiData(response)
}

export const approveLeaveRecord = async ({
  id,
  payload,
}: {
  id: string
  payload: LeaveApprovalPayload
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<LeaveRecord>>(
    apiRoutes.leave.approve(id),
    payload,
  )

  return unwrapApiData(response)
}

export const deleteLeaveRecord = async ({ id, deleteReason }: { id: string; deleteReason?: string }) => {
  const response = await apiClient.delete<ApiSuccessResponse<LeaveRecord>>(apiRoutes.leave.detail(id), {
    data: deleteReason ? { deleteReason } : undefined,
  })

  return unwrapApiData(response)
}

export const restoreLeaveRecord = async ({ id, restoreReason }: { id: string; restoreReason?: string }) => {
  const response = await apiClient.patch<ApiSuccessResponse<LeaveRecord>>(
    apiRoutes.leave.restore(id),
    restoreReason ? { restoreReason } : {},
  )

  return unwrapApiData(response)
}

export const getLeaveBalance = async ({ employeeId, year }: { employeeId: string; year: string | number }) => {
  const response = await apiClient.get<ApiSuccessResponse<LeaveBalanceResponse>>(
    apiRoutes.leave.balance(employeeId),
    {
      params: { year },
    },
  )

  return unwrapApiData(response)
}
