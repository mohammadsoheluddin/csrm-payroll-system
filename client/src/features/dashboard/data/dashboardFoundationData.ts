import {
  Banknote,
  Building2,
  CalendarDays,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'

import { PERMISSIONS, type Permission } from '@/config/permissions'
import { routePaths } from '@/config/routePaths'

export type DashboardFoundationMetric = {
  label: string
  value: string
  helper: string
}

export type DashboardQuickAction = {
  label: string
  description: string
  href: string
  icon: typeof Users
  requiredPermissions?: Permission[]
  badge?: string
}

export const dashboardFoundationMetrics: DashboardFoundationMetric[] = [
  {
    label: 'Backend status',
    value: 'Locked',
    helper: 'Core backend is a code-freeze candidate with frontend start approved.',
  },
  {
    label: 'Frontend phase',
    value: 'F6',
    helper: 'Role-based dashboard and widget customization foundation.',
  },
  {
    label: 'Report focus',
    value: 'B51',
    helper: 'Dedicated Salary Summary backend module is registered for preview/export.',
  },
]

export const dashboardQuickActions: DashboardQuickAction[] = [
  {
    label: 'Employee Directory',
    description: 'Go to employee directory placeholder before real table implementation.',
    href: routePaths.employees,
    icon: Users,
    requiredPermissions: [PERMISSIONS.EMPLOYEE_READ],
  },
  {
    label: 'Create Employee',
    description: 'Future multi-step employee form entry point.',
    href: routePaths.employees,
    icon: UserPlus,
    requiredPermissions: [PERMISSIONS.EMPLOYEE_MANAGE],
    badge: 'Future',
  },
  {
    label: 'Attendance Register',
    description: 'Attendance register and finalization flow placeholder.',
    href: routePaths.attendance,
    icon: CalendarDays,
    requiredPermissions: [PERMISSIONS.ATTENDANCE_READ],
  },
  {
    label: 'Payroll Run',
    description: 'Payroll processing, approval, lock, and payment control.',
    href: routePaths.payroll,
    icon: Banknote,
    requiredPermissions: [PERMISSIONS.PAYROLL_READ],
  },
  {
    label: 'Salary Summary',
    description: 'Open B51 Salary Summary placeholder route.',
    href: routePaths.salarySummary,
    icon: FileSpreadsheet,
    requiredPermissions: [PERMISSIONS.SALARY_SUMMARY_READ],
    badge: 'B51',
  },
  {
    label: 'Report Center',
    description: 'Report catalog, readiness, and export route planning.',
    href: routePaths.reportCenter,
    icon: Download,
    requiredPermissions: [PERMISSIONS.REPORT_CENTER_READ],
  },
  {
    label: 'RBAC Audit',
    description: 'Permission coverage and RBAC audit control placeholder.',
    href: routePaths.rbacAudit,
    icon: ShieldCheck,
    requiredPermissions: [PERMISSIONS.RBAC_AUDIT_READ],
  },
  {
    label: 'Master Setup',
    description: 'Company, branch, department, and designation setup area.',
    href: routePaths.companies,
    icon: Building2,
    requiredPermissions: [PERMISSIONS.COMPANY_READ],
  },
]

export const payrollTrendMockData = [
  { month: 'Jan', salary: 42, ot: 7 },
  { month: 'Feb', salary: 48, ot: 9 },
  { month: 'Mar', salary: 45, ot: 8 },
  { month: 'Apr', salary: 52, ot: 11 },
  { month: 'May', salary: 58, ot: 12 },
]

export const implementationRoadmap = [
  {
    title: 'Part-F7',
    description: 'Master Data foundation screens using reusable table/form patterns.',
  },
  {
    title: 'Part-F8',
    description: 'Employee directory and employee profile foundation.',
  },
  {
    title: 'Part-F9',
    description: 'Attendance and Leave operation dashboard foundation.',
  },
  {
    title: 'Part-F11.1',
    description: 'Salary Summary preview and PDF/Excel/CSV export UI.',
  },
]
