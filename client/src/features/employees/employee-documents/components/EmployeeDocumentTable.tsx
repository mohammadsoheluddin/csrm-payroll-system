import { ArchiveRestore, Download, FileText, RefreshCcw, ShieldCheck, Trash2, XCircle } from 'lucide-react'

import { SimpleDataTable } from '@/components/data-table/SimpleDataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type {
  EmployeeDocumentListMode,
  EmployeeDocumentRecord,
} from '@/features/employees/employee-documents/types/employeeDocument.types'
import {
  formatFileSize,
  getEmployeeDocumentCategoryLabel,
  getEmployeeDocumentConfidentialityLabel,
  getEmployeeDocumentConfidentialityVariant,
  getEmployeeDocumentId,
  getEmployeeDocumentStatusLabel,
  getEmployeeDocumentStatusVariant,
  hasEmployeeDocumentExpired,
} from '@/features/employees/employee-documents/utils/employeeDocument.utils'
import { getEmployeeReferenceLabel } from '@/features/employees/utils/employee.utils'

type EmployeeDocumentTableProps = {
  records: EmployeeDocumentRecord[]
  mode: EmployeeDocumentListMode
  canManage: boolean
  canVerify: boolean
  canDelete: boolean
  isMutating: boolean
  onDownload: (document: EmployeeDocumentRecord) => void
  onVerify: (document: EmployeeDocumentRecord) => void
  onReject: (document: EmployeeDocumentRecord) => void
  onDelete: (document: EmployeeDocumentRecord) => void
  onRestore: (document: EmployeeDocumentRecord) => void
}

const formatDate = (value?: string | Date | null) => {
  if (!value) {
    return '—'
  }

  return String(value).slice(0, 10)
}

export const EmployeeDocumentTable = ({
  records,
  mode,
  canManage,
  canVerify,
  canDelete,
  isMutating,
  onDownload,
  onVerify,
  onReject,
  onDelete,
  onRestore,
}: EmployeeDocumentTableProps) => {
  return (
    <SimpleDataTable<EmployeeDocumentRecord>
      records={records}
      getRowKey={getEmployeeDocumentId}
      emptyMessage={mode === 'deleted' ? 'No deleted employee documents found.' : 'No employee documents found.'}
      actionsColumnClassName="min-w-[26rem] lg:min-w-[30rem]"
      columns={[
        {
          key: 'title',
          label: 'Document',
          render: (document) => (
            <div className="min-w-[16rem]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="font-semibold text-foreground">{document.title}</p>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{document.originalFileName || document.fileName}</p>
            </div>
          ),
        },
        {
          key: 'employee',
          label: 'Employee',
          render: (document) => <span>{getEmployeeReferenceLabel(document.employee)}</span>,
        },
        {
          key: 'category',
          label: 'Category',
          render: (document) => <Badge variant="muted">{getEmployeeDocumentCategoryLabel(document.category)}</Badge>,
        },
        {
          key: 'status',
          label: 'Status',
          render: (document) => (
            <Badge variant={getEmployeeDocumentStatusVariant(document.status)}>
              {getEmployeeDocumentStatusLabel(document.status)}
            </Badge>
          ),
        },
        {
          key: 'confidentiality',
          label: 'Confidentiality',
          render: (document) => (
            <Badge variant={getEmployeeDocumentConfidentialityVariant(document.confidentiality)}>
              {getEmployeeDocumentConfidentialityLabel(document.confidentiality)}
            </Badge>
          ),
        },
        {
          key: 'documentNo',
          label: 'Doc No',
          render: (document) => <span>{document.documentNo || '—'}</span>,
        },
        {
          key: 'expiryDate',
          label: 'Expiry',
          render: (document) => (
            <div>
              <span>{formatDate(document.expiryDate)}</span>
              {hasEmployeeDocumentExpired(document.expiryDate) && (
                <p className="mt-1 text-xs font-semibold text-destructive">Expired</p>
              )}
            </div>
          ),
        },
        {
          key: 'fileSize',
          label: 'Size',
          render: (document) => <span>{formatFileSize(document.fileSize)}</span>,
        },
      ]}
      actions={(document) => (
        <div className="flex min-w-max flex-nowrap items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => onDownload(document)}>
            <Download className="h-4 w-4" />
            Download
          </Button>

          {mode === 'active' && canVerify && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={isMutating || document.status === 'verified'}
                onClick={() => onVerify(document)}
              >
                <ShieldCheck className="h-4 w-4" />
                Verify
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={isMutating || document.status === 'rejected'}
                onClick={() => onReject(document)}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}

          {mode === 'active' && canDelete && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="shrink-0"
              disabled={isMutating}
              onClick={() => onDelete(document)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}

          {mode === 'deleted' && canDelete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={isMutating}
              onClick={() => onRestore(document)}
            >
              <ArchiveRestore className="h-4 w-4" />
              Restore
            </Button>
          )}

          {canManage && mode === 'active' && (
            <Button type="button" variant="ghost" size="sm" className="shrink-0" disabled>
              <RefreshCcw className="h-4 w-4" />
              Edit later
            </Button>
          )}
        </div>
      )}
    />
  )
}
