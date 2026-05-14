export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    root: ['users'] as const,
    list: (params?: Record<string, unknown>) => ['users', 'list', params ?? {}] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  masterData: {
    companies: (params?: Record<string, unknown>) => ['master-data', 'companies', params ?? {}] as const,
    branches: (params?: Record<string, unknown>) => ['master-data', 'branches', params ?? {}] as const,
    majorDepartments: (params?: Record<string, unknown>) => ['master-data', 'majorDepartments', params ?? {}] as const,
    departments: (params?: Record<string, unknown>) => ['master-data', 'departments', params ?? {}] as const,
    designations: (params?: Record<string, unknown>) => ['master-data', 'designations', params ?? {}] as const,
    companyBankAccounts: (params?: Record<string, unknown>) => ['master-data', 'companyBankAccounts', params ?? {}] as const,
    module: (key: string, mode: string, params?: Record<string, unknown>) =>
      ['master-data', key, mode, params ?? {}] as const,
  },
  employees: {
    root: ['employees'] as const,
    list: (mode: string, params?: Record<string, unknown>) => ['employees', 'list', mode, params ?? {}] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    lookups: ['employees', 'lookups'] as const,
  },
  attendance: {
    root: ['attendance'] as const,
    list: (mode: string, params?: Record<string, unknown>) => ['attendance', 'list', mode, params ?? {}] as const,
  },
  leave: {
    root: ['leave'] as const,
    list: (mode: string, params?: Record<string, unknown>) => ['leave', 'list', mode, params ?? {}] as const,
    balance: (employeeId: string, year: string | number) => ['leave', 'balance', employeeId, year] as const,
  },
  payroll: {
    root: ['payroll'] as const,
    list: (mode: string, params?: Record<string, unknown>) => ['payroll', 'list', mode, params ?? {}] as const,
    detail: (id: string) => ['payroll', 'detail', id] as const,
    salaryStructures: (mode: string, params?: Record<string, unknown>) =>
      ['payroll', 'salary-structures', mode, params ?? {}] as const,
    workflow: (key: string, mode: string, params?: Record<string, unknown>) =>
      ['payroll', 'workflow', key, mode, params ?? {}] as const,
    workflowSummary: (key: string, params?: Record<string, unknown>) =>
      ['payroll', 'workflow-summary', key, params ?? {}] as const,
  },
  reports: {
    catalog: ['reports', 'catalog'] as const,
    dashboard: (params?: Record<string, unknown>) => ['reports', 'dashboard', params ?? {}] as const,
    readiness: (params?: Record<string, unknown>) => ['reports', 'readiness', params ?? {}] as const,
    monthEndStatus: (params?: Record<string, unknown>) => ['reports', 'month-end-status', params ?? {}] as const,
    salarySummary: (params?: Record<string, unknown>) => ['reports', 'salary-summary', params ?? {}] as const,
    bankSheet: (params?: Record<string, unknown>) => ['reports', 'bank-sheet', params ?? {}] as const,
    monthlyPayroll: (params?: Record<string, unknown>) => ['reports', 'monthly-payroll', params ?? {}] as const,
  },
  audit: {
    logs: (params?: Record<string, unknown>) => ['audit', 'logs', params ?? {}] as const,
    rbacSummary: ['audit', 'rbac-summary'] as const,
    rbacCoverage: ['audit', 'rbac-coverage'] as const,
  },
} as const
