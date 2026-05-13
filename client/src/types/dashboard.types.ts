import type { LucideIcon } from 'lucide-react'

import type { Permission } from '@/config/permissions'
import type { UserRole } from '@/config/roles'

export type DashboardWidgetId =
  | 'system_overview'
  | 'hr_operations'
  | 'attendance_leave'
  | 'payroll_control'
  | 'salary_summary'
  | 'reports_exports'
  | 'rbac_audit'
  | 'quick_actions'
  | 'implementation_roadmap'

export type DashboardWidgetSize = 'sm' | 'md' | 'lg' | 'wide'

export type DashboardWidgetCategory =
  | 'Overview'
  | 'HR Operations'
  | 'Payroll'
  | 'Reports'
  | 'System Control'

export type DashboardWidgetDefinition = {
  id: DashboardWidgetId
  title: string
  description: string
  category: DashboardWidgetCategory
  icon: LucideIcon
  size: DashboardWidgetSize
  requiredPermissions?: Permission[]
  defaultRoles: UserRole[]
  isRequired?: boolean
  badge?: string
}

export type DashboardWidgetPreference = {
  widgetId: DashboardWidgetId
  isHidden: boolean
}

export type DashboardDensity = 'comfortable' | 'compact'
