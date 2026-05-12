export type ApiMeta = {
  page?: number
  limit?: number
  total?: number
  totalPage?: number
}

export type ApiSuccessResponse<TData> = {
  success: true
  message: string
  data: TData
  meta?: ApiMeta
}

export type ApiErrorSource = {
  path: string
  message: string
}

export type ApiErrorResponse = {
  success: false
  message: string
  errorSources?: ApiErrorSource[]
  stack?: string
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse
