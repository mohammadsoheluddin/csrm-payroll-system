import type { EmployeeProfileDataGapSeverity } from '@/features/employees/employee-profile/types/employeeProfile.types'
import { getReferenceLabel, getRecordId } from '@/lib/format/record.utils'

export const getProfileReferenceLabel = (value: unknown) => {
  if (typeof value === 'object' && value !== null && 'name' in value) {
    const record = value as { name?: string; code?: string; id?: string }
    return record.name || record.code || record.id || '—'
  }

  return getReferenceLabel(value)
}

export const getStringValue = (record: Record<string, unknown> | undefined | null, key: string) => {
  const value = record?.[key]
  return typeof value === 'string' && value.trim() ? value : '—'
}

export const getNumberValue = (record: Record<string, unknown> | undefined | null, key: string) => {
  const value = Number(record?.[key] ?? 0)
  return Number.isFinite(value) ? value : 0
}

export const formatCurrency = (value: unknown) => {
  const amount = Number(value ?? 0)

  if (!Number.isFinite(amount)) {
    return '৳0'
  }

  return `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2 }).format(amount)}`
}

export const formatCompactNumber = (value: unknown) => {
  const amount = Number(value ?? 0)

  if (!Number.isFinite(amount)) {
    return '0'
  }

  return new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2 }).format(amount)
}

export const getGapVariant = (severity: EmployeeProfileDataGapSeverity) => {
  if (severity === 'critical') {
    return 'danger'
  }

  if (severity === 'warning') {
    return 'warning'
  }

  return 'muted'
}

export const getTimelineEventId = (event: { referenceId?: string; title: string; date?: string | null }, index: number) => {
  return event.referenceId || `${event.title}-${event.date ?? 'no-date'}-${index}`
}

export const getRecordDisplayId = (record: Record<string, unknown>) => {
  return getRecordId(record) || String(record.employeeId ?? record.payrollMonth ?? record.title ?? '—')
}

export const calculateProfileReadinessScore = (gaps: { severity: EmployeeProfileDataGapSeverity }[]) => {
  const penalty = gaps.reduce((total, gap) => {
    if (gap.severity === 'critical') {
      return total + 30
    }

    if (gap.severity === 'warning') {
      return total + 15
    }

    return total + 5
  }, 0)

  return Math.max(0, Math.min(100, 100 - penalty))
}
