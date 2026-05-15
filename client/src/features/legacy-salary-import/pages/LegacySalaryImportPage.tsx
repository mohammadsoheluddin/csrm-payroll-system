import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, FileSpreadsheet, History, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { PERMISSIONS } from '@/config/permissions'
import {
  commitLegacySalaryImport,
  deleteLegacySalaryImportBatch,
  downloadLegacySalaryRecords,
  downloadLegacySalaryTemplate,
  getLegacySalaryImportBatches,
  getLegacySalaryRecords,
  getLegacySalarySummary,
  parseLegacySalaryExcel,
  previewLegacySalaryImport,
  restoreLegacySalaryImportBatch,
} from '@/features/legacy-salary-import/api/legacySalaryImport.api'
import { LegacySalaryArchivePanel } from '@/features/legacy-salary-import/components/LegacySalaryArchivePanel'
import { LegacySalaryFiltersPanel } from '@/features/legacy-salary-import/components/LegacySalaryFiltersPanel'
import { LegacySalaryPreviewPanel } from '@/features/legacy-salary-import/components/LegacySalaryPreviewPanel'
import { LegacySalaryRecordsPanel } from '@/features/legacy-salary-import/components/LegacySalaryRecordsPanel'
import { LegacySalaryUploadPanel } from '@/features/legacy-salary-import/components/LegacySalaryUploadPanel'
import type {
  LegacySalaryBatch,
  LegacySalaryExportType,
  LegacySalaryImportPayload,
  LegacySalaryListMode,
  LegacySalaryMatchBy,
  LegacySalaryParsedResult,
  LegacySalaryParseOptions,
  LegacySalaryPreviewResult,
} from '@/features/legacy-salary-import/types/legacySalaryImport.types'
import {
  buildLegacySalaryPayload,
  fileToBase64,
  formatLegacyDate,
  formatMoney,
  getBatchDisplayName,
  getBatchFileInfo,
  getLegacySalaryRecordId,
  legacySalaryDefaultFilters,
  legacySalaryDefaultParseOptions,
  parsedRowsToImportRows,
  totalsToMetrics,
} from '@/features/legacy-salary-import/utils/legacySalaryImport.utils'
import { usePayrollLookups } from '@/features/payroll/hooks/usePayrollLookups'
import { queryKeys } from '@/lib/query/queryKeys'
import { useApiMutation } from '@/lib/query/useApiMutation'
import { useAuthStore } from '@/stores/auth.store'

const tabItems = [
  { key: 'upload', label: 'Upload & Preview', icon: FileSpreadsheet },
  { key: 'archive', label: 'Archive Batches', icon: Archive },
  { key: 'records', label: 'Records & Summary', icon: History },
] as const

type LegacySalaryTab = (typeof tabItems)[number]['key']

export const LegacySalaryImportPage = () => {
  const queryClient = useQueryClient()
  const canAccess = useAuthStore((state) => state.canAccess)
  const role = useAuthStore((state) => state.user?.role)
  const canRead = canAccess([PERMISSIONS.LEGACY_SALARY_IMPORT_READ])
  const canProcess = canAccess([PERMISSIONS.LEGACY_SALARY_IMPORT_PROCESS])
  const canExport = canAccess([PERMISSIONS.LEGACY_SALARY_IMPORT_EXPORT])
  const canDelete = canAccess([PERMISSIONS.LEGACY_SALARY_IMPORT_DELETE])

  const [activeTab, setActiveTab] = useState<LegacySalaryTab>('upload')
  const [filters, setFilters] = useState(legacySalaryDefaultFilters)
  const [archiveMode, setArchiveMode] = useState<LegacySalaryListMode>('active')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedResult, setParsedResult] = useState<LegacySalaryParsedResult | null>(null)
  const [parseOptions, setParseOptions] = useState<LegacySalaryParseOptions>(legacySalaryDefaultParseOptions)
  const [previewResult, setPreviewResult] = useState<LegacySalaryPreviewResult | null>(null)
  const [pendingPayload, setPendingPayload] = useState<LegacySalaryImportPayload | null>(null)
  const [manualRowsJson, setManualRowsJson] = useState('')
  const [matchBy, setMatchBy] = useState<LegacySalaryMatchBy>('employeeId')
  const [remarks, setRemarks] = useState('')
  const [selectedBatch, setSelectedBatch] = useState<LegacySalaryBatch | null>(null)

  const lookups = usePayrollLookups({ enabled: canRead })

  const batchesQuery = useQuery({
    queryKey: queryKeys.legacySalaryImport.batches(archiveMode, filters),
    queryFn: () => getLegacySalaryImportBatches(archiveMode, filters),
    enabled: canRead && activeTab === 'archive',
  })

  const recordsQuery = useQuery({
    queryKey: queryKeys.legacySalaryImport.records(filters),
    queryFn: () => getLegacySalaryRecords(filters),
    enabled: canRead && activeTab === 'records',
  })

  const summaryQuery = useQuery({
    queryKey: queryKeys.legacySalaryImport.summary(filters),
    queryFn: () => getLegacySalarySummary(filters),
    enabled: canRead && activeTab === 'records',
  })

  const invalidateLegacySalaryQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.legacySalaryImport.root })
  }

  const parseMutation = useApiMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error('Please choose an .xlsx salary sheet first.')
      }

      if (!/\.xlsx$/i.test(selectedFile.name)) {
        throw new Error('Only .xlsx legacy salary files are supported. Please save old .xls files as .xlsx first.')
      }

      const fileBase64 = await fileToBase64(selectedFile)
      return parseLegacySalaryExcel({
        fileName: selectedFile.name,
        fileBase64,
        sheetName: parseOptions.sheetName.trim() || undefined,
        headerRow: parseOptions.headerRow.trim() || undefined,
        dataStartRow: parseOptions.dataStartRow.trim() || undefined,
        maxRows: parseOptions.maxRows.trim() || 10000,
      })
    },
    successMessage: 'Excel file parsed successfully',
    onSuccess: (result) => {
      setParsedResult(result)
      setPreviewResult(null)
      setPendingPayload(null)
    },
  })

  const previewMutation = useApiMutation({
    mutationFn: previewLegacySalaryImport,
    successMessage: 'Legacy salary preview generated',
    onSuccess: (result, variables) => {
      setPreviewResult(result)
      setPendingPayload(variables)
    },
  })

  const commitMutation = useApiMutation({
    mutationFn: commitLegacySalaryImport,
    successMessage: 'Legacy salary archive committed successfully',
    onSuccess: async (batch) => {
      setSelectedBatch(batch)
      setActiveTab('archive')
      setPreviewResult(null)
      setPendingPayload(null)
      setParsedResult(null)
      setManualRowsJson('')
      await invalidateLegacySalaryQueries()
    },
  })

  const templateMutation = useApiMutation({
    mutationFn: downloadLegacySalaryTemplate,
    successMessage: 'Template download started',
  })

  const exportMutation = useApiMutation({
    mutationFn: (type: LegacySalaryExportType) => downloadLegacySalaryRecords({ filters, type }),
    successMessage: 'Legacy salary export download started',
  })

  const deleteMutation = useApiMutation({
    mutationFn: deleteLegacySalaryImportBatch,
    successMessage: 'Legacy salary archive batch deleted',
    onSuccess: invalidateLegacySalaryQueries,
  })

  const restoreMutation = useApiMutation({
    mutationFn: restoreLegacySalaryImportBatch,
    successMessage: 'Legacy salary archive batch restored',
    onSuccess: invalidateLegacySalaryQueries,
  })

  const uploadedRows = useMemo(() => parsedRowsToImportRows(parsedResult), [parsedResult])
  const heroMetrics = totalsToMetrics(previewResult?.totals ?? summaryQuery.data?.grandTotal ?? summaryQuery.data?.totals)

  const handlePreview = (payload: LegacySalaryImportPayload) => {
    if (payload.rows.length === 0) {
      toast.error('No rows available for preview', {
        description: 'Parse an Excel file or paste manual JSON rows first.',
      })
      return
    }

    previewMutation.mutate(payload)
  }

  const handleCommit = () => {
    if (!pendingPayload) {
      toast.error('Preview required before commit')
      return
    }

    commitMutation.mutate(pendingPayload)
  }

  const handleParsedRowsQuickPreview = () => {
    const payload = buildLegacySalaryPayload({
      filters,
      rows: uploadedRows,
      sourceFileName: selectedFile?.name ?? parsedResult?.fileName,
      sourceSheetName: parsedResult?.sheetName,
      matchBy,
      remarks,
    })
    handlePreview(payload)
  }

  const handleDeleteBatch = (batch: LegacySalaryBatch) => {
    const id = getLegacySalaryRecordId(batch)
    if (!id) {
      return
    }

    const confirmed = window.confirm(`Soft delete ${batch.batchNo ?? 'this legacy salary batch'}?`)
    if (confirmed) {
      deleteMutation.mutate({ id })
    }
  }

  const handleRestoreBatch = (batch: LegacySalaryBatch) => {
    const id = getLegacySalaryRecordId(batch)
    if (id) {
      restoreMutation.mutate({ id })
    }
  }

  if (!canRead) {
    return <PermissionDeniedInline message={`Role ${role ?? 'guest'} cannot access Legacy Salary Import.`} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Part-F16 • B52 Connected</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Legacy Salary Sheet Import</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Upload salary sheets from the current/old payroll software, archive them as external historical data, then search, summarize, and export them without mixing into native payroll calculations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">External Archive</Badge>
          <Badge variant="success">Native Payroll Safe</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {heroMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabItems.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? 'primary' : 'outline'}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Imported data is stored separately from generated payroll.
          </div>
        </CardContent>
      </Card>

      <LegacySalaryFiltersPanel
        filters={filters}
        onChange={setFilters}
        companyOptions={lookups.companyOptions}
        onRefresh={() => {
          void batchesQuery.refetch()
          void recordsQuery.refetch()
          void summaryQuery.refetch()
        }}
        isLoading={lookups.isLoading || batchesQuery.isFetching || recordsQuery.isFetching || summaryQuery.isFetching}
        showRecordSearch={activeTab === 'records'}
        showGroupBy={activeTab === 'records'}
      />

      {lookups.isError && <ApiErrorState error={lookups.error} onRetry={() => lookups.refetch?.()} />}

      {activeTab === 'upload' && (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <LegacySalaryUploadPanel
            filters={filters}
            selectedFile={selectedFile}
            parsedResult={parsedResult}
            parseOptions={parseOptions}
            manualRowsJson={manualRowsJson}
            matchBy={matchBy}
            remarks={remarks}
            canProcess={canProcess}
            canExport={canExport}
            isParsing={parseMutation.isPending}
            isPreviewing={previewMutation.isPending}
            isDownloadingTemplate={templateMutation.isPending}
            parseError={parseMutation.error}
            previewError={previewMutation.error}
            onFileChange={(file) => {
              if (file && !/\.xlsx$/i.test(file.name)) {
                toast.error('Unsupported Excel format', {
                  description: 'Please open the old .xls file in Excel and save it as .xlsx before importing.',
                })
                setSelectedFile(null)
                return
              }

              setSelectedFile(file)
              setParsedResult(null)
              setPreviewResult(null)
              setPendingPayload(null)
            }}
            onParseExcel={() => parseMutation.mutate()}
            onPreview={handlePreview}
            onParseOptionsChange={(patch) => setParseOptions((current) => ({ ...current, ...patch }))}
            onManualRowsJsonChange={setManualRowsJson}
            onMatchByChange={setMatchBy}
            onRemarksChange={setRemarks}
            onDownloadTemplate={(type) => templateMutation.mutate(type)}
          />
          <LegacySalaryPreviewPanel
            preview={previewResult}
            pendingPayload={pendingPayload}
            isCommitting={commitMutation.isPending}
            canCommit={canProcess}
            onCommit={handleCommit}
          />
          {parsedResult && !previewResult && uploadedRows.length > 0 && (
            <div className="xl:col-span-2">
              <Card>
                <CardContent className="flex flex-col gap-3 pt-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Parsed rows are ready for preview</p>
                    <p className="text-xs text-muted-foreground">
                      {uploadedRows.length} mapped rows from {parsedResult.fileName}. Review preview before committing.
                    </p>
                  </div>
                  <Button onClick={handleParsedRowsQuickPreview} disabled={!canProcess || previewMutation.isPending}>
                    Preview Parsed Rows
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'archive' && (
        <>
          <LegacySalaryArchivePanel
            mode={archiveMode}
            onModeChange={setArchiveMode}
            batches={batchesQuery.data?.data ?? []}
            meta={batchesQuery.data?.meta}
            isLoading={batchesQuery.isLoading}
            error={batchesQuery.error}
            canDelete={canDelete}
            canProcess={canProcess}
            deletingId={deleteMutation.variables?.id}
            restoringId={restoreMutation.variables?.id}
            onRetry={() => void batchesQuery.refetch()}
            onView={setSelectedBatch}
            onDelete={handleDeleteBatch}
            onRestore={handleRestoreBatch}
          />
          {selectedBatch && (
            <Card>
              <CardContent className="grid gap-4 pt-5 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected Batch</p>
                  <p className="mt-1 font-semibold text-foreground">{getBatchDisplayName(selectedBatch)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source File</p>
                  <p className="mt-1 text-sm text-foreground">{getBatchFileInfo(selectedBatch)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Committed At</p>
                  <p className="mt-1 text-sm text-foreground">{formatLegacyDate(selectedBatch.committedAt ?? selectedBatch.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payable</p>
                  <p className="mt-1 text-lg font-bold text-foreground">৳ {formatMoney(selectedBatch.totals?.payableAmount)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === 'records' && (
        <LegacySalaryRecordsPanel
          records={recordsQuery.data?.data ?? []}
          summary={summaryQuery.data}
          isLoading={recordsQuery.isLoading}
          isSummaryLoading={summaryQuery.isLoading}
          error={recordsQuery.error}
          canExport={canExport}
          isExporting={exportMutation.isPending}
          onRetry={() => void recordsQuery.refetch()}
          onExport={(type) => exportMutation.mutate(type)}
        />
      )}
    </div>
  )
}
