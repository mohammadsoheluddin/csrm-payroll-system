import { AlertCircle, Save, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { MasterDataFieldRenderer } from '@/features/master-data/components/MasterDataFieldRenderer'
import { useMasterDataOptions } from '@/features/master-data/hooks/useMasterDataOptions'
import type {
  MasterDataModuleConfig,
  MasterDataMutationPayload,
  MasterDataRecord,
} from '@/features/master-data/types/masterData.types'
import { getReferenceId, getRecordDisplayName } from '@/lib/format/record.utils'

export type MasterDataFormPanelProps = {
  module: MasterDataModuleConfig
  record?: MasterDataRecord | null
  isSubmitting?: boolean
  serverError?: string | null
  serverFieldErrors?: Record<string, string>
  onSubmit: (payload: MasterDataMutationPayload) => void
  onCancel: () => void
}

const normalizeRecordForForm = (
  module: MasterDataModuleConfig,
  record?: MasterDataRecord | null,
): MasterDataMutationPayload => {
  if (!record) {
    return { ...module.defaultValues }
  }

  return module.fields.reduce<MasterDataMutationPayload>((accumulator, field) => {
    const value = record[field.name]

    if (field.optionSource) {
      accumulator[field.name] = getReferenceId(value)
      return accumulator
    }

    accumulator[field.name] = value ?? module.defaultValues[field.name] ?? ''
    return accumulator
  }, {})
}

const validateForm = (module: MasterDataModuleConfig, values: MasterDataMutationPayload) => {
  return module.fields.reduce<Record<string, string>>((errors, field) => {
    if (!field.required) {
      return errors
    }

    const value = values[field.name]

    if (value === undefined || value === null || value === '') {
      errors[field.name] = `${field.label} is required.`
    }

    return errors
  }, {})
}

const isFieldDisabled = (fieldName: string, values: MasterDataMutationPayload) => {
  if (fieldName !== 'majorDepartment') {
    return false
  }

  return !values.company
}

export const MasterDataFormPanel = ({
  module,
  record,
  isSubmitting = false,
  serverError = null,
  serverFieldErrors = {},
  onSubmit,
  onCancel,
}: MasterDataFormPanelProps) => {
  const [values, setValues] = useState<MasterDataMutationPayload>(() => normalizeRecordForForm(module, record))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { getFieldOptions } = useMasterDataOptions()

  const isEditMode = Boolean(record)

  const heading = useMemo(() => {
    return isEditMode ? `Edit ${getRecordDisplayName(record ?? {})}` : `Create ${module.entityLabel}`
  }, [isEditMode, module.entityLabel, record])

  const handleValueChange = (name: string, value: string | number | boolean) => {
    setValues((current) => {
      const next = { ...current, [name]: value }

      if (name === 'company' && current.majorDepartment) {
        next.majorDepartment = ''
      }

      return next
    })

    setErrors((current) => {
      if (!current[name] && !(name === 'company' && current.majorDepartment)) {
        return current
      }

      const next = { ...current }
      delete next[name]

      if (name === 'company') {
        delete next.majorDepartment
      }

      return next
    })
  }

  const handleSubmit = () => {
    const nextErrors = validateForm(module, values)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit(values)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{heading}</CardTitle>
            <CardDescription>
              Required fields are marked with *. This form is aligned with backend validation and master-data route behavior.
            </CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="Close form">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {serverError && (
          <div className="mb-4 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Backend validation failed</p>
              <p className="mt-1 leading-5">{serverError}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {module.fields.map((field) => (
            <MasterDataFieldRenderer
              key={field.name}
              field={field}
              value={values[field.name]}
              error={errors[field.name] ?? serverFieldErrors[field.name]}
              options={getFieldOptions(field, values)}
              disabled={isFieldDisabled(field.name, values)}
              onChange={handleValueChange}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update record' : 'Create record'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
