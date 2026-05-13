import type { AxiosResponse } from 'axios'

import { apiClient } from '@/lib/api/httpClient'

export type DownloadFileOptions = {
  endpoint: string
  params?: Record<string, string | number | boolean | null | undefined>
  fileName: string
  mimeType?: string
}

const getSafeFileName = (fileName: string) => fileName.trim().replace(/[\\/:*?"<>|]/g, '-')

const getFileNameFromDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) {
    return undefined
  }

  const utf8FileNameMatch = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)
  if (utf8FileNameMatch?.[1]) {
    return decodeURIComponent(utf8FileNameMatch[1])
  }

  const fileNameMatch = /filename="?([^";]+)"?/i.exec(contentDisposition)
  return fileNameMatch?.[1]
}

const triggerBrowserDownload = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = getSafeFileName(fileName)
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}

export const downloadFileFromResponse = (response: AxiosResponse<Blob>, fallbackFileName: string) => {
  const responseFileName = getFileNameFromDisposition(response.headers['content-disposition'])
  triggerBrowserDownload(response.data, responseFileName ?? fallbackFileName)
}

export const downloadApiFile = async ({ endpoint, params, fileName, mimeType }: DownloadFileOptions) => {
  const response = await apiClient.get<Blob>(endpoint, {
    params,
    responseType: 'blob',
  })

  const blob = mimeType ? new Blob([response.data], { type: mimeType }) : response.data
  downloadFileFromResponse({ ...response, data: blob }, fileName)
}
