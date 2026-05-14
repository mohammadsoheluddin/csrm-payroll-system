export type ReportPeriodFilters = {
  company?: string
  majorDepartment?: string
  department?: string
  employee?: string
  month: number
  year: number
  groupBy?: SalarySummaryGroupBy
  paymentMode?: string
}

export type ReportExportType = 'csv' | 'excel' | 'pdf'

export type SalarySummaryGroupBy =
  | 'company'
  | 'majorDepartment'
  | 'department'
  | 'section'
  | 'paymentMode'

export type ReportCatalogItem = {
  id?: string
  key?: string
  name?: string
  title?: string
  description?: string
  category?: string
  route?: string
  status?: string
  exportTypes?: string[]
  permissions?: string[]
}

export type ReportMetric = {
  label: string
  value: string | number
  description?: string
}

export type ReportPreviewRow = Record<string, unknown>

export type SalarySummaryPreview = {
  filters?: Record<string, unknown>
  summaryRows?: ReportPreviewRow[]
  rows?: ReportPreviewRow[]
  records?: ReportPreviewRow[]
  totals?: Record<string, unknown>
  generatedAt?: string
}
