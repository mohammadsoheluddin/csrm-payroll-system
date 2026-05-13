import { Filter, Plus, RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import type {
  MasterDataModuleConfig,
  MasterDataQueryParams,
} from '@/features/master-data/types/masterData.types'
import { useMasterDataOptions } from '@/features/master-data/hooks/useMasterDataOptions'

export type MasterDataToolbarProps = {
  module: MasterDataModuleConfig
  searchText: string
  queryParams: MasterDataQueryParams
  onSearchTextChange: (value: string) => void
  onQueryParamsChange: (params: MasterDataQueryParams) => void
  onCreate: () => void
  onRefresh: () => void
  canManage: boolean
  isRefreshing?: boolean
}

export const MasterDataToolbar = ({
  module,
  searchText,
  queryParams,
  onSearchTextChange,
  onQueryParamsChange,
  onCreate,
  onRefresh,
  canManage,
  isRefreshing = false,
}: MasterDataToolbarProps) => {
  const { getFieldOptions } = useMasterDataOptions()

  const updateParam = (name: string, value: string) => {
    onQueryParamsChange({
      ...queryParams,
      [name]: value,
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchText}
              onChange={(event) => onSearchTextChange(event.target.value)}
              placeholder={`Search ${module.entityLabelPlural.toLowerCase()}...`}
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          {module.quickFilters?.map((field) => (
            <label key={field.name} className="min-w-[180px]">
              <span className="sr-only">{field.label}</span>
              <select
                value={String(queryParams[field.name as keyof MasterDataQueryParams] ?? '')}
                onChange={(event) => updateParam(field.name, event.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All {field.label}</option>
                {getFieldOptions(field).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button type="button" variant="outline" onClick={() => onQueryParamsChange({})}>
            <Filter className="h-4 w-4" />
            Clear filters
          </Button>
          {canManage && (
            <Button type="button" onClick={onCreate}>
              <Plus className="h-4 w-4" />
              New {module.entityLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
