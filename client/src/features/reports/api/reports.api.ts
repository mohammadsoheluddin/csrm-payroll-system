import { apiRoutes } from '@/config/apiRoutes'
import type { ReportExportType, ReportPeriodFilters } from '@/features/reports/types/report.types'
import { cleanReportParams, getReportFileName } from '@/features/reports/utils/report.utils'
import { unwrapApiData } from '@/lib/api/apiResponse'
import { downloadApiFile } from '@/lib/api/fileDownload'
import { apiClient } from '@/lib/api/httpClient'
import type { ApiSuccessResponse } from '@/types/api.types'

export const getReportCenterCatalog = async () => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(apiRoutes.reports.reportCenterCatalog)
  return unwrapApiData(response)
}

export const getReportCenterDashboard = async (filters: Partial<ReportPeriodFilters>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(apiRoutes.reports.reportCenterDashboard, {
    params: cleanReportParams(filters),
  })

  return unwrapApiData(response)
}

export const getReportCenterReadiness = async (filters: Partial<ReportPeriodFilters>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(apiRoutes.reports.reportCenterReadiness, {
    params: cleanReportParams(filters),
  })

  return unwrapApiData(response)
}

export const getMonthEndProcessControlStatus = async (filters: Partial<ReportPeriodFilters>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(apiRoutes.reports.monthEndProcessControlStatus, {
    params: cleanReportParams(filters),
  })

  return unwrapApiData(response)
}

export const getSalarySummaryPreview = async (filters: Partial<ReportPeriodFilters>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(apiRoutes.salarySummary.preview, {
    params: cleanReportParams(filters),
  })

  return unwrapApiData(response)
}

export const downloadSalarySummaryReport = async ({
  filters,
  type,
}: {
  filters: Partial<ReportPeriodFilters>
  type: ReportExportType
}) => {
  const endpoint =
    type === 'excel'
      ? apiRoutes.salarySummary.exportExcel
      : type === 'pdf'
        ? apiRoutes.salarySummary.exportPdf
        : apiRoutes.salarySummary.exportCsv

  return downloadApiFile({
    endpoint,
    params: cleanReportParams(filters),
    fileName: getReportFileName({ name: 'salary-summary', filters, type }),
  })
}

export const getSalaryBankSheetPreview = async (filters: Partial<ReportPeriodFilters>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(apiRoutes.reports.salaryBankSheetPreview, {
    params: cleanReportParams(filters),
  })

  return unwrapApiData(response)
}

export const getMonthlyPayrollReportPreview = async (filters: Partial<ReportPeriodFilters>) => {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(apiRoutes.reports.monthlyPayrollReport, {
    params: cleanReportParams(filters),
  })

  return unwrapApiData(response)
}

export const downloadMonthlyPayrollReportFile = async ({
  filters,
  type,
}: {
  filters: Partial<ReportPeriodFilters>
  type: Extract<ReportExportType, 'csv' | 'excel'>
}) => {
  const endpoint =
    type === 'excel'
      ? apiRoutes.payrollReports.monthlyReportExportExcel
      : apiRoutes.payrollReports.monthlyReportExportCsv

  return downloadApiFile({
    endpoint,
    params: cleanReportParams(filters),
    fileName: getReportFileName({ name: 'monthly-payroll-report', filters, type }),
  })
}
