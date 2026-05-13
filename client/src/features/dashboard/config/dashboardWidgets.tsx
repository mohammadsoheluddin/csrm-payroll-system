import {
  Banknote,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileDown,
  Gauge,
  LayoutDashboard,
  Route,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { PERMISSIONS, hasPermission } from '@/config/permissions'
import { USER_ROLE, type UserRole } from '@/config/roles'
import type { DashboardWidgetDefinition, DashboardWidgetId } from '@/types/dashboard.types'

const adminRoles: UserRole[] = [USER_ROLE.super_admin, USER_ROLE.admin]
const hrOpsRoles: UserRole[] = [USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.hr, USER_ROLE.manager]
const payrollRoles: UserRole[] = [USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.hr, USER_ROLE.accounts, USER_ROLE.manager]
const reportRoles: UserRole[] = [USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.hr, USER_ROLE.accounts, USER_ROLE.manager]
const allRoles: UserRole[] = [
  USER_ROLE.super_admin,
  USER_ROLE.admin,
  USER_ROLE.hr,
  USER_ROLE.accounts,
  USER_ROLE.manager,
  USER_ROLE.employee,
]

export const dashboardWidgetDefinitions: DashboardWidgetDefinition[] = [
  {
    id: 'system_overview',
    title: 'System Overview',
    description: 'Frontend setup, backend lock, current role, and visible module summary.',
    category: 'Overview',
    icon: LayoutDashboard,
    size: 'wide',
    defaultRoles: allRoles,
    isRequired: true,
    badge: 'Core',
  },
  {
    id: 'hr_operations',
    title: 'HR Operations',
    description: 'Employee, bulk import, movement, and master HR action readiness.',
    category: 'HR Operations',
    icon: Users,
    size: 'md',
    requiredPermissions: [PERMISSIONS.EMPLOYEE_READ],
    defaultRoles: hrOpsRoles,
  },
  {
    id: 'attendance_leave',
    title: 'Attendance & Leave',
    description: 'Attendance, finalization, leave approval, and holiday control readiness.',
    category: 'HR Operations',
    icon: CalendarCheck,
    size: 'md',
    requiredPermissions: [PERMISSIONS.ATTENDANCE_READ],
    defaultRoles: hrOpsRoles,
  },
  {
    id: 'payroll_control',
    title: 'Payroll Control',
    description: 'Payroll run, salary sheet, approval, lock, and payment flow summary.',
    category: 'Payroll',
    icon: Banknote,
    size: 'lg',
    requiredPermissions: [PERMISSIONS.PAYROLL_READ],
    defaultRoles: payrollRoles,
  },
  {
    id: 'salary_summary',
    title: 'Salary Summary',
    description: 'Dedicated B51 backend report entry point for Salary/Wages + OT summary.',
    category: 'Reports',
    icon: ClipboardList,
    size: 'lg',
    requiredPermissions: [PERMISSIONS.SALARY_SUMMARY_READ],
    defaultRoles: reportRoles,
    badge: 'B51',
  },
  {
    id: 'reports_exports',
    title: 'Reports & Export',
    description: 'Report Center, PDF, Excel, CSV, preview, and download flow readiness.',
    category: 'Reports',
    icon: FileDown,
    size: 'md',
    requiredPermissions: [PERMISSIONS.REPORT_CENTER_READ],
    defaultRoles: reportRoles,
  },
  {
    id: 'rbac_audit',
    title: 'RBAC & Audit',
    description: 'Permission coverage, audit log access, and control-panel visibility.',
    category: 'System Control',
    icon: ShieldCheck,
    size: 'md',
    requiredPermissions: [PERMISSIONS.RBAC_AUDIT_READ],
    defaultRoles: adminRoles,
  },
  {
    id: 'quick_actions',
    title: 'Quick Actions',
    description: 'Role-wise shortcuts to the most important frontend routes.',
    category: 'Overview',
    icon: Route,
    size: 'wide',
    defaultRoles: allRoles,
    isRequired: true,
  },
  {
    id: 'implementation_roadmap',
    title: 'Implementation Roadmap',
    description: 'Immediate frontend build order after auth, API, permission, and dashboard foundations.',
    category: 'Overview',
    icon: CheckCircle2,
    size: 'wide',
    defaultRoles: allRoles,
  },
]

export const dashboardWidgetSizeClasses: Record<string, string> = {
  sm: 'xl:col-span-3',
  md: 'xl:col-span-4',
  lg: 'xl:col-span-6',
  wide: 'xl:col-span-12',
}

export const defaultDashboardWidgetOrder: DashboardWidgetId[] = dashboardWidgetDefinitions.map(
  (widget) => widget.id,
)

export const getDashboardWidgetsForRole = (role?: UserRole | string | null) => {
  return dashboardWidgetDefinitions.filter((widget) => {
    if (!role) {
      return !widget.requiredPermissions?.length
    }

    const isRoleDefault = widget.defaultRoles.includes(role as UserRole)
    const hasRequiredPermission = hasPermission(role, widget.requiredPermissions)

    return isRoleDefault && hasRequiredPermission
  })
}

export const getDashboardWidgetDefinition = (widgetId: DashboardWidgetId) => {
  return dashboardWidgetDefinitions.find((widget) => widget.id === widgetId)
}

export const dashboardCategoryIconMap = {
  Overview: Gauge,
  'HR Operations': Users,
  Payroll: Banknote,
  Reports: BarChart3,
  'System Control': ShieldCheck,
} as const
