import { FileSpreadsheet, UploadCloud } from 'lucide-react'
import type { ChangeEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type {
  LegacySalaryFilters,
  LegacySalaryImportPayload,
  LegacySalaryMatchBy,
  LegacySalaryParsedResult,
} from '@/features/legacy-salary-import/types/legacySalaryImport.types'
import {
  buildLegacySalaryPayload,
  matchByOptions,
  parseManualRowsJson,
  parsedRowsToImportRows,
} from '@/features/legacy-salary-import/utils/legacySalaryImport.utils'
import { normalizeApiError } from '@/lib/api/apiError'

const inputClassName =
  'min-h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60'

export type LegacySalaryUploadPanelProps = {
  filters: LegacySalaryFilters
  selectedFile?: File | null
  parsedResult?: LegacySalaryParsedResult | null
  manualRowsJson: string
  matchBy: LegacySalaryMatchBy
  remarks: string
  isParsing?: boolean
  isPreviewing?: boolean
  isDownloadingTemplate?: boolean
  parseError?: unknown
  previewError?: unknown
  onFileChange: (file: File | null) => void
  onParseExcel: () => void
  onPreview: (payload: LegacySalaryImportPayload) => void
  onManualRowsJsonChange: (value: string) => void
  onMatchByChange: (value: LegacySalaryMatchBy) => void
  onRemarksChange: (value: string) => void
  onDownloadTemplate: (type: 'csv' | 'excel') => void
}

export const LegacySalaryUploadPanel = ({
  filters,
  selectedFile,
  parsedResult,
  manualRowsJson,
  matchBy,
  remarks,
  isParsing,
  isPreviewing,
  isDownloadingTemplate,
  parseError,
  previewError,
  onFileChange,
  onParseExcel,
  onPreview,
  onManualRowsJsonChange,
  onMatchByChange,
  onRemarksChange,
  onDownloadTemplate,
}: LegacySalaryUploadPanelProps) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files?.[0] ?? null)
  }

  const buildRowsForPreview = () => {
    if (manualRowsJson.trim()) {
      return parseManualRowsJson(manualRowsJson)
    }

    return parsedRowsToImportRows(parsedResult)
  }

  const handlePreview = () => {
    const rows = buildRowsForPreview()
    const payload = buildLegacySalaryPayload({
      filters,
      rows,
      sourceFileName: selectedFile?.name ?? parsedResult?.fileName,
      sourceSheetName: parsedResult?.sheetName,
      matchBy,
      remarks,
    })

    onPreview(payload)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Upload / Parse Legacy Salary Sheet</CardTitle>
            <CardDescription>
              Upload an .xlsx salary sheet from current/old payroll software, review mapped rows, then preview before committing.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onDownloadTemplate('excel')} disabled={isDownloadingTemplate}>
              <FileSpreadsheet className="h-4 w-4" />
              Template Excel
            </Button>
            <Button variant="outline" onClick={() => onDownloadTemplate('csv')} disabled={isDownloadingTemplate}>
              Template CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {Boolean(parseError || previewError) && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {normalizeApiError(parseError ?? previewError).message}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center transition hover:border-primary/60 hover:bg-primary/10">
            <UploadCloud className="h-10 w-10 text-primary" />
            <span className="mt-3 text-sm font-semibold text-foreground">
              {selectedFile ? selectedFile.name : 'Choose .xlsx salary sheet'}
            </span>
            <span className="mt-1 text-xs leading-5 text-muted-foreground">
              Old .xls files should be saved as .xlsx first. Files are parsed only for preview mapping.
            </span>
            <input className="sr-only" type="file" accept=".xlsx" onChange={handleFileChange} />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Match By
              <select
                className={inputClassName}
                value={matchBy}
                onChange={(event) => onMatchByChange(event.target.value as LegacySalaryMatchBy)}
              >
                {matchByOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Remarks
              <textarea
                className={inputClassName}
                rows={3}
                value={remarks}
                onChange={(event) => onRemarksChange(event.target.value)}
                placeholder="Optional import notes"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onParseExcel} disabled={!selectedFile || isParsing}>
            <UploadCloud className="h-4 w-4" />
            {isParsing ? 'Parsing...' : 'Parse Excel'}
          </Button>
          <Button variant="outline" onClick={handlePreview} disabled={isPreviewing || (!parsedResult && !manualRowsJson.trim())}>
            Preview Import
          </Button>
        </div>

        {parsedResult && (
          <div className="rounded-3xl border border-border bg-muted/30 p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sheet</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{parsedResult.sheetName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rows Parsed</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{parsedResult.totalRows}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mapped Headers</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{parsedResult.mappedHeaders.length}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unmapped Headers</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{parsedResult.unmappedHeaders.length}</p>
              </div>
            </div>
            {parsedResult.notes.length > 0 && (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
                {parsedResult.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <details className="rounded-3xl border border-border bg-background/70 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Manual JSON rows for Postman-style testing
          </summary>
          <textarea
            className="mt-3 min-h-44 w-full rounded-2xl border border-input bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={manualRowsJson}
            onChange={(event) => onManualRowsJsonChange(event.target.value)}
            placeholder='[{"rowNo":1,"employeeId":"EMP-1001","employeeName":"Example","grossAmount":50000,"netAmount":50000,"payableAmount":50000}]'
          />
        </details>
      </CardContent>
    </Card>
  )
}
