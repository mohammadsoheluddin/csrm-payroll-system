import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, ArchiveRestore, Edit3, ShieldCheck, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { SimpleDataTable } from '@/components/data-table/SimpleDataTable'
import { ApiErrorState } from '@/components/feedback/ApiErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PermissionDeniedInline } from '@/components/feedback/PermissionDeniedInline'
import { Can } from '@/components/guards/Can'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  createMasterDataRecord,
  deleteMasterDataRecord,
  getMasterDataRecords,
  restoreMasterDataRecord,
  updateMasterDataRecord,
} from '@/features/master-data/api/masterData.api'
import { MasterDataFormPanel } from '@/features/master-data/components/MasterDataFormPanel'
import { MasterDataStatCards } from '@/features/master-data/components/MasterDataStatCards'
import { MasterDataToolbar } from '@/features/master-data/components/MasterDataToolbar'
import type {
  MasterDataListMode,
  MasterDataModuleConfig,
  MasterDataMutationPayload,
  MasterDataQueryParams,
  MasterDataRecord,
} from '@/features/master-data/types/masterData.types'
import { normalizeApiError } from '@/lib/api/apiError'
import { getRecordDisplayName, getRecordId, getRecordValueByPath, getReferenceLabel } from '@/lib/format/record.utils'
import { queryKeys } from '@/lib/query/queryKeys'
import { useAuthStore } from '@/stores/auth.store'

export type MasterDataFoundationPageProps = {
  module: MasterDataModuleConfig
}

const matchesSearch = (record: MasterDataRecord, fields: string[], searchText: string) => {
  const normalizedSearch = searchText.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  return fields.some((field) => {
    const value = getRecordValueByPath(record, field)
    const label = typeof value === 'object' ? getReferenceLabel(value) : String(value ?? '')
    return label.toLowerCase().includes(normalizedSearch)
  })
}


const toServerFieldErrors = (error: unknown) => {
  const normalized = normalizeApiError(error)

  const fieldErrors = normalized.errorSources.reduce<Record<string, string>>((accumulator, source) => {
    const normalizedPath = source.path.replace(/^body\./, '').replace(/^query\./, '')
    const fieldName = normalizedPath.split('.')[0]

    if (fieldName) {
      accumulator[fieldName] = source.message
    }

    return accumulator
  }, {})

  return {
    message: normalized.message,
    fieldErrors,
  }
}

export const MasterDataFoundationPage = ({ module }: MasterDataFoundationPageProps) => {
  const queryClient = useQueryClient()
  const canAccess = useAuthStore((state) => state.canAccess)
  const [mode, setMode] = useState<MasterDataListMode>('active')
  const [searchText, setSearchText] = useState('')
  const [queryParams, setQueryParams] = useState<MasterDataQueryParams>({})
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [selectedRecord, setSelectedRecord] = useState<MasterDataRecord | null>(null)
  const [serverFormError, setServerFormError] = useState<string | null>(null)
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({})

  const canManage = canAccess(module.managePermission ? [module.managePermission] : [])
  const queryKey = queryKeys.masterData.module(module.key, mode, queryParams)

  const listQuery = useQuery({
    queryKey,
    queryFn: () => getMasterDataRecords({ module, mode, params: queryParams }),
  })

  const records = useMemo(() => {
    return (listQuery.data ?? []).filter((record) => matchesSearch(record, module.searchableFields, searchText))
  }, [listQuery.data, module.searchableFields, searchText])

  const invalidateCurrentModule = async () => {
    await queryClient.invalidateQueries({ queryKey: ['master-data', module.key] })
  }

  const clearFormErrors = () => {
    setServerFormError(null)
    setServerFieldErrors({})
  }

  const createMutation = useMutation({
    mutationFn: (payload: MasterDataMutationPayload) => createMasterDataRecord({ module, payload }),
    onSuccess: async () => {
      toast.success(`${module.entityLabel} created successfully`)
      setFormMode('closed')
      setSelectedRecord(null)
      clearFormErrors()
      await invalidateCurrentModule()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      const formError = toServerFieldErrors(error)
      setServerFormError(formError.message)
      setServerFieldErrors(formError.fieldErrors)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MasterDataMutationPayload }) =>
      updateMasterDataRecord({ module, id, payload }),
    onSuccess: async () => {
      toast.success(`${module.entityLabel} updated successfully`)
      setFormMode('closed')
      setSelectedRecord(null)
      clearFormErrors()
      await invalidateCurrentModule()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      const formError = toServerFieldErrors(error)
      setServerFormError(formError.message)
      setServerFieldErrors(formError.fieldErrors)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (record: MasterDataRecord) =>
      deleteMasterDataRecord({
        module,
        id: getRecordId(record),
        deleteReason: `Deleted from ${module.shortTitle} frontend foundation screen`,
      }),
    onSuccess: async () => {
      toast.success(`${module.entityLabel} deleted successfully`)
      await invalidateCurrentModule()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (record: MasterDataRecord) =>
      restoreMasterDataRecord({
        module,
        id: getRecordId(record),
        restoreReason: `Restored from ${module.shortTitle} frontend foundation screen`,
      }),
    onSuccess: async () => {
      toast.success(`${module.entityLabel} restored successfully`)
      await invalidateCurrentModule()
    },
    onError: (error) => {
      const normalized = normalizeApiError(error)
      toast.error(normalized.message, { description: normalized.title })
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (payload: MasterDataMutationPayload) => {
    clearFormErrors()
    if (formMode === 'edit' && selectedRecord) {
      updateMutation.mutate({ id: getRecordId(selectedRecord), payload })
      return
    }

    createMutation.mutate(payload)
  }

  const openCreateForm = () => {
    setSelectedRecord(null)
    clearFormErrors()
    setFormMode('create')
  }

  const openEditForm = (record: MasterDataRecord) => {
    setSelectedRecord(record)
    clearFormErrors()
    setFormMode('edit')
  }

  const changeMode = (nextMode: MasterDataListMode) => {
    setMode(nextMode)
    setFormMode('closed')
    setSelectedRecord(null)
    clearFormErrors()
  }

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-muted/40 px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Part-F7.1 integration fixed</Badge>
                <Badge variant="muted">{module.sectionLabel}</Badge>
                <Badge variant="default">API: {module.apiPath}</Badge>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{module.title}</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">{module.description}</p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground xl:w-[320px]">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Permission status
              </div>
              <p className="mt-2 leading-6">
                Read: <span className="font-semibold text-foreground">{module.readPermission}</span>
              </p>
              <p className="leading-6">
                Manage: <span className="font-semibold text-foreground">{module.managePermission ?? 'No manage permission'}</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <MasterDataStatCards records={records} canManage={canManage} supportsRestore={module.supportsRestore} />

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={mode === 'active' ? 'primary' : 'outline'} size="sm" onClick={() => changeMode('active')}>
          Active records
        </Button>
        {module.supportsDeletedView && (
          <Button type="button" variant={mode === 'deleted' ? 'primary' : 'outline'} size="sm" onClick={() => changeMode('deleted')}>
            <Archive className="h-4 w-4" />
            Deleted records
          </Button>
        )}
      </div>

      <MasterDataToolbar
        module={module}
        searchText={searchText}
        queryParams={queryParams}
        onSearchTextChange={setSearchText}
        onQueryParamsChange={setQueryParams}
        onCreate={openCreateForm}
        onRefresh={() => void listQuery.refetch()}
        canManage={canManage && mode === 'active'}
        isRefreshing={listQuery.isFetching}
      />

      {!canManage && (
        <PermissionDeniedInline
          title="Read-only master data access"
          message="You can view this setup screen, but create, edit, delete, and restore actions are hidden without the manage permission."
        />
      )}

      {formMode !== 'closed' && canManage && mode === 'active' && (
        <MasterDataFormPanel
          key={`${formMode}-${selectedRecord ? getRecordId(selectedRecord) : 'new'}`}
          module={module}
          record={selectedRecord}
          isSubmitting={isSubmitting}
          serverError={serverFormError}
          serverFieldErrors={serverFieldErrors}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormMode('closed')
            setSelectedRecord(null)
            clearFormErrors()
          }}
        />
      )}

      {listQuery.isLoading ? (
        <LoadingState title={`Loading ${module.entityLabelPlural}`} message="Please wait while the frontend fetches backend master data." />
      ) : listQuery.isError ? (
        <ApiErrorState error={listQuery.error} onRetry={() => void listQuery.refetch()} />
      ) : (
        <SimpleDataTable
          records={records}
          columns={module.tableColumns}
          getRowKey={getRecordId}
          emptyMessage={`No ${module.entityLabelPlural.toLowerCase()} found for the selected filters.`}
          actions={(record) => (
            <div className="flex justify-end gap-2">
              {mode === 'active' && (
                <Can permissions={module.managePermission ? [module.managePermission] : []}>
                  <Button type="button" variant="outline" size="sm" onClick={() => openEditForm(record)}>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (window.confirm(`Delete ${getRecordDisplayName(record)}?`)) {
                        deleteMutation.mutate(record)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </Can>
              )}

              {mode === 'deleted' && module.supportsRestore && (
                <Can permissions={module.managePermission ? [module.managePermission] : []}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={restoreMutation.isPending}
                    onClick={() => restoreMutation.mutate(record)}
                  >
                    <ArchiveRestore className="h-4 w-4" />
                    Restore
                  </Button>
                </Can>
              )}
            </div>
          )}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Part-F7.1 integration note</CardTitle>
          <CardDescription>
            These screens now include the first backend integration fix pass for dependent lookups, server validation display, and safer form/mode behavior.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="font-semibold text-foreground">CRUD foundation</p>
            <p className="mt-1">Create, edit, soft-delete, restore, and list behavior is wired where backend supports it, with safer validation feedback.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="font-semibold text-foreground">Permission guard</p>
            <p className="mt-1">Read and manage actions are controlled by the existing frontend RBAC permission layer.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="font-semibold text-foreground">Design lock</p>
            <p className="mt-1">The layout follows the Part-F4.1 premium ERP UI reference standard.</p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
