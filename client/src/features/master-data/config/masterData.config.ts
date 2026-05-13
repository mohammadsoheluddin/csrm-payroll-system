import { apiRoutes } from '@/config/apiRoutes'
import { PERMISSIONS } from '@/config/permissions'
import { routePaths } from '@/config/routePaths'
import type {
  MasterDataFieldConfig,
  MasterDataModuleConfig,
  MasterDataModuleKey,
} from '@/features/master-data/types/masterData.types'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const companyTypeOptions = [
  { value: 'company', label: 'Company' },
  { value: 'concern', label: 'Concern' },
  { value: 'sister_concern', label: 'Sister Concern' },
  { value: 'unit', label: 'Unit' },
  { value: 'project', label: 'Project' },
]

const designationCategoryOptions = [
  { value: 'management', label: 'Management' },
  { value: 'officer', label: 'Officer' },
  { value: 'staff', label: 'Staff' },
  { value: 'worker', label: 'Worker' },
  { value: 'technical', label: 'Technical' },
  { value: 'security', label: 'Security' },
  { value: 'driver', label: 'Driver' },
  { value: 'sales', label: 'Sales' },
  { value: 'other', label: 'Other' },
]

const accountTypeOptions = [
  { value: 'salary', label: 'Salary' },
  { value: 'ot', label: 'OT' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'general', label: 'General' },
  { value: 'tada', label: 'TA/DA' },
  { value: 'allowance', label: 'Allowance' },
]

const commonStatusField: MasterDataFieldConfig = {
  name: 'status',
  label: 'Status',
  type: 'select',
  required: true,
  options: statusOptions,
  width: 'half',
}

const companyField: MasterDataFieldConfig = {
  name: 'company',
  label: 'Company / Concern',
  type: 'select',
  required: true,
  optionSource: 'companies',
  placeholder: 'Select company',
  width: 'half',
}

const sortOrderField: MasterDataFieldConfig = {
  name: 'sortOrder',
  label: 'Sort Order',
  type: 'number',
  placeholder: '0',
  width: 'half',
}

const descriptionField: MasterDataFieldConfig = {
  name: 'description',
  label: 'Description / Notes',
  type: 'textarea',
  placeholder: 'Optional note for audit/user understanding',
  width: 'full',
}

export const masterDataModuleConfigs: Record<MasterDataModuleKey, MasterDataModuleConfig> = {
  companies: {
    key: 'companies',
    title: 'Company / Concern Setup',
    shortTitle: 'Companies',
    description: 'Maintain CSRM companies, concerns, sister concerns, units, and project entities used across HR/payroll reports.',
    routePath: routePaths.companies,
    apiPath: apiRoutes.masterData.companies,
    sectionLabel: 'Master Setup',
    entityLabel: 'Company',
    entityLabelPlural: 'Companies',
    readPermission: PERMISSIONS.COMPANY_READ,
    managePermission: PERMISSIONS.COMPANY_MANAGE,
    supportsDeletedView: true,
    supportsRestore: true,
    defaultValues: {
      type: 'company',
      status: 'active',
      isPrimary: false,
    },
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Chakda Steel & Re-Rolling Mills', width: 'half' },
      { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'CSRM', width: 'half' },
      { name: 'shortName', label: 'Short Name', type: 'text', placeholder: 'CSRM', width: 'half' },
      { name: 'legalName', label: 'Legal Name', type: 'text', placeholder: 'Full legal name', width: 'half' },
      { name: 'type', label: 'Type', type: 'select', required: true, options: companyTypeOptions, width: 'half' },
      { name: 'parentCompany', label: 'Parent Company', type: 'select', optionSource: 'companies', placeholder: 'Optional parent company', width: 'half' },
      { name: 'isPrimary', label: 'Primary company', type: 'checkbox', helperText: 'Use for main CSRM concern/company marker.', width: 'half' },
      commonStatusField,
      { name: 'phone', label: 'Phone', type: 'text', placeholder: 'Optional phone', width: 'half' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'Optional email', width: 'half' },
      { name: 'tin', label: 'TIN', type: 'text', placeholder: 'Optional TIN', width: 'half' },
      { name: 'bin', label: 'BIN', type: 'text', placeholder: 'Optional BIN', width: 'half' },
      { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Company address', width: 'full' },
      { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional internal notes', width: 'full' },
    ],
    tableColumns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code', type: 'badge' },
      { key: 'type', label: 'Type', type: 'badge' },
      { key: 'parentCompany', label: 'Parent', type: 'reference' },
      { key: 'isPrimary', label: 'Primary', type: 'boolean' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    searchableFields: ['name', 'code', 'shortName', 'legalName'],
    quickFilters: [
      { name: 'status', label: 'Status', type: 'select', options: statusOptions },
      { name: 'type', label: 'Type', type: 'select', options: companyTypeOptions },
    ],
  },
  branches: {
    key: 'branches',
    title: 'Branch Setup',
    shortTitle: 'Branches',
    description: 'Maintain branch/location records used by employees, attendance, payroll, and reports.',
    routePath: routePaths.branches,
    apiPath: apiRoutes.masterData.branches,
    sectionLabel: 'Master Setup',
    entityLabel: 'Branch',
    entityLabelPlural: 'Branches',
    readPermission: PERMISSIONS.BRANCH_READ,
    managePermission: PERMISSIONS.BRANCH_MANAGE,
    supportsDeletedView: true,
    supportsRestore: true,
    defaultValues: {
      status: 'active',
    },
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Head Office', width: 'half' },
      { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'HO', width: 'half' },
      commonStatusField,
      { name: 'address', label: 'Address', type: 'textarea', required: true, placeholder: 'Branch/location address', width: 'full' },
    ],
    tableColumns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code', type: 'badge' },
      { key: 'address', label: 'Address' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    searchableFields: ['name', 'code', 'address'],
    quickFilters: [{ name: 'status', label: 'Status', type: 'select', options: statusOptions }],
  },
  majorDepartments: {
    key: 'majorDepartments',
    title: 'Major Department Setup',
    shortTitle: 'Major Departments',
    description: 'Maintain Office, SMS, ARRM, Accounts, Sales, Scrap Yard, and other top-level department groups.',
    routePath: routePaths.majorDepartments,
    apiPath: apiRoutes.masterData.majorDepartments,
    sectionLabel: 'Master Setup',
    entityLabel: 'Major Department',
    entityLabelPlural: 'Major Departments',
    readPermission: PERMISSIONS.MAJOR_DEPARTMENT_READ,
    managePermission: PERMISSIONS.MAJOR_DEPARTMENT_MANAGE,
    supportsDeletedView: true,
    supportsRestore: true,
    defaultValues: {
      status: 'active',
      sortOrder: 0,
    },
    fields: [
      companyField,
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Office / SMS / ARRM', width: 'half' },
      { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'OFFICE', width: 'half' },
      { name: 'shortName', label: 'Short Name', type: 'text', placeholder: 'Office', width: 'half' },
      sortOrderField,
      commonStatusField,
      descriptionField,
    ],
    tableColumns: [
      { key: 'company', label: 'Company', type: 'reference' },
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code', type: 'badge' },
      { key: 'sortOrder', label: 'Sort' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    searchableFields: ['name', 'code', 'shortName', 'company.name'],
    quickFilters: [companyField, { name: 'status', label: 'Status', type: 'select', options: statusOptions }],
  },
  departments: {
    key: 'departments',
    title: 'Department / Section Setup',
    shortTitle: 'Departments',
    description: 'Maintain departments, sub-departments, and section-level reporting groups under company and major department.',
    routePath: routePaths.departments,
    apiPath: apiRoutes.masterData.departments,
    sectionLabel: 'Master Setup',
    entityLabel: 'Department',
    entityLabelPlural: 'Departments',
    readPermission: PERMISSIONS.DEPARTMENT_READ,
    managePermission: PERMISSIONS.DEPARTMENT_MANAGE,
    supportsDeletedView: true,
    supportsRestore: true,
    defaultValues: {
      status: 'active',
      sortOrder: 0,
    },
    fields: [
      companyField,
      { name: 'majorDepartment', label: 'Major Department', type: 'select', required: true, optionSource: 'majorDepartments', dependsOn: 'company', placeholder: 'Select major department', width: 'half' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'HR & Admin / Store / Scrap Yard', width: 'half' },
      { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'HR_ADMIN', width: 'half' },
      { name: 'shortName', label: 'Short Name', type: 'text', placeholder: 'HR-Admin', width: 'half' },
      sortOrderField,
      commonStatusField,
      descriptionField,
    ],
    tableColumns: [
      { key: 'company', label: 'Company', type: 'reference' },
      { key: 'majorDepartment', label: 'Major Dept.', type: 'reference' },
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code', type: 'badge' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    searchableFields: ['name', 'code', 'shortName', 'company.name', 'majorDepartment.name'],
    quickFilters: [companyField, { name: 'majorDepartment', label: 'Major Department', type: 'select', optionSource: 'majorDepartments', dependsOn: 'company' }, { name: 'status', label: 'Status', type: 'select', options: statusOptions }],
  },
  designations: {
    key: 'designations',
    title: 'Designation Setup',
    shortTitle: 'Designations',
    description: 'Maintain job titles/designations, categories, and grade levels used in employee profiles and reports.',
    routePath: routePaths.designations,
    apiPath: apiRoutes.masterData.designations,
    sectionLabel: 'Master Setup',
    entityLabel: 'Designation',
    entityLabelPlural: 'Designations',
    readPermission: PERMISSIONS.DESIGNATION_READ,
    managePermission: PERMISSIONS.DESIGNATION_MANAGE,
    supportsDeletedView: true,
    supportsRestore: true,
    defaultValues: {
      status: 'active',
      category: 'other',
      sortOrder: 0,
    },
    fields: [
      companyField,
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Executive - HR & Admin', width: 'half' },
      { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'EXEC_HR_ADMIN', width: 'half' },
      { name: 'shortName', label: 'Short Name', type: 'text', placeholder: 'Executive', width: 'half' },
      { name: 'category', label: 'Category', type: 'select', required: true, options: designationCategoryOptions, width: 'half' },
      { name: 'gradeLevel', label: 'Grade Level', type: 'number', placeholder: '1', width: 'half' },
      sortOrderField,
      commonStatusField,
      descriptionField,
    ],
    tableColumns: [
      { key: 'company', label: 'Company', type: 'reference' },
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code', type: 'badge' },
      { key: 'category', label: 'Category', type: 'badge' },
      { key: 'gradeLevel', label: 'Grade' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    searchableFields: ['name', 'code', 'shortName', 'category', 'company.name'],
    quickFilters: [companyField, { name: 'category', label: 'Category', type: 'select', options: designationCategoryOptions }, { name: 'status', label: 'Status', type: 'select', options: statusOptions }],
  },
  companyBankAccounts: {
    key: 'companyBankAccounts',
    title: 'Company Bank Accounts',
    shortTitle: 'Bank Accounts',
    description: 'Maintain company bank accounts used for salary, OT, bonus, and bank export workflows.',
    routePath: routePaths.companyBankAccounts,
    apiPath: apiRoutes.masterData.companyBankAccounts,
    sectionLabel: 'Master Setup',
    entityLabel: 'Company Bank Account',
    entityLabelPlural: 'Company Bank Accounts',
    readPermission: PERMISSIONS.COMPANY_BANK_ACCOUNT_READ,
    managePermission: PERMISSIONS.COMPANY_BANK_ACCOUNT_MANAGE,
    supportsDeletedView: false,
    supportsRestore: false,
    defaultValues: {
      accountType: 'salary',
      currency: 'BDT',
      isPrimary: false,
      status: 'active',
    },
    fields: [
      companyField,
      { name: 'accountName', label: 'Account Name', type: 'text', required: true, placeholder: 'CSRM Salary Account', width: 'half' },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true, placeholder: 'Al-Arafah Islami Bank Ltd.', width: 'half' },
      { name: 'branchName', label: 'Branch Name', type: 'text', required: true, placeholder: 'Agrabad Branch', width: 'half' },
      { name: 'branchCode', label: 'Branch Code', type: 'text', required: true, placeholder: '001', width: 'half' },
      { name: 'routingNo', label: 'Routing No', type: 'text', placeholder: 'Optional routing number', width: 'half' },
      { name: 'swiftCode', label: 'SWIFT Code', type: 'text', placeholder: 'Optional SWIFT', width: 'half' },
      { name: 'accountNo', label: 'Account No', type: 'text', required: true, placeholder: 'Bank account number', width: 'half' },
      { name: 'processBankBranchNo', label: 'Process Bank Branch No', type: 'text', required: true, placeholder: 'Payroll process branch no', width: 'half' },
      { name: 'accountType', label: 'Account Type', type: 'select', required: true, options: accountTypeOptions, width: 'half' },
      { name: 'currency', label: 'Currency', type: 'text', placeholder: 'BDT', width: 'half' },
      { name: 'isPrimary', label: 'Primary account', type: 'checkbox', helperText: 'Marks this account as primary for the company.', width: 'half' },
      commonStatusField,
      { name: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Optional bank/account note', width: 'full' },
    ],
    tableColumns: [
      { key: 'company', label: 'Company', type: 'reference' },
      { key: 'accountName', label: 'Account Name' },
      { key: 'bankName', label: 'Bank' },
      { key: 'accountNo', label: 'Account No' },
      { key: 'accountType', label: 'Type', type: 'badge' },
      { key: 'isPrimary', label: 'Primary', type: 'boolean' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    searchableFields: ['accountName', 'bankName', 'branchName', 'branchCode', 'accountNo', 'company.name'],
    quickFilters: [companyField, { name: 'accountType', label: 'Account Type', type: 'select', options: accountTypeOptions }, { name: 'status', label: 'Status', type: 'select', options: statusOptions }],
  },
}

export const masterDataModules = Object.values(masterDataModuleConfigs)

export const getMasterDataModuleByPath = (path: string) => {
  return masterDataModules.find((module) => module.routePath === path)
}

export const getMasterDataModule = (key: MasterDataModuleKey) => {
  return masterDataModuleConfigs[key]
}
