import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, RefreshCw, ShieldCheck, ShieldAlert, TriangleAlert, XCircle } from 'lucide-react'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { SimpleDataTable } from '@/components/data-table/SimpleDataTable'
import type { SimpleDataTableColumn } from '@/components/data-table/SimpleDataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import { USER_ROLES } from '@/config/roles'
import { getRbacAuditSummary, getRbacCoverage, getRbacMatrix, getRbacModules, getRbacRoles, getRbacRouteCoverage } from '@/features/audit/api/audit.api'
import { RbacAuditToolbar } from '@/features/audit/components/RbacAuditToolbar'
import type { RbacAuditFilters, RbacMatrixRow, RbacRouteCoverageItem } from '@/features/audit/types/audit.types'
import { DEFAULT_RBAC_FILTERS, getCoverageBadgeVariant, getIssueBadgeVariant } from '@/features/audit/utils/audit.utils'
import { formatDateTime, toTitleCase } from '@/lib/format/record.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

const routeCoverageColumns: SimpleDataTableColumn<RbacRouteCoverageItem>[] = [
  {
    key: 'routePath',
    label: 'Route',
    render: (record) => (
      <div>
        <p className="font-medium text-foreground">{record.routePath ?? '—'}</p>
        <p className="text-xs text-muted-foreground">{record.moduleName ?? record.moduleKey ?? 'Unknown module'}</p>
      </div>
    ),
  },
  {
    key: 'category',
    label: 'Category',
    render: (record) => <Badge variant="muted">{record.category ? toTitleCase(record.category) : '—'}</Badge>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (record) => <Badge variant={getCoverageBadgeVariant(record.status)}>{record.status ? toTitleCase(record.status) : 'Unknown'}</Badge>,
  },
  {
    key: 'requiredPermissions',
    label: 'Required / Available',
    render: (record) => `${record.availablePermissions?.length ?? 0} / ${record.requiredPermissions?.length ?? 0}`,
  },
  {
    key: 'missingPermissions',
    label: 'Missing',
    render: (record) => record.missingPermissions?.length ? record.missingPermissions.join(', ') : '—',
  },
]

const matrixColumns: SimpleDataTableColumn<RbacMatrixRow>[] = [
  {
    key: 'permission',
    label: 'Permission',
    render: (record) => (
      <div>
        <p className="font-medium text-foreground">{record.permission ?? '—'}</p>
        <p className="text-xs text-muted-foreground">{record.label ?? record.moduleKey ?? '—'}</p>
      </div>
    ),
  },
  {
    key: 'riskLevel',
    label: 'Risk',
    render: (record) => <Badge variant={record.riskLevel === 'critical' || record.riskLevel === 'high' ? 'danger' : record.riskLevel === 'medium' ? 'warning' : 'muted'}>{record.riskLevel ? toTitleCase(record.riskLevel) : '—'}</Badge>,
  },
  ...USER_ROLES.map<SimpleDataTableColumn<RbacMatrixRow>>((role) => ({
    key: role,
    label: role,
    render: (record) => (
      record.roleCoverage?.[role]
        ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        : <XCircle className="h-4 w-4 text-muted-foreground" />
    ),
  })),
]

const statusLabel = (value?: string) => value ? toTitleCase(value) : 'Unknown'

export const RbacAuditPage = () => {
  const canAccess = useAuthStore((state) => state.canAccess)
  const role = useAuthStore((state) => state.user?.role)
  const canRead = canAccess([PERMISSIONS.RBAC_AUDIT_READ])
  const [filters, setFilters] = useState<RbacAuditFilters>(DEFAULT_RBAC_FILTERS)

  const modulesQuery = useQuery({
    queryKey: queryKeys.audit.rbacModules({}),
    queryFn: () => getRbacModules({}),
    enabled: canRead,
  })

  const summaryQuery = useQuery({
    queryKey: queryKeys.audit.rbacSummary(filters),
    queryFn: getRbacAuditSummary,
    enabled: canRead,
  })

  const rolesQuery = useQuery({
    queryKey: queryKeys.audit.rbacRoles(filters),
    queryFn: () => getRbacRoles(filters),
    enabled: canRead,
  })

  const matrixQuery = useQuery({
    queryKey: queryKeys.audit.rbacMatrix(filters),
    queryFn: () => getRbacMatrix(filters),
    enabled: canRead,
  })

  const coverageQuery = useQuery({
    queryKey: queryKeys.audit.rbacCoverage(filters),
    queryFn: () => getRbacCoverage(filters),
    enabled: canRead,
  })

  const routeCoverageQuery = useQuery({
    queryKey: queryKeys.audit.rbacRouteCoverage(filters),
    queryFn: () => getRbacRouteCoverage(filters),
    enabled: canRead,
  })

  if (!canRead) {
    return <PermissionDeniedInline message={`Role ${role ?? 'guest'} cannot access RBAC Audit.`} />
  }

  const summary = summaryQuery.data
  const coverage = coverageQuery.data
  const modules = modulesQuery.data ?? []
  const roles = rolesQuery.data ?? []
  const matrixRows = matrixQuery.data ?? []
  const routeCoverageRows = routeCoverageQuery.data ?? []
  const issues = coverage?.issues ?? []

  const refreshAll = () => {
    void modulesQuery.refetch()
    void summaryQuery.refetch()
    void rolesQuery.refetch()
    void matrixQuery.refetch()
    void coverageQuery.refetch()
    void routeCoverageQuery.refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F12</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">RBAC Audit</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Backend-connected permission, role, route coverage, and RBAC issue review screen using safe /rbac-audit sub-routes.
          </p>
        </div>
        <Button variant="outline" onClick={refreshAll} disabled={summaryQuery.isFetching || coverageQuery.isFetching}>
          <RefreshCw className="h-4 w-4" />
          Refresh RBAC
        </Button>
      </div>

      <RbacAuditToolbar
        filters={filters}
        modules={modules}
        onChange={setFilters}
        onRefresh={refreshAll}
        isLoading={modulesQuery.isFetching || coverageQuery.isFetching}
      />

      {summaryQuery.isLoading ? (
        <LoadingState title="Loading RBAC summary" />
      ) : summaryQuery.isError ? (
        <ApiErrorState error={summaryQuery.error} onRetry={() => void summaryQuery.refetch()} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-5">
              <ShieldCheck className="h-10 w-10 rounded-2xl bg-primary/10 p-2 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coverage Status</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{statusLabel(summary?.coverageStatus)}</p>
                <p className="text-xs text-muted-foreground">Generated {formatDateTime(summary?.generatedAt)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-5">
              <ShieldAlert className="h-10 w-10 rounded-2xl bg-primary/10 p-2 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Permissions</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{summary?.permissionCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Across {summary?.moduleCount ?? 0} modules</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-5">
              <TriangleAlert className="h-10 w-10 rounded-2xl bg-destructive/10 p-2 text-destructive" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Critical Issues</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{summary?.criticalIssueCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Warnings {summary?.warningIssueCount ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-5">
              <CheckCircle2 className="h-10 w-10 rounded-2xl bg-emerald-500/10 p-2 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Routes Covered</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{coverage?.coveredRoutes ?? 0}</p>
                <p className="text-xs text-muted-foreground">Partial {coverage?.partialRoutes ?? 0} / Uncovered {coverage?.uncoveredRoutes ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Role Summary</CardTitle>
            <CardDescription>Permission count and high-risk coverage by role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rolesQuery.isLoading ? (
              <LoadingState title="Loading roles" />
            ) : rolesQuery.isError ? (
              <ApiErrorState error={rolesQuery.error} onRetry={() => void rolesQuery.refetch()} />
            ) : roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No role summary returned.</p>
            ) : (
              roles.map((item) => (
                <div key={item.role} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{item.role ? toTitleCase(item.role) : 'Unknown role'}</p>
                      <p className="text-sm text-muted-foreground">{item.totalPermissions ?? 0} permissions · {item.moduleCount ?? 0} modules</p>
                    </div>
                    <Badge variant={(item.highRiskPermissions ?? 0) > 0 ? 'warning' : 'success'}>{item.highRiskPermissions ?? 0} high risk</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage Issues</CardTitle>
            <CardDescription>Backend generated RBAC findings and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {coverageQuery.isLoading ? (
              <LoadingState title="Loading coverage issues" />
            ) : coverageQuery.isError ? (
              <ApiErrorState error={coverageQuery.error} onRetry={() => void coverageQuery.refetch()} />
            ) : issues.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">No RBAC issues returned for current filters.</p>
            ) : (
              issues.slice(0, 8).map((issue, index) => (
                <div key={`${issue.type}-${issue.permission}-${index}`} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getIssueBadgeVariant(issue.severity)}>{issue.severity ? toTitleCase(issue.severity) : 'Info'}</Badge>
                    <Badge variant="muted">{issue.type ? toTitleCase(issue.type) : 'Issue'}</Badge>
                    {issue.moduleKey && <Badge variant="muted">{issue.moduleKey}</Badge>}
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{issue.message ?? 'No issue message.'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{issue.recommendation ?? 'No recommendation provided.'}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Coverage</CardTitle>
          <CardDescription>Checks route permission coverage from /rbac-audit/route-coverage.</CardDescription>
        </CardHeader>
        <CardContent>
          {routeCoverageQuery.isLoading ? (
            <LoadingState title="Loading route coverage" />
          ) : routeCoverageQuery.isError ? (
            <ApiErrorState error={routeCoverageQuery.error} onRetry={() => void routeCoverageQuery.refetch()} />
          ) : (
            <SimpleDataTable
              records={routeCoverageRows}
              columns={routeCoverageColumns}
              getRowKey={(record) => `${record.routePath ?? record.moduleKey}`}
              emptyMessage="No route coverage rows returned."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix Preview</CardTitle>
          <CardDescription>First 50 rows from /rbac-audit/matrix. Full export can be added later.</CardDescription>
        </CardHeader>
        <CardContent>
          {matrixQuery.isLoading ? (
            <LoadingState title="Loading permission matrix" />
          ) : matrixQuery.isError ? (
            <ApiErrorState error={matrixQuery.error} onRetry={() => void matrixQuery.refetch()} />
          ) : (
            <SimpleDataTable
              records={matrixRows.slice(0, 50)}
              columns={matrixColumns}
              getRowKey={(record) => record.permission ?? `${record.moduleKey}-${record.action}`}
              emptyMessage="No matrix rows returned."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
