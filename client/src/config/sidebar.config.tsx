import {
  Banknote,
  BarChart3,
  Building2,
  CalendarCheck,
  ClipboardList,
  FileSpreadsheet,
  Gauge,
  Landmark,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { PERMISSIONS, type Permission } from '@/config/permissions'
import { routePaths } from '@/config/routePaths'

export type SidebarItem = {
  label: string
  href: string
  icon: LucideIcon
  requiredPermissions?: Permission[]
}

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: routePaths.dashboard,
    icon: Gauge,
  },
  {
    label: 'Master Setup',
    href: routePaths.companies,
    icon: Building2,
    requiredPermissions: [PERMISSIONS.COMPANY_READ],
  },
  {
    label: 'Employees',
    href: routePaths.employees,
    icon: Users,
    requiredPermissions: [PERMISSIONS.EMPLOYEE_READ],
  },
  {
    label: 'Attendance',
    href: routePaths.attendance,
    icon: CalendarCheck,
    requiredPermissions: [PERMISSIONS.ATTENDANCE_READ],
  },
  {
    label: 'Leave',
    href: routePaths.leave,
    icon: ClipboardList,
    requiredPermissions: [PERMISSIONS.LEAVE_READ],
  },
  {
    label: 'Payroll',
    href: routePaths.payroll,
    icon: Banknote,
    requiredPermissions: [PERMISSIONS.PAYROLL_READ],
  },
  {
    label: 'Bank Sheets',
    href: routePaths.bankSheets,
    icon: Landmark,
    requiredPermissions: [PERMISSIONS.BANK_SHEET_READ],
  },
  {
    label: 'Reports',
    href: routePaths.reportCenter,
    icon: FileSpreadsheet,
    requiredPermissions: [PERMISSIONS.REPORT_CENTER_READ],
  },
  {
    label: 'Audit Logs',
    href: routePaths.auditLogs,
    icon: BarChart3,
    requiredPermissions: [PERMISSIONS.AUDIT_LOG_READ],
  },
  {
    label: 'RBAC Audit',
    href: routePaths.rbacAudit,
    icon: ShieldCheck,
    requiredPermissions: [PERMISSIONS.RBAC_AUDIT_READ],
  },
]
