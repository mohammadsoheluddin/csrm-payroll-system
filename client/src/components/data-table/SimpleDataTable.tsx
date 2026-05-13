import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import {
  formatBoolean,
  formatDateTime,
  getRecordValueByPath,
  getReferenceLabel,
  toTitleCase,
} from '@/lib/format/record.utils'

export type SimpleDataTableColumn<TRecord extends Record<string, unknown>> = {
  key: string
  label: string
  type?: 'text' | 'status' | 'boolean' | 'date' | 'reference' | 'badge'
  className?: string
  render?: (record: TRecord) => ReactNode
}

export type SimpleDataTableProps<TRecord extends Record<string, unknown>> = {
  records: TRecord[]
  columns: SimpleDataTableColumn<TRecord>[]
  getRowKey: (record: TRecord) => string
  actions?: (record: TRecord) => ReactNode
  emptyMessage?: string
}

const renderValue = <TRecord extends Record<string, unknown>>(
  record: TRecord,
  column: SimpleDataTableColumn<TRecord>,
) => {
  if (column.render) {
    return column.render(record)
  }

  const value = getRecordValueByPath(record, column.key)

  if (column.type === 'status') {
    const status = typeof value === 'string' ? value : 'unknown'
    return <Badge variant={status === 'active' ? 'success' : 'muted'}>{toTitleCase(status)}</Badge>
  }

  if (column.type === 'boolean') {
    return <Badge variant={value === true ? 'success' : 'muted'}>{formatBoolean(value)}</Badge>
  }

  if (column.type === 'date') {
    return formatDateTime(value)
  }

  if (column.type === 'reference') {
    return getReferenceLabel(value)
  }

  if (column.type === 'badge') {
    return <Badge variant="muted">{typeof value === 'string' ? toTitleCase(value) : '—'}</Badge>
  }

  if (value === undefined || value === null || value === '') {
    return '—'
  }

  return typeof value === 'string' || typeof value === 'number' ? value : getReferenceLabel(value)
}

export const SimpleDataTable = <TRecord extends Record<string, unknown>>({
  records,
  columns,
  getRowKey,
  actions,
  emptyMessage = 'No records found.',
}: SimpleDataTableProps<TRecord>) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn('whitespace-nowrap px-4 py-3', column.className)}>
                  {column.label}
                </th>
              ))}
              {actions && <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {records.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={getRowKey(record)} className="transition hover:bg-muted/30">
                  {columns.map((column) => (
                    <td key={column.key} className={cn('max-w-[260px] truncate px-4 py-3 text-foreground', column.className)}>
                      {renderValue(record, column)}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3 text-right">{actions(record)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
