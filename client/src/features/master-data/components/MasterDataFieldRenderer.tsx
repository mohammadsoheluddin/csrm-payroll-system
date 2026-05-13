import type { ChangeEvent } from 'react'

import type { MasterDataFieldConfig, MasterDataOption } from '@/features/master-data/types/masterData.types'
import { cn } from '@/lib/utils/cn'

export type MasterDataFieldRendererProps = {
  field: MasterDataFieldConfig
  value: unknown
  error?: string
  options: MasterDataOption[]
  disabled?: boolean
  onChange: (name: string, value: string | number | boolean) => void
}

const fieldWidthClasses = {
  full: 'md:col-span-2',
  half: 'md:col-span-1',
  third: 'md:col-span-1',
}

const baseInputClasses =
  'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60'

export const MasterDataFieldRenderer = ({
  field,
  value,
  error,
  options,
  disabled = false,
  onChange,
}: MasterDataFieldRendererProps) => {
  const wrapperClassName = fieldWidthClasses[field.width ?? 'half']

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = event.target

    if (field.type === 'checkbox' && target instanceof HTMLInputElement) {
      onChange(field.name, target.checked)
      return
    }

    if (field.type === 'number') {
      onChange(field.name, target.value === '' ? '' : Number(target.value))
      return
    }

    onChange(field.name, target.value)
  }

  if (field.type === 'checkbox') {
    return (
      <label className={cn('flex min-h-10 items-start gap-3 rounded-xl border border-border bg-background p-3', wrapperClassName)}>
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          checked={value === true}
          disabled={disabled}
          onChange={handleChange}
        />
        <span>
          <span className="block text-sm font-semibold text-foreground">{field.label}</span>
          {field.helperText && <span className="mt-1 block text-xs leading-5 text-muted-foreground">{field.helperText}</span>}
          {error && <span className="mt-1 block text-xs font-medium text-destructive">{error}</span>}
        </span>
      </label>
    )
  }

  return (
    <label className={cn('space-y-1.5', wrapperClassName)}>
      <span className="text-sm font-semibold text-foreground">
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </span>

      {field.type === 'select' ? (
        <select value={String(value ?? '')} disabled={disabled} onChange={handleChange} className={baseInputClasses}>
          <option value="">{field.placeholder ?? `Select ${field.label}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          value={String(value ?? '')}
          disabled={disabled}
          onChange={handleChange}
          placeholder={field.placeholder}
          className={cn(baseInputClasses, 'h-24 resize-none py-2')}
        />
      ) : (
        <input
          type={field.type}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={handleChange}
          placeholder={field.placeholder}
          className={baseInputClasses}
        />
      )}

      {field.helperText && <span className="block text-xs leading-5 text-muted-foreground">{field.helperText}</span>}
      {disabled && field.optionSource === 'majorDepartments' && (
        <span className="block text-xs leading-5 text-muted-foreground">Select a company first to load matching major departments.</span>
      )}
      {error && <span className="block text-xs font-medium text-destructive">{error}</span>}
    </label>
  )
}
