import { apiRoutes } from '@/config/apiRoutes'
import type {
  EmployeeDocumentDeletePayload,
  EmployeeDocumentListMode,
  EmployeeDocumentQueryParams,
  EmployeeDocumentRecord,
  EmployeeDocumentRejectPayload,
  EmployeeDocumentRestorePayload,
  EmployeeDocumentSummary,
  EmployeeDocumentUploadPayload,
  EmployeeDocumentVerifyPayload,
} from '@/features/employees/employee-documents/types/employeeDocument.types'
import { cleanEmployeeDocumentParams } from '@/features/employees/employee-documents/utils/employeeDocument.utils'
import { unwrapApiData } from '@/lib/api/apiResponse'
import { downloadApiFile } from '@/lib/api/fileDownload'
import { apiClient } from '@/lib/api/httpClient'
import type { ApiSuccessResponse } from '@/types/api.types'

const getEmployeeDocumentListEndpoint = (mode: EmployeeDocumentListMode) => {
  return mode === 'deleted' ? apiRoutes.employeeDocuments.deleted : apiRoutes.employeeDocuments.root
}

export const getEmployeeDocuments = async ({
  mode,
  params,
}: {
  mode: EmployeeDocumentListMode
  params?: Partial<EmployeeDocumentQueryParams>
}) => {
  const response = await apiClient.get<ApiSuccessResponse<EmployeeDocumentRecord[]>>(
    getEmployeeDocumentListEndpoint(mode),
    {
      params: cleanEmployeeDocumentParams(params ?? {}),
    },
  )

  return unwrapApiData(response)
}

export const getEmployeeDocumentsByEmployee = async (
  employeeId: string,
  params?: Partial<Pick<EmployeeDocumentQueryParams, 'category' | 'status'>>,
) => {
  const response = await apiClient.get<ApiSuccessResponse<EmployeeDocumentRecord[]>>(
    apiRoutes.employeeDocuments.byEmployee(employeeId),
    {
      params: cleanEmployeeDocumentParams(params ?? {}),
    },
  )

  return unwrapApiData(response)
}

export const getEmployeeDocumentSummary = async (employeeId: string) => {
  const response = await apiClient.get<ApiSuccessResponse<EmployeeDocumentSummary>>(
    apiRoutes.employeeDocuments.employeeSummary(employeeId),
  )

  return unwrapApiData(response)
}

export const uploadEmployeeDocumentFile = async ({ file, ...payload }: EmployeeDocumentUploadPayload) => {
  const response = await apiClient.post<ApiSuccessResponse<EmployeeDocumentRecord>>(
    apiRoutes.employeeDocuments.upload,
    file,
    {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'x-file-name': encodeURIComponent(file.name),
      },
      params: {
        ...payload,
        tags: payload.tags?.join(','),
      },
    },
  )

  return unwrapApiData(response)
}

export const verifyEmployeeDocument = async ({ id, verificationRemarks }: EmployeeDocumentVerifyPayload) => {
  const response = await apiClient.patch<ApiSuccessResponse<EmployeeDocumentRecord>>(
    apiRoutes.employeeDocuments.verify(id),
    { verificationRemarks },
  )

  return unwrapApiData(response)
}

export const rejectEmployeeDocument = async ({ id, rejectionReason }: EmployeeDocumentRejectPayload) => {
  const response = await apiClient.patch<ApiSuccessResponse<EmployeeDocumentRecord>>(
    apiRoutes.employeeDocuments.reject(id),
    { rejectionReason },
  )

  return unwrapApiData(response)
}

export const deleteEmployeeDocument = async ({ id, deleteReason }: EmployeeDocumentDeletePayload) => {
  const response = await apiClient.delete<ApiSuccessResponse<EmployeeDocumentRecord>>(
    apiRoutes.employeeDocuments.detail(id),
    {
      data: {
        deleteReason: deleteReason?.trim() || 'Deleted from employee document upload UI',
      },
    },
  )

  return unwrapApiData(response)
}

export const restoreEmployeeDocument = async ({ id, restoreReason }: EmployeeDocumentRestorePayload) => {
  const response = await apiClient.patch<ApiSuccessResponse<EmployeeDocumentRecord>>(
    apiRoutes.employeeDocuments.restore(id),
    {
      restoreReason: restoreReason?.trim() || 'Restored from employee document upload UI',
    },
  )

  return unwrapApiData(response)
}

export const downloadEmployeeDocumentFile = async (document: EmployeeDocumentRecord) => {
  const documentId = document._id ?? document.id

  if (!documentId) {
    throw new Error('Employee document id is missing')
  }

  return downloadApiFile({
    endpoint: apiRoutes.employeeDocuments.download(documentId),
    fileName: document.originalFileName || document.fileName || `employee-document-${documentId}`,
    mimeType: document.mimeType,
  })
}
