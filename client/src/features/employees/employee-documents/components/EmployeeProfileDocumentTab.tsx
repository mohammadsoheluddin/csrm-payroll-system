import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, FileText, FolderOpen, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PERMISSIONS } from '@/config/permissions'
import { routePaths } from '@/config/routePaths'
import {
  getEmployeeDocumentSummary,
  getEmployeeDocumentsByEmployee,
} from '@/features/employees/employee-documents/api/employeeDocument.api'
import type { EmployeeDocumentRecord } from '@/features/employees/employee-documents/types/employeeDocument.types'
import {
  getEmployeeDocumentCategoryLabel,
  getEmployeeDocumentExpiryLabel,
  getEmployeeDocumentExpiryVariant,
  getEmployeeDocumentId,
  getEmployeeDocumentStatusLabel,
  getEmployeeDocumentStatusVariant,
} from '@/features/employees/employee-documents/utils/employeeDocument.utils'
import type { EmployeeRecord } from '@/features/employees/types/employee.types'
import { getEmployeeDisplayName, getEmployeeId } from '@/features/employees/utils/employee.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

const sortByLatest = (documents: EmployeeDocumentRecord[]) => {
  return [...documents]
    .sort((left, right) => String(right.updatedAt ?? right.createdAt ?? '').localeCompare(String(left.updatedAt ?? left.createdAt ?? '')))
    .slice(0, 4)
}

export const EmployeeProfileDocumentTab = ({ employee }: { employee: EmployeeRecord }) => {
  const navigate = useNavigate()
  const canAccess = useAuthStore((state) => state.canAccess)
  const canReadDocuments = canAccess([PERMISSIONS.EMPLOYEE_DOCUMENT_READ])
  const employeeId = getEmployeeId(employee)

  const summaryQuery = useQuery({
    queryKey: queryKeys.employeeDocuments.summary(employeeId),
    queryFn: () => getEmployeeDocumentSummary(employeeId),
    enabled: canReadDocuments && Boolean(employeeId),
  })

  const recentDocumentsQuery = useQuery({
    queryKey: queryKeys.employeeDocuments.byEmployee(employeeId, { limit: 4 }),
    queryFn: () => getEmployeeDocumentsByEmployee(employeeId),
    enabled: canReadDocuments && Boolean(employeeId),
  })

  const summary = summaryQuery.data
  const recentDocuments = sortByLatest(recentDocumentsQuery.data ?? [])
  const manageUrl = `${routePaths.employeeDocuments}?employee=${employeeId}`

  if (!canReadDocuments) {
    return (
      <section className="rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <FileText className="h-4 w-4 text-primary" />
          Document Vault
        </div>
        <p className="mt-2">Your current role can view employee profile details but cannot access employee document records.</p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <FileText className="h-4 w-4 text-primary" />
          Document Vault
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => navigate(manageUrl)}>
          <ArrowUpRight className="h-4 w-4" />
          Open Documents
        </Button>
      </div>

      <div className="rounded-3xl border border-border bg-muted/30 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{getEmployeeDisplayName(employee)}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Employee document snapshot is connected to the same document upload screen used by HR. These records are
              document vault records only and do not affect payroll calculation.
            </p>
          </div>
          <Badge variant={summary?.documentProfileReady ? 'success' : 'warning'}>
            {summary?.documentProfileReady ? 'Document Profile Ready' : 'Needs HR Follow-up'}
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Total</p>
            <p className="mt-2 text-xl font-black text-foreground">{summary?.counters.total ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Verified</p>
            <p className="mt-2 text-xl font-black text-foreground">{summary?.counters.verified ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Pending/Rejected</p>
            <p className="mt-2 text-xl font-black text-foreground">
              {(summary?.counters.pending ?? 0) + (summary?.counters.rejected ?? 0)}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {recentDocumentsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading recent documents...</p>}

          {!recentDocumentsQuery.isLoading && recentDocuments.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
              <FolderOpen className="mb-2 h-5 w-5 text-primary" />
              No uploaded document found for this employee yet.
            </div>
          )}

          {recentDocuments.map((document) => (
            <div
              key={getEmployeeDocumentId(document)}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{document.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getEmployeeDocumentCategoryLabel(document.category)} • {document.originalFileName || document.fileName}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Badge variant={getEmployeeDocumentStatusVariant(document.status)}>
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {getEmployeeDocumentStatusLabel(document.status)}
                </Badge>
                <Badge variant={getEmployeeDocumentExpiryVariant(document.expiryDate)}>
                  {getEmployeeDocumentExpiryLabel(document.expiryDate)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
