import { ArrowRight, CheckCircle2, Clock3, Database, FileDown, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PERMISSIONS } from '@/config/permissions'
import { routePaths } from '@/config/routePaths'
import { getVisibleSidebarGroups } from '@/config/sidebar.config'
import { DashboardPayrollTrendChart } from '@/features/dashboard/components/DashboardPayrollTrendChart'
import { DashboardQuickActionGrid } from '@/features/dashboard/components/DashboardQuickActionGrid'
import { implementationRoadmap } from '@/features/dashboard/data/dashboardFoundationData'
import { canUserAccess } from '@/lib/auth/permission.utils'
import type { AuthUser } from '@/types/auth.types'
import type { DashboardWidgetId } from '@/types/dashboard.types'

type DashboardWidgetContentProps = {
  widgetId: DashboardWidgetId
  user: AuthUser | null
}

const statusItems = [
  'Backend core locked as code-freeze candidate',
  'Frontend auth/API/error/permission foundation ready',
  'UI reference standard locked for premium ERP screens',
  'Salary Summary backend module registered as B51',
]

const payrollChecklist = [
  'Payroll run and salary sheet preview placeholders are ready for future UI wiring.',
  'Approval, lock, unlock, audit, and export buttons will use PermissionGuard.',
  'Dashboard trend chart is mock-only until payroll summary APIs are connected.',
]

const reportChecklist = [
  'Report Center route catalog must use documented sub-routes, not unsafe base route assumptions.',
  'Download helper supports PDF, Excel, and CSV response blobs.',
  'Future report previews should render backend-calculated totals only.',
]

export const DashboardWidgetContent = ({ widgetId, user }: DashboardWidgetContentProps) => {
  if (widgetId === 'system_overview') {
    const sidebarGroups = getVisibleSidebarGroups(user?.role)
    const visibleLinks = sidebarGroups.reduce(
      (total, group) =>
        total +
        group.items.reduce((itemTotal, item) => itemTotal + 1 + (item.children?.length ?? 0), 0),
      0,
    )

    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-3">
          {statusItems.map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl border border-border bg-background p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-6 text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">Visible sidebar links</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{visibleLinks}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <p className="mt-2 text-3xl font-bold capitalize text-foreground">
              {user?.role?.replaceAll('_', ' ') ?? 'user'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (widgetId === 'hr_operations') {
    return (
      <div className="space-y-3">
        {[
          ['Employee Directory', routePaths.employees, PERMISSIONS.EMPLOYEE_READ],
          ['Bulk Import', routePaths.employeeBulkImport, PERMISSIONS.EMPLOYEE_BULK_IMPORT_READ],
          ['Movements', routePaths.employeeMovements, PERMISSIONS.EMPLOYEE_MOVEMENT_READ],
        ].map(([label, href, permission]) => (
          <Link
            key={label}
            to={href}
            className="flex items-center justify-between rounded-2xl border border-border bg-background p-4 transition hover:border-primary/40 hover:bg-muted/30"
          >
            <div>
              <p className="font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">Permission: {permission}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    )
  }

  if (widgetId === 'attendance_leave') {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Attendance', 'Daily register, imports, and manual correction flow.'],
          ['Finalization', 'Month-end attendance lock/unlock and approval control.'],
          ['Leave', 'Application, approval, balance, and holiday support.'],
        ].map(([title, description]) => (
          <div key={title} className="rounded-2xl border border-border bg-background p-4">
            <Clock3 className="h-5 w-5 text-primary" />
            <p className="mt-3 font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    )
  }

  if (widgetId === 'payroll_control') {
    return (
      <div className="space-y-4">
        <DashboardPayrollTrendChart />
        <div className="grid gap-3 md:grid-cols-3">
          {payrollChecklist.map((item) => (
            <div key={item} className="rounded-2xl border border-border bg-background p-4">
              <LockKeyhole className="h-5 w-5 text-primary" />
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (widgetId === 'salary_summary') {
    const canExport = canUserAccess(user, [PERMISSIONS.SALARY_SUMMARY_EXPORT])

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Backend ready</Badge>
            <Badge>B51</Badge>
            {canExport ? <Badge variant="success">Export allowed</Badge> : <Badge>Read only</Badge>}
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Salary Summary is now a dedicated backend report module. The frontend can show this placeholder now;
            full preview and PDF/Excel/CSV export UI should be built in a dedicated Salary Summary UI part.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={routePaths.salarySummary}>
              <Button>
                Open Salary Summary
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" disabled={!canExport}>
              Future export controls
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (widgetId === 'reports_exports') {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {reportChecklist.map((item) => (
          <div key={item} className="rounded-2xl border border-border bg-background p-4">
            <FileDown className="h-5 w-5 text-primary" />
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item}</p>
          </div>
        ))}
      </div>
    )
  }

  if (widgetId === 'rbac_audit') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold text-foreground">Permission coverage</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Sidebar, route, button, and export action visibility now use the same permission foundation.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <Database className="h-5 w-5 text-primary" />
          <p className="mt-3 font-semibold text-foreground">Audit readiness</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Future audit drawers can be opened from list rows without changing route guard logic.
          </p>
        </div>
      </div>
    )
  }

  if (widgetId === 'quick_actions') {
    return <DashboardQuickActionGrid user={user} />
  }

  if (widgetId === 'implementation_roadmap') {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {implementationRoadmap.map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-background p-4">
            <Badge>{item.title}</Badge>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    )
  }

  return null
}
