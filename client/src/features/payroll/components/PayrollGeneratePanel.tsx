import { useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'

import { FormErrorSummary } from '@/components/feedback/FormErrorSummary'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { PayrollGeneratePayload, PayrollPeriodQuery } from '@/features/payroll/types/payroll.types'
import { normalizeApiError } from '@/lib/api/apiError'

type PayrollGeneratePanelProps = {
  title: string
  description: string
  filters: PayrollPeriodQuery
  onGenerate: (payload: PayrollGeneratePayload) => void
  isPending?: boolean
  error?: unknown
  requiresCompany?: boolean
  supportsCashFallback?: boolean
}

export const PayrollGeneratePanel = ({
  title,
  description,
  filters,
  onGenerate,
  isPending,
  error,
  requiresCompany = true,
  supportsCashFallback = false,
}: PayrollGeneratePanelProps) => {
  const [overwrite, setOverwrite] = useState(false)
  const [allowCashFallback, setAllowCashFallback] = useState(true)
  const [remarks, setRemarks] = useState('')

  const canGenerate = Boolean(filters.month && filters.year && (!requiresCompany || filters.company))
  const normalizedError = error ? normalizeApiError(error) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {normalizedError && <FormErrorSummary errors={{}} serverError={normalizedError.message} />}

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm">
            <input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} />
            Overwrite existing draft records
          </label>

          {supportsCashFallback && (
            <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={allowCashFallback}
                onChange={(event) => setAllowCashFallback(event.target.checked)}
              />
              Allow fallback cash payment info
            </label>
          )}
        </div>

        <textarea
          className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="Optional generation remarks"
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() =>
              onGenerate({
                ...filters,
                overwrite,
                ...(supportsCashFallback ? { allowCashFallback } : {}),
                remarks,
              })
            }
            disabled={!canGenerate || isPending}
          >
            <Play className="h-4 w-4" />
            {isPending ? 'Generating...' : 'Generate'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setOverwrite(false)
              setAllowCashFallback(true)
              setRemarks('')
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Options
          </Button>
        </div>

        {!canGenerate && (
          <p className="text-xs text-muted-foreground">
            Month, year, and company are required before generation. Additional branch/department/employee filters are optional.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
