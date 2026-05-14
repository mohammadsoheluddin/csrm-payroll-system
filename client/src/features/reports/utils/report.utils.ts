import { currentPayrollMonth, formatCurrency } from '@/features/payroll/utils/payroll.utils'
import type { ReportCatalogItem, ReportMetric, ReportPeriodFilters, ReportPreviewRow } from '@/features/reports/types/report.types'
import { getRecordValueByPath, toTitleCase } from '@/lib/format/record.utils'

export const currentReportPeriod = (): ReportPeriodFilters => ({
  ...currentPayrollMonth(),
  groupBy: 'majorDepartment',
})

export const cleanReportParams = (filters: Partial<ReportPeriodFilters> = {}) => {
  return Object.entries(filters).reduce<Record<string, string | number>>((params, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value as string | number
    }

    return params
  }, {})
}

export const normalizeCatalogItems = (value: unknown): ReportCatalogItem[] => {
  if (Array.isArray(value)) {
    return value as ReportCatalogItem[]
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    const candidates = [record.catalog, record.reports, record.items, record.records, record.data]

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as ReportCatalogItem[]
      }
    }
  }

  return []
}

export const normalizePreviewRows = (value: unknown): ReportPreviewRow[] => {
  if (Array.isArray(value)) {
    return value as ReportPreviewRow[]
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    const candidates = [record.summaryRows, record.rows, record.records, record.items, record.data]

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as ReportPreviewRow[]
      }
    }
  }

  return []
}

export const getPreviewTotals = (value: unknown) => {
  if (typeof value !== 'object' || value === null) {
    return {}
  }

  const record = value as Record<string, unknown>
  return (record.totals ?? record.summary ?? record.total ?? {}) as Record<string, unknown>
}

export const getCatalogItemTitle = (item: ReportCatalogItem) => {
  return item.title || item.name || item.key || item.id || 'Untitled Report'
}

export const getCatalogItemKey = (item: ReportCatalogItem, index: number) => {
  return item.id || item.key || item.route || `${getCatalogItemTitle(item)}-${index}`
}

export const buildReportMetrics = (value: unknown): ReportMetric[] => {
  if (typeof value !== 'object' || value === null) {
    return []
  }

  const record = value as Record<string, unknown>
  const source = (record.metrics ?? record.summary ?? record.totals ?? record) as Record<string, unknown>

  return Object.entries(source)
    .filter(([, metricValue]) => ['string', 'number', 'boolean'].includes(typeof metricValue))
    .slice(0, 8)
    .map(([key, metricValue]) => ({
      label: toTitleCase(key),
      value: typeof metricValue === 'number' && key.toLowerCase().includes('amount') ? formatCurrency(metricValue) : String(metricValue),
    }))
}

const amountColumnHints = ['gross', 'net', 'bank', 'cash', 'ait', 'loan', 'suspense', 'amount', 'total', 'payable', 'salary', 'ot']

export const formatReportCell = (value: unknown, key?: string) => {
  if (value === undefined || value === null || value === '') {
    return '—'
  }

  if (typeof value === 'number') {
    const keyName = key?.toLowerCase() ?? ''
    return amountColumnHints.some((hint) => keyName.includes(hint)) ? formatCurrency(value) : String(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'object') {
    const label = getRecordValueByPath(value as Record<string, unknown>, 'name')
    if (typeof label === 'string') return label

    const title = getRecordValueByPath(value as Record<string, unknown>, 'title')
    if (typeof title === 'string') return title

    const employeeName = getRecordValueByPath(value as Record<string, unknown>, 'employeeName')
    if (typeof employeeName === 'string') return employeeName

    return JSON.stringify(value)
  }

  return String(value)
}

export const getReportFileName = ({
  name,
  filters,
  type,
}: {
  name: string
  filters: Partial<ReportPeriodFilters>
  type: 'csv' | 'excel' | 'pdf'
}) => {
  const extension = type === 'excel' ? 'xlsx' : type
  return `${name}-${filters.year ?? 'year'}-${String(filters.month ?? 'month').padStart(2, '0')}.${extension}`
}
