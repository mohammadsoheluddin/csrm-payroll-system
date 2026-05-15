import {
  Banknote,
  BarChart3,
  Building2,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  Gauge,
  Landmark,
  MoonStar,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { PERMISSIONS, hasPermission, type Permission } from '@/config/permissions'
import { routePaths } from '@/config/routePaths'
import type { UserRole } from '@/config/roles'

export type SidebarChildItem = {
  label: string
  href: string
  requiredPermissions?: Permission[]
  badge?: string
}

export type SidebarItem = {
  label: string
  href?: string
  icon: LucideIcon
  requiredPermissions?: Permission[]
  children?: SidebarChildItem[]
  badge?: string
}

export type SidebarGroup = {
  label: string
  items: SidebarItem[]
}

export const sidebarGroups: SidebarGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: routePaths.dashboard,
        icon: Gauge,
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Users',
        href: routePaths.users,
        icon: UserCog,
        requiredPermissions: [PERMISSIONS.USER_READ],
      },
      {
        label: 'Master Setup',
        icon: Building2,
        requiredPermissions: [PERMISSIONS.COMPANY_READ],
        children: [
          {
            label: 'Companies / Concerns',
            href: routePaths.companies,
            requiredPermissions: [PERMISSIONS.COMPANY_READ],
          },
          {
            label: 'Branches',
            href: routePaths.branches,
            requiredPermissions: [PERMISSIONS.BRANCH_READ],
          },
          {
            label: 'Major Departments',
            href: routePaths.majorDepartments,
            requiredPermissions: [PERMISSIONS.MAJOR_DEPARTMENT_READ],
          },
          {
            label: 'Departments / Sections',
            href: routePaths.departments,
            requiredPermissions: [PERMISSIONS.DEPARTMENT_READ],
          },
          {
            label: 'Designations',
            href: routePaths.designations,
            requiredPermissions: [PERMISSIONS.DESIGNATION_READ],
          },
          {
            label: 'Company Bank Accounts',
            href: routePaths.companyBankAccounts,
            requiredPermissions: [PERMISSIONS.COMPANY_BANK_ACCOUNT_READ],
          },
        ],
      },
    ],
  },
  {
    label: 'HR Operations',
    items: [
      {
        label: 'Employees',
        icon: Users,
        requiredPermissions: [PERMISSIONS.EMPLOYEE_READ],
        children: [
          {
            label: 'Employee Directory',
            href: routePaths.employees,
            requiredPermissions: [PERMISSIONS.EMPLOYEE_READ],
          },
          {
            label: 'Bulk Import',
            href: routePaths.employeeBulkImport,
            requiredPermissions: [PERMISSIONS.EMPLOYEE_BULK_IMPORT_READ],
          },
          {
            label: 'Movements',
            href: routePaths.employeeMovements,
            requiredPermissions: [PERMISSIONS.EMPLOYEE_MOVEMENT_READ],
          },
        ],
      },
      {
        label: 'Attendance',
        icon: CalendarCheck,
        requiredPermissions: [PERMISSIONS.ATTENDANCE_READ],
        children: [
          {
            label: 'Attendance Register',
            href: routePaths.attendance,
            requiredPermissions: [PERMISSIONS.ATTENDANCE_READ],
          },
          {
            label: 'Attendance Imports',
            href: routePaths.attendanceImports,
            requiredPermissions: [PERMISSIONS.ATTENDANCE_IMPORT_READ],
          },
          {
            label: 'Finalization',
            href: routePaths.attendanceFinalizations,
            requiredPermissions: [PERMISSIONS.ATTENDANCE_FINALIZATION_READ],
          },
        ],
      },
      {
        label: 'Leave',
        icon: ClipboardList,
        requiredPermissions: [PERMISSIONS.LEAVE_READ],
        children: [
          {
            label: 'Leave Applications',
            href: routePaths.leave,
            requiredPermissions: [PERMISSIONS.LEAVE_READ],
          },
          {
            label: 'Leave Balances',
            href: routePaths.leaveBalances,
            requiredPermissions: [PERMISSIONS.LEAVE_BALANCE_READ],
          },
          {
            label: 'Holiday Calendar',
            href: routePaths.holidays,
            requiredPermissions: [PERMISSIONS.HOLIDAY_READ],
          },
        ],
      },
    ],
  },
  {
    label: 'Payroll Engine',
    items: [
      {
        label: 'Payroll',
        icon: Banknote,
        requiredPermissions: [PERMISSIONS.PAYROLL_READ],
        children: [
          {
            label: 'Payroll Run',
            href: routePaths.payroll,
            requiredPermissions: [PERMISSIONS.PAYROLL_READ],
          },
          {
            label: 'Salary Structures',
            href: routePaths.salaryStructures,
            requiredPermissions: [PERMISSIONS.SALARY_STRUCTURE_READ],
          },
          {
            label: 'Salary Sheets',
            href: routePaths.salarySheets,
            requiredPermissions: [PERMISSIONS.SALARY_SHEET_READ],
          },
          {
            label: 'Salary Statements',
            href: routePaths.salaryStatements,
            requiredPermissions: [PERMISSIONS.SALARY_STATEMENT_READ],
          },
          {
            label: 'Salary Payments',
            href: routePaths.salaryPaymentDistributions,
            requiredPermissions: [PERMISSIONS.SALARY_PAYMENT_DISTRIBUTION_READ],
          },
          {
            label: 'Legacy Salary Import',
            href: routePaths.legacySalaryImports,
            requiredPermissions: [PERMISSIONS.LEGACY_SALARY_IMPORT_READ],
            badge: 'B52',
          },
        ],
      },
      {
        label: 'Time Bill / OT',
        icon: FileSpreadsheet,
        requiredPermissions: [PERMISSIONS.TIME_BILL_READ],
        children: [
          {
            label: 'Time Bills',
            href: routePaths.timeBills,
            requiredPermissions: [PERMISSIONS.TIME_BILL_READ],
          },
          {
            label: 'OT Statements',
            href: routePaths.otStatements,
            requiredPermissions: [PERMISSIONS.OT_STATEMENT_READ],
          },
          {
            label: 'OT Payments',
            href: routePaths.otPaymentDistributions,
            requiredPermissions: [PERMISSIONS.OT_PAYMENT_DISTRIBUTION_READ],
          },
        ],
      },
      {
        label: 'Bonus',
        icon: Landmark,
        requiredPermissions: [PERMISSIONS.BONUS_SHEET_READ],
        children: [
          {
            label: 'Bonus Sheets',
            href: routePaths.bonus,
            requiredPermissions: [PERMISSIONS.BONUS_SHEET_READ],
          },
          {
            label: 'Bonus Statements',
            href: routePaths.bonusStatements,
            requiredPermissions: [PERMISSIONS.BONUS_STATEMENT_READ],
          },
          {
            label: 'Bonus Payments',
            href: routePaths.bonusPaymentDistributions,
            requiredPermissions: [PERMISSIONS.BONUS_PAYMENT_DISTRIBUTION_READ],
          },
        ],
      },
      {
        label: 'Bank Sheets',
        href: routePaths.bankSheets,
        icon: Landmark,
        requiredPermissions: [PERMISSIONS.BANK_SHEET_READ],
      },
    ],
  },
  {
    label: 'Reports & Control',
    items: [
      {
        label: 'Report Center',
        icon: BarChart3,
        requiredPermissions: [PERMISSIONS.REPORT_CENTER_READ],
        children: [
          {
            label: 'Report Center',
            href: routePaths.reportCenter,
            requiredPermissions: [PERMISSIONS.REPORT_CENTER_READ],
          },
          {
            label: 'Salary Summary',
            href: routePaths.salarySummary,
            requiredPermissions: [PERMISSIONS.SALARY_SUMMARY_READ],
            badge: 'B51',
          },
          {
            label: 'Layout Standards',
            href: routePaths.reportLayoutStandards,
            requiredPermissions: [PERMISSIONS.REPORT_LAYOUT_STANDARD_READ],
          },
          {
            label: 'Month-End Control',
            href: routePaths.monthEndControl,
            requiredPermissions: [PERMISSIONS.MONTH_END_PROCESS_CONTROL_READ],
          },
        ],
      },
      {
        label: 'Audit Logs',
        href: routePaths.auditLogs,
        icon: ShieldCheck,
        requiredPermissions: [PERMISSIONS.AUDIT_LOG_READ],
      },
      {
        label: 'RBAC Audit',
        href: routePaths.rbacAudit,
        icon: ShieldCheck,
        requiredPermissions: [PERMISSIONS.RBAC_AUDIT_READ],
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        label: 'Theme & Layout',
        href: routePaths.themeSettings,
        icon: MoonStar,
      },
      {
        label: 'Future Settings',
        icon: Settings,
        children: [
          {
            label: 'Profile Settings',
            href: routePaths.profile,
          },
        ],
      },
    ],
  },
]

export const sidebarExpandIcon = ChevronRight

const canShowWithoutRole = (permissions?: Permission[]) => !permissions?.length

export const getVisibleSidebarGroups = (role?: UserRole | string): SidebarGroup[] => {
  return sidebarGroups
    .map((group) => {
      const visibleItems = group.items.reduce<SidebarItem[]>((accumulator, item) => {
        const visibleChildren = item.children?.filter((child) => {
          if (!role) {
            return canShowWithoutRole(child.requiredPermissions)
          }

          return hasPermission(role, child.requiredPermissions)
        })

        const isItemVisible = role
          ? hasPermission(role, item.requiredPermissions)
          : canShowWithoutRole(item.requiredPermissions)

        if (!isItemVisible && !visibleChildren?.length) {
          return accumulator
        }

        accumulator.push({
          ...item,
          children: visibleChildren,
        })

        return accumulator
      }, [])

      return {
        ...group,
        items: visibleItems,
      }
    })
    .filter((group) => group.items.length > 0)
}

export const countVisibleSidebarItems = (role?: UserRole | string) => {
  return getVisibleSidebarGroups(role).reduce((total, group) => {
    return total + group.items.reduce((itemTotal, item) => itemTotal + 1 + (item.children?.length ?? 0), 0)
  }, 0)
}
