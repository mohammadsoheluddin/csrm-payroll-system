import { X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

type PayrollActionDialogProps = {
  title: string
  description: string
  note: string
  onNoteChange: (note: string) => void
  onCancel: () => void
  onConfirm: () => void
  confirmLabel: string
  isPending?: boolean
  variant?: 'primary' | 'danger'
}

export const PayrollActionDialog = ({
  title,
  description,
  note,
  onNoteChange,
  onCancel,
  onConfirm,
  confirmLabel,
  isPending,
  variant = 'primary',
}: PayrollActionDialogProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="Optional note / reason"
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={isPending}>
              {isPending ? 'Working...' : confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
