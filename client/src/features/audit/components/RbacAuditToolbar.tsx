import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { USER_ROLES } from '@/config/roles'
import type { RbacAuditFilters, RbacModuleDefinition } from '@/features/audit/types/audit.types'
import { DEFAULT_RBAC_FILTERS } from '@/features/audit/utils/audit.utils'

const inputClass = 'h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary'

const categories = ['master_data', 'employee', 'attendance', 'leave', 'salary', 'ot', 'bonus', 'payment', 'report', 'security', 'system']
const riskLevels = ['low', 'medium', 'high', 'critical']

type RbacAuditToolbarProps = {
  filters: RbacAuditFilters
  modules: RbacModuleDefinition[]
  onChange: (filters: RbacAuditFilters) => void
  onRefresh: () => void
  isLoading?: boolean
}

export const RbacAuditToolbar = ({ filters, modules, onChange, onRefresh, isLoading }: RbacAuditToolbarProps) => {
  const setFilter = (key: keyof RbacAuditFilters, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <Card>
      <CardContent className="grid gap-3 pt-5 md:grid-cols-2 xl:grid-cols-5">
        <select className={inputClass} value={filters.module ?? ''} onChange={(event) => setFilter('module', event.target.value)}>
          <option value="">All modules</option>
          {modules.map((item) => (
            <option key={item.moduleKey} value={item.moduleKey}>{item.moduleName ?? item.moduleKey}</option>
          ))}
        </select>
        <select className={inputClass} value={filters.role ?? ''} onChange={(event) => setFilter('role', event.target.value)}>
          <option value="">All roles</option>
          {USER_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <select className={inputClass} value={filters.category ?? ''} onChange={(event) => setFilter('category', event.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select className={inputClass} value={filters.riskLevel ?? ''} onChange={(event) => setFilter('riskLevel', event.target.value)}>
          <option value="">All risk levels</option>
          {riskLevels.map((riskLevel) => <option key={riskLevel} value={riskLevel}>{riskLevel}</option>)}
        </select>
        <div className="flex gap-2">
          <Button className="flex-1" variant="outline" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="ghost" onClick={() => onChange(DEFAULT_RBAC_FILTERS)} disabled={isLoading}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  )
}
