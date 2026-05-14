import { apiRoutes } from '@/config/apiRoutes'
import type { PayrollWorkflowModuleConfig } from '@/features/payroll/types/payroll.types'
import type {
  PayrollActionPayload,
  PayrollBulkActionPayload,
  PayrollGeneratePayload,
  PayrollListMode,
  PayrollPeriodQuery,
  PayrollRecord,
  PayrollWorkflowRecord,
  SalaryStructurePayload,
  SalaryStructureRecord,
} from '@/features/payroll/types/payroll.types'
import {
  cleanBulkActionPayload,
  cleanGeneratePayload,
  cleanPayrollQuery,
  cleanSalaryStructurePayload,
  normalizeListResponse,
} from '@/features/payroll/utils/payroll.utils'
import { unwrapApiData } from '@/lib/api/apiResponse'
import { downloadApiFile } from '@/lib/api/fileDownload'
import { apiClient } from '@/lib/api/httpClient'
import type { ApiSuccessResponse } from '@/types/api.types'

const getModePath = (rootPath: string, deletedPath: string, mode: PayrollListMode) => {
  return mode === 'deleted' ? deletedPath : rootPath
}

export const getSalaryStructures = async ({
  mode,
  params,
}: {
  mode: PayrollListMode
  params?: PayrollPeriodQuery
}) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(
    getModePath(apiRoutes.salaryStructures.root, apiRoutes.salaryStructures.deleted, mode),
    {
      params: cleanPayrollQuery(params),
    },
  )

  return normalizeListResponse<SalaryStructureRecord>(unwrapApiData(response))
}

export const createSalaryStructure = async (payload: SalaryStructurePayload) => {
  const response = await apiClient.post<ApiSuccessResponse<SalaryStructureRecord>>(
    apiRoutes.salaryStructures.create,
    cleanSalaryStructurePayload(payload),
  )

  return unwrapApiData(response)
}

export const updateSalaryStructure = async ({
  id,
  payload,
}: {
  id: string
  payload: SalaryStructurePayload
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<SalaryStructureRecord>>(
    apiRoutes.salaryStructures.detail(id),
    cleanSalaryStructurePayload(payload),
  )

  return unwrapApiData(response)
}

export const deleteSalaryStructure = async ({ id, deleteReason }: { id: string; deleteReason?: string }) => {
  const response = await apiClient.delete<ApiSuccessResponse<SalaryStructureRecord>>(
    apiRoutes.salaryStructures.detail(id),
    {
      data: deleteReason ? { deleteReason } : undefined,
    },
  )

  return unwrapApiData(response)
}

export const restoreSalaryStructure = async ({ id, restoreReason }: { id: string; restoreReason?: string }) => {
  const response = await apiClient.patch<ApiSuccessResponse<SalaryStructureRecord>>(
    apiRoutes.salaryStructures.restore(id),
    restoreReason ? { restoreReason } : {},
  )

  return unwrapApiData(response)
}

export const getPayrollRecords = async ({
  mode,
  params,
}: {
  mode: PayrollListMode
  params?: PayrollPeriodQuery
}) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(
    getModePath(apiRoutes.payroll.root, apiRoutes.payroll.deleted, mode),
    {
      params: cleanPayrollQuery(params),
    },
  )

  return normalizeListResponse<PayrollRecord>(unwrapApiData(response))
}

export const generatePayroll = async (payload: PayrollGeneratePayload) => {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>(
    apiRoutes.payroll.generate,
    cleanGeneratePayload(payload),
  )

  return unwrapApiData(response)
}

export const runPayrollAction = async ({
  endpoint,
  note,
}: {
  endpoint: string
  note?: string
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<PayrollRecord>>(endpoint, note ? { note } : {})
  return unwrapApiData(response)
}

export const deletePayrollRecord = async ({ id, deleteReason }: { id: string; deleteReason?: string }) => {
  const response = await apiClient.delete<ApiSuccessResponse<PayrollRecord>>(apiRoutes.payroll.detail(id), {
    data: deleteReason ? { deleteReason } : undefined,
  })

  return unwrapApiData(response)
}

export const restorePayrollRecord = async ({ id, restoreReason }: { id: string; restoreReason?: string }) => {
  const response = await apiClient.patch<ApiSuccessResponse<PayrollRecord>>(
    apiRoutes.payroll.restore(id),
    restoreReason ? { restoreReason } : {},
  )

  return unwrapApiData(response)
}

export const getWorkflowRecords = async ({
  module,
  mode,
  params,
}: {
  module: PayrollWorkflowModuleConfig
  mode: PayrollListMode
  params?: PayrollPeriodQuery
}) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(
    getModePath(module.api.root, module.api.deleted, mode),
    {
      params: cleanPayrollQuery(params),
    },
  )

  return normalizeListResponse<PayrollWorkflowRecord>(unwrapApiData(response))
}

export const getWorkflowSummary = async ({
  module,
  params,
}: {
  module: PayrollWorkflowModuleConfig
  params?: PayrollPeriodQuery
}) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(module.api.summary, {
    params: cleanPayrollQuery(params),
  })

  return unwrapApiData(response)
}

export const generateWorkflowRecords = async ({
  module,
  payload,
}: {
  module: PayrollWorkflowModuleConfig
  payload: PayrollGeneratePayload
}) => {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>(
    module.api.generate,
    cleanGeneratePayload(payload),
  )

  return unwrapApiData(response)
}

export const runWorkflowAction = async ({ endpoint, note }: { endpoint: string; note?: string }) => {
  const response = await apiClient.patch<ApiSuccessResponse<PayrollWorkflowRecord>>(endpoint, note ? { note } : {})
  return unwrapApiData(response)
}

export const runWorkflowBulkAction = async ({
  endpoint,
  payload,
}: {
  endpoint: string
  payload: PayrollBulkActionPayload
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<unknown>>(
    endpoint,
    cleanBulkActionPayload(payload),
  )

  return unwrapApiData(response)
}

export const deleteWorkflowRecord = async ({
  module,
  id,
  deleteReason,
}: {
  module: PayrollWorkflowModuleConfig
  id: string
  deleteReason?: string
}) => {
  const response = await apiClient.delete<ApiSuccessResponse<PayrollWorkflowRecord>>(module.api.detail(id), {
    data: deleteReason ? { deleteReason } : undefined,
  })

  return unwrapApiData(response)
}

export const restoreWorkflowRecord = async ({
  module,
  id,
  restoreReason,
}: {
  module: PayrollWorkflowModuleConfig
  id: string
  restoreReason?: string
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<PayrollWorkflowRecord>>(
    module.api.restore(id),
    restoreReason ? { restoreReason } : {},
  )

  return unwrapApiData(response)
}

export const downloadMonthlyPayrollReport = (params: PayrollPeriodQuery, type: 'excel' | 'csv') => {
  const endpoint =
    type === 'excel'
      ? apiRoutes.payrollReports.monthlyReportExportExcel
      : apiRoutes.payrollReports.monthlyReportExportCsv

  return downloadApiFile({
    endpoint,
    params: cleanPayrollQuery(params),
    fileName: `monthly-payroll-report-${params.year}-${params.month}.${type === 'excel' ? 'xlsx' : 'csv'}`,
  })
}

export const downloadWorkflowFile = ({
  module,
  params,
  type,
}: {
  module: PayrollWorkflowModuleConfig
  params: PayrollPeriodQuery
  type: 'excel' | 'csv' | 'pdf'
}) => {
  const endpoint =
    type === 'excel' ? module.api.exportExcel : type === 'csv' ? module.api.exportCsv : module.api.exportPdf

  if (!endpoint) {
    return Promise.reject(new Error('Export route is not available for this module.'))
  }

  return downloadApiFile({
    endpoint,
    params: cleanPayrollQuery(params),
    fileName: `${module.key}-${params.year}-${params.month}.${type === 'excel' ? 'xlsx' : type}`,
  })
}

export const payrollActionEndpoint = (id: string, action: 'process' | 'approve' | 'lock') => {
  if (action === 'process') {
    return apiRoutes.payroll.process(id)
  }

  if (action === 'approve') {
    return apiRoutes.payroll.approve(id)
  }

  return apiRoutes.payroll.lock(id)
}

export const workflowActionEndpoint = ({
  module,
  id,
  action,
}: {
  module: PayrollWorkflowModuleConfig
  id: string
  action: 'process' | 'approve' | 'lock' | 'unlock'
}) => {
  return module.api[action](id)
}

export type { PayrollActionPayload }
