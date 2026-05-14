import { Search, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import type { AuditFilterOptions, AuditLogFilters } from '@/features/audit/types/audit.types'
import { DEFAULT_AUDIT_FILTERS, getAuditSelectOptions } from '@/features/audit/utils/audit.utils'

type AuditLogToolbarProps = {
  filters: AuditLogFilters
  options?: AuditFilterOptions
  onChange: (filters: AuditLogFilters) => void
  onRefresh: () => void
  isLoading?: boolean
}

const inputClass = 'h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary'

export const AuditLogToolbar = ({ filters, options, onChange, onRefresh, isLoading }: AuditLogToolbarProps) => {
  const setFilter = (key: keyof AuditLogFilters, value: string | number | boolean | undefined) => {
    onChange({ ...filters, [key]: value, page: 1 })
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={`${inputClass} w-full pl-9`}
              placeholder="Search actor, entity, request id, IP, path, or description"
              value={filters.searchTerm ?? ''}
              onChange={(event) => setFilter('searchTerm', event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
              <SlidersHorizontal className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="ghost" onClick={() => onChange(DEFAULT_AUDIT_FILTERS)} disabled={isLoading}>
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select className={inputClass} value={filters.module ?? ''} onChange={(event) => setFilter('module', event.target.value)}>
            <option value="">All modules</option>
            {getAuditSelectOptions(options, 'modules').map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.action ?? ''} onChange={(event) => setFilter('action', event.target.value)}>
            <option value="">All actions</option>
            {getAuditSelectOptions(options, 'actions').map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.riskLevel ?? ''} onChange={(event) => setFilter('riskLevel', event.target.value)}>
            <option value="">All risk levels</option>
            {getAuditSelectOptions(options, 'riskLevels').map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.category ?? ''} onChange={(event) => setFilter('category', event.target.value)}>
            <option value="">All categories</option>
            {getAuditSelectOptions(options, 'categories').map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.actorRole ?? ''} onChange={(event) => setFilter('actorRole', event.target.value)}>
            <option value="">All actor roles</option>
            {getAuditSelectOptions(options, 'actorRoles').map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.deviceType ?? ''} onChange={(event) => setFilter('deviceType', event.target.value)}>
            <option value="">All devices</option>
            {getAuditSelectOptions(options, 'deviceTypes').map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input className={inputClass} type="date" value={filters.fromDate ?? ''} onChange={(event) => setFilter('fromDate', event.target.value)} />
          <input className={inputClass} type="date" value={filters.toDate ?? ''} onChange={(event) => setFilter('toDate', event.target.value)} />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            className={inputClass}
            placeholder="Actor email"
            value={filters.actorEmail ?? ''}
            onChange={(event) => setFilter('actorEmail', event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Entity ID"
            value={filters.entityId ?? ''}
            onChange={(event) => setFilter('entityId', event.target.value)}
          />
          <select className={inputClass} value={filters.sensitiveOnly ?? ''} onChange={(event) => setFilter('sensitiveOnly', event.target.value)}>
            <option value="">All audit events</option>
            <option value="true">Sensitive only</option>
          </select>
          <select className={inputClass} value={filters.includeData ?? 'false'} onChange={(event) => setFilter('includeData', event.target.value)}>
            <option value="false">Hide data payload</option>
            <option value="true">Include data payload</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
