import { apiRoutes } from '@/config/apiRoutes'
import type {
  LegacySalaryBatch,
  LegacySalaryExportType,
  LegacySalaryFilters,
  LegacySalaryImportPayload,
  LegacySalaryParsedResult,
  LegacySalaryParseExcelPayload,
  LegacySalaryPreviewResult,
  LegacySalaryRecord,
  LegacySalarySummaryResult,
} from '@/features/legacy-salary-import/types/legacySalaryImport.types'
import { cleanLegacySalaryParams } from '@/features/legacy-salary-import/utils/legacySalaryImport.utils'
import { unwrapApiData, unwrapApiResult } from '@/lib/api/apiResponse'
import { downloadApiFile } from '@/lib/api/fileDownload'
import { apiClient } from '@/lib/api/httpClient'
import type { ApiSuccessResponse } from '@/types/api.types'

export const parseLegacySalaryExcel = async (payload: LegacySalaryParseExcelPayload) => {
  const response = await apiClient.post<ApiSuccessResponse<LegacySalaryParsedResult>>(
    apiRoutes.legacySalaryImports.parseExcel,
    payload,
  )

  return unwrapApiData(response)
}

export const previewLegacySalaryImport = async (payload: LegacySalaryImportPayload) => {
  const response = await apiClient.post<ApiSuccessResponse<LegacySalaryPreviewResult>>(
    apiRoutes.legacySalaryImports.preview,
    payload,
  )

  return unwrapApiData(response)
}

export const commitLegacySalaryImport = async (payload: LegacySalaryImportPayload) => {
  const response = await apiClient.post<ApiSuccessResponse<LegacySalaryBatch>>(
    apiRoutes.legacySalaryImports.commit,
    payload,
  )

  return unwrapApiData(response)
}

export const getLegacySalaryImportBatches = async (
  mode: 'active' | 'deleted',
  filters: Partial<LegacySalaryFilters>,
) => {
  const endpoint = mode === 'deleted' ? apiRoutes.legacySalaryImports.deleted : apiRoutes.legacySalaryImports.root
  const response = await apiClient.get<ApiSuccessResponse<LegacySalaryBatch[]>>(endpoint, {
    params: cleanLegacySalaryParams(filters),
  })

  return unwrapApiResult(response)
}

export const getLegacySalaryImportBatch = async (id: string) => {
  const response = await apiClient.get<ApiSuccessResponse<LegacySalaryBatch>>(
    apiRoutes.legacySalaryImports.detail(id),
  )

  return unwrapApiData(response)
}

export const deleteLegacySalaryImportBatch = async ({ id, reason }: { id: string; reason?: string }) => {
  const response = await apiClient.delete<ApiSuccessResponse<LegacySalaryBatch>>(
    apiRoutes.legacySalaryImports.detail(id),
    {
      data: {
        reason: reason?.trim() || 'Deleted from legacy salary import UI',
      },
    },
  )

  return unwrapApiData(response)
}

export const restoreLegacySalaryImportBatch = async ({ id, reason }: { id: string; reason?: string }) => {
  const response = await apiClient.patch<ApiSuccessResponse<LegacySalaryBatch>>(
    apiRoutes.legacySalaryImports.restore(id),
    {
      reason: reason?.trim() || 'Restored from legacy salary import UI',
    },
  )

  return unwrapApiData(response)
}

export const getLegacySalaryRecords = async (filters: Partial<LegacySalaryFilters>) => {
  const response = await apiClient.get<ApiSuccessResponse<LegacySalaryRecord[]>>(
    apiRoutes.legacySalaryImports.records,
    {
      params: cleanLegacySalaryParams(filters),
    },
  )

  return unwrapApiResult(response)
}

export const getLegacySalarySummary = async (filters: Partial<LegacySalaryFilters>) => {
  const response = await apiClient.get<ApiSuccessResponse<LegacySalarySummaryResult>>(
    apiRoutes.legacySalaryImports.summary,
    {
      params: cleanLegacySalaryParams(filters),
    },
  )

  return unwrapApiData(response)
}

export const downloadLegacySalaryTemplate = async (type: LegacySalaryExportType) => {
  const endpoint = type === 'excel' ? apiRoutes.legacySalaryImports.templateExcel : apiRoutes.legacySalaryImports.templateCsv
  const extension = type === 'excel' ? 'xlsx' : 'csv'

  return downloadApiFile({
    endpoint,
    fileName: `legacy-salary-import-template.${extension}`,
  })
}

export const downloadLegacySalaryRecords = async ({
  filters,
  type,
}: {
  filters: Partial<LegacySalaryFilters>
  type: LegacySalaryExportType
}) => {
  const endpoint = type === 'excel' ? apiRoutes.legacySalaryImports.exportExcel : apiRoutes.legacySalaryImports.exportCsv
  const extension = type === 'excel' ? 'xlsx' : 'csv'

  return downloadApiFile({
    endpoint,
    params: cleanLegacySalaryParams(filters),
    fileName: `legacy-salary-records-${filters.payrollMonth ?? 'all'}.${extension}`,
  })
}
