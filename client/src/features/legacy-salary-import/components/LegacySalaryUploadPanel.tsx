import { FileSpreadsheet, Info, UploadCloud } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type {
  LegacySalaryFilters,
  LegacySalaryImportPayload,
  LegacySalaryMatchBy,
  LegacySalaryParsedResult,
  LegacySalaryParseOptions,
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

const chipClassName =
  'rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground'

export type LegacySalaryUploadPanelProps = {
  filters: LegacySalaryFilters
  selectedFile?: File | null
  parsedResult?: LegacySalaryParsedResult | null
  parseOptions: LegacySalaryParseOptions
  manualRowsJson: string
  matchBy: LegacySalaryMatchBy
  remarks: string
  canProcess?: boolean
  canExport?: boolean
  isParsing?: boolean
  isPreviewing?: boolean
  isDownloadingTemplate?: boolean
  parseError?: unknown
  previewError?: unknown
  onFileChange: (file: File | null) => void
  onParseExcel: () => void
  onPreview: (payload: LegacySalaryImportPayload) => void
  onParseOptionsChange: (patch: Partial<LegacySalaryParseOptions>) => void
  onManualRowsJsonChange: (value: string) => void
  onMatchByChange: (value: LegacySalaryMatchBy) => void
  onRemarksChange: (value: string) => void
  onDownloadTemplate: (type: 'csv' | 'excel') => void
}

export const LegacySalaryUploadPanel = ({
  filters,
  selectedFile,
  parsedResult,
  parseOptions,
  manualRowsJson,
  matchBy,
  remarks,
  canProcess,
  canExport,
  isParsing,
  isPreviewing,
  isDownloadingTemplate,
  parseError,
  previewError,
  onFileChange,
  onParseExcel,
  onPreview,
  onParseOptionsChange,
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
    try {
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
    } catch (error) {
      toast.error('Manual JSON rows are invalid', {
        description: error instanceof Error ? error.message : 'Please provide a valid JSON array.',
      })
    }
  }

  const sampleMappedRows = parsedResult?.rows.slice(0, 3) ?? []

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
          {canExport && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => onDownloadTemplate('excel')} disabled={isDownloadingTemplate}>
                <FileSpreadsheet className="h-4 w-4" />
                Template Excel
              </Button>
              <Button variant="outline" onClick={() => onDownloadTemplate('csv')} disabled={isDownloadingTemplate}>
                Template CSV
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {!canProcess && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <Info className="mt-0.5 h-4 w-4" />
            Your role can read legacy salary archives, but cannot parse, preview, or commit new imported files.
          </div>
        )}

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
              Old .xls files should be saved as .xlsx first. Leave row options blank for auto-detection.
            </span>
            <input className="sr-only" type="file" accept=".xlsx" disabled={!canProcess} onChange={handleFileChange} />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Match By
              <select
                className={inputClassName}
                value={matchBy}
                disabled={!canProcess}
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
                disabled={!canProcess}
                onChange={(event) => onRemarksChange(event.target.value)}
                placeholder="Optional import notes"
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-background/70 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Excel parsing options</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Auto-detect works with CSRM/TSL salary sheets where title rows come before the real header. Override only if preview mapping looks wrong.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sheet Name
              <input
                className={inputClassName}
                value={parseOptions.sheetName}
                disabled={!canProcess}
                onChange={(event) => onParseOptionsChange({ sheetName: event.target.value })}
                placeholder="Auto first sheet"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Header Row
              <input
                className={inputClassName}
                type="number"
                min={1}
                max={100}
                value={parseOptions.headerRow}
                disabled={!canProcess}
                onChange={(event) => onParseOptionsChange({ headerRow: event.target.value })}
                placeholder="Auto"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Data Start Row
              <input
                className={inputClassName}
                type="number"
                min={1}
                max={101}
                value={parseOptions.dataStartRow}
                disabled={!canProcess}
                onChange={(event) => onParseOptionsChange({ dataStartRow: event.target.value })}
                placeholder="Auto"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Max Rows
              <input
                className={inputClassName}
                type="number"
                min={1}
                max={10000}
                value={parseOptions.maxRows}
                disabled={!canProcess}
                onChange={(event) => onParseOptionsChange({ maxRows: event.target.value })}
                placeholder="10000"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onParseExcel} disabled={!canProcess || !selectedFile || isParsing}>
            <UploadCloud className="h-4 w-4" />
            {isParsing ? 'Parsing...' : 'Parse Excel'}
          </Button>
          <Button variant="outline" onClick={handlePreview} disabled={!canProcess || isPreviewing || (!parsedResult && !manualRowsJson.trim())}>
            Preview Import
          </Button>
        </div>

        {parsedResult && (
          <div className="space-y-4 rounded-3xl border border-border bg-muted/30 p-4">
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
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Header Row</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{parsedResult.headerRow}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data Start</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{parsedResult.dataStartRow}</p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mapped Headers</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {parsedResult.mappedHeaders.map((header) => (
                    <span key={header} className={chipClassName}>{header}</span>
                  ))}
                  {parsedResult.mappedHeaders.length === 0 && <span className="text-xs text-muted-foreground">No mapped headers found.</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unmapped Headers</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {parsedResult.unmappedHeaders.slice(0, 12).map((header) => (
                    <span key={header} className={chipClassName}>{header}</span>
                  ))}
                  {parsedResult.unmappedHeaders.length > 12 && (
                    <span className="text-xs text-muted-foreground">+{parsedResult.unmappedHeaders.length - 12} more</span>
                  )}
                  {parsedResult.unmappedHeaders.length === 0 && <span className="text-xs text-muted-foreground">All detected headers are mapped.</span>}
                </div>
              </div>
            </div>

            {parsedResult.notes.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
                {parsedResult.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}

            {sampleMappedRows.length > 0 && (
              <details className="rounded-2xl border border-border bg-background/80 p-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sample mapped payload rows
                </summary>
                <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-muted p-3 text-xs text-foreground">
                  {JSON.stringify(sampleMappedRows.map((row) => row.mappedPayload), null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <details className="rounded-3xl border border-border bg-background/70 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Manual JSON rows for Postman-style testing
          </summary>
          <textarea
            className="mt-3 min-h-44 w-full rounded-2xl border border-input bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            value={manualRowsJson}
            disabled={!canProcess}
            onChange={(event) => onManualRowsJsonChange(event.target.value)}
            placeholder='[{"rowNo":1,"employeeId":"EMP-1001","employeeName":"Example","grossAmount":50000,"netAmount":50000,"payableAmount":50000}]'
          />
        </details>
      </CardContent>
    </Card>
  )
}
