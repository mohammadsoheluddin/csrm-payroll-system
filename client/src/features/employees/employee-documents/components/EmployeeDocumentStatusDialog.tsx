import { ArchiveRestore, ShieldCheck, Trash2, X, XCircle } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { EmployeeDocumentRecord } from '@/features/employees/employee-documents/types/employeeDocument.types'
import {
  getEmployeeDocumentCategoryLabel,
  getEmployeeDocumentId,
  getEmployeeDocumentStatusLabel,
  getEmployeeDocumentStatusVariant,
} from '@/features/employees/employee-documents/utils/employeeDocument.utils'

export type EmployeeDocumentDialogAction = 'verify' | 'reject' | 'delete' | 'restore'

export type EmployeeDocumentStatusDialogState = {
  action: EmployeeDocumentDialogAction
  document: EmployeeDocumentRecord
} | null

const actionMeta: Record<
  EmployeeDocumentDialogAction,
  {
    title: string
    label: string
    helper: string
    defaultText: string
    buttonLabel: string
    icon: typeof ShieldCheck
    variant: 'primary' | 'danger' | 'outline'
  }
> = {
  verify: {
    title: 'Verify document',
    label: 'Verification remarks',
    helper: 'Add a short HR verification note before marking this document as verified.',
    defaultText: 'Document checked and verified by HR.',
    buttonLabel: 'Verify Document',
    icon: ShieldCheck,
    variant: 'primary',
  },
  reject: {
    title: 'Reject document',
    label: 'Rejection reason',
    helper: 'Mention why the uploaded document is not acceptable. This reason will remain in the document record.',
    defaultText: 'Document is unclear or incomplete.',
    buttonLabel: 'Reject Document',
    icon: XCircle,
    variant: 'danger',
  },
  delete: {
    title: 'Soft delete document',
    label: 'Delete reason',
    helper: 'Soft delete keeps the document record recoverable in the deleted archive.',
    defaultText: 'Deleted from employee document UI.',
    buttonLabel: 'Soft Delete',
    icon: Trash2,
    variant: 'danger',
  },
  restore: {
    title: 'Restore document',
    label: 'Restore reason',
    helper: 'Restore brings this document back to active document records.',
    defaultText: 'Restored from employee document UI.',
    buttonLabel: 'Restore Document',
    icon: ArchiveRestore,
    variant: 'primary',
  },
}

const EmployeeDocumentStatusDialogContent = ({
  state,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  state: Exclude<EmployeeDocumentStatusDialogState, null>
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (state: Exclude<EmployeeDocumentStatusDialogState, null>, note: string) => void
}) => {
  const meta = actionMeta[state.action]
  const Icon = meta.icon
  const documentId = getEmployeeDocumentId(state.document)
  const [note, setNote] = useState(meta.defaultText)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close document action dialog overlay"
        className="absolute inset-0 bg-background/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/40 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Employee Document Action</p>
              <h3 className="mt-1 text-lg font-bold text-foreground">{meta.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{meta.helper}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{getEmployeeDocumentCategoryLabel(state.document.category)}</Badge>
              <Badge variant={getEmployeeDocumentStatusVariant(state.document.status)}>
                {getEmployeeDocumentStatusLabel(state.document.status)}
              </Badge>
              {documentId && <Badge variant="muted">ID: {documentId.slice(-8)}</Badge>}
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{state.document.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{state.document.originalFileName || state.document.fileName}</p>
          </div>

          <label className="space-y-2 text-sm font-medium text-foreground">
            {meta.label}
            <textarea
              className="min-h-28 w-full rounded-2xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
              value={note}
              disabled={isSubmitting}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={meta.variant}
              disabled={isSubmitting || (state.action === 'reject' && !note.trim())}
              onClick={() => onConfirm(state, note.trim())}
            >
              <Icon className="h-4 w-4" />
              {isSubmitting ? 'Processing...' : meta.buttonLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const EmployeeDocumentStatusDialog = ({
  state,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  state: EmployeeDocumentStatusDialogState
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (state: Exclude<EmployeeDocumentStatusDialogState, null>, note: string) => void
}) => {
  if (!state) {
    return null
  }

  return (
    <EmployeeDocumentStatusDialogContent
      key={`${state.action}-${getEmployeeDocumentId(state.document)}`}
      state={state}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  )
}
