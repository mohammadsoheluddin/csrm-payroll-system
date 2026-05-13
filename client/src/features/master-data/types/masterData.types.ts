import type { Permission } from '@/config/permissions'

export type MasterDataModuleKey =
  | 'companies'
  | 'branches'
  | 'majorDepartments'
  | 'departments'
  | 'designations'
  | 'companyBankAccounts'

export type MasterDataRecord = Record<string, unknown> & {
  _id?: string
  id?: string
  name?: string
  code?: string
  shortName?: string
  status?: 'active' | 'inactive' | string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type MasterDataOption = {
  value: string
  label: string
  description?: string
}

export type MasterDataFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'select'
  | 'textarea'
  | 'checkbox'

export type MasterDataFieldOptionSource = 'companies' | 'majorDepartments'

export type MasterDataFieldConfig = {
  name: string
  label: string
  type: MasterDataFieldType
  required?: boolean
  placeholder?: string
  helperText?: string
  options?: MasterDataOption[]
  optionSource?: MasterDataFieldOptionSource
  dependsOn?: string
  readOnlyOnEdit?: boolean
  width?: 'full' | 'half' | 'third'
}

export type MasterDataTableColumn = {
  key: string
  label: string
  type?: 'text' | 'status' | 'boolean' | 'date' | 'reference' | 'badge'
  className?: string
}

export type MasterDataModuleConfig = {
  key: MasterDataModuleKey
  title: string
  shortTitle: string
  description: string
  routePath: string
  apiPath: string
  sectionLabel: string
  entityLabel: string
  entityLabelPlural: string
  readPermission: Permission
  managePermission?: Permission
  supportsDeletedView: boolean
  supportsRestore: boolean
  defaultValues: Record<string, unknown>
  fields: MasterDataFieldConfig[]
  tableColumns: MasterDataTableColumn[]
  searchableFields: string[]
  quickFilters?: MasterDataFieldConfig[]
}

export type MasterDataListMode = 'active' | 'deleted'

export type MasterDataQueryParams = {
  status?: string
  type?: string
  company?: string
  majorDepartment?: string
  accountType?: string
  isPrimary?: boolean | string
}

export type MasterDataMutationPayload = Record<string, unknown>
