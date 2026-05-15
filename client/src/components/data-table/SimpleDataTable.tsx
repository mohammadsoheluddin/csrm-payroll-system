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
    <div className="csrm-premium-surface overflow-hidden rounded-3xl">
      <div className="overflow-x-auto [scrollbar-gutter:stable]">
        <table className="min-w-full divide-y divide-border/80 text-sm">
          <thead className="sticky top-0 z-10 bg-muted/70 text-left text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground backdrop-blur-xl">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn('whitespace-nowrap px-4 py-3.5', column.className)}>
                  {column.label}
                </th>
              ))}
              {actions && <th className="sticky right-0 whitespace-nowrap bg-muted/80 px-4 py-3.5 text-right backdrop-blur-xl">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70 bg-card/80">
            {records.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-14 text-center text-muted-foreground">
                  <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-border bg-background/60 p-5">
                    <p className="text-sm font-semibold text-foreground">No records to show</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={getRowKey(record)} className="transition-colors duration-150 hover:bg-muted/35">
                  {columns.map((column) => (
                    <td key={column.key} className={cn('max-w-[280px] truncate px-4 py-3.5 text-foreground', column.className)}>
                      {renderValue(record, column)}
                    </td>
                  ))}
                  {actions && <td className="sticky right-0 bg-card/95 px-4 py-3.5 text-right shadow-[-12px_0_24px_-24px_hsl(var(--foreground))] backdrop-blur-xl">{actions(record)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
