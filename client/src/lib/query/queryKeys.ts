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
    departments: (params?: Record<string, unknown>) => ['master-data', 'departments', params ?? {}] as const,
    designations: (params?: Record<string, unknown>) => ['master-data', 'designations', params ?? {}] as const,
  },
  employees: {
    root: ['employees'] as const,
    list: (params?: Record<string, unknown>) => ['employees', 'list', params ?? {}] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
  },
  reports: {
    catalog: ['reports', 'catalog'] as const,
    dashboard: (params?: Record<string, unknown>) => ['reports', 'dashboard', params ?? {}] as const,
    readiness: (params?: Record<string, unknown>) => ['reports', 'readiness', params ?? {}] as const,
    monthEndStatus: (params?: Record<string, unknown>) => ['reports', 'month-end-status', params ?? {}] as const,
  },
  audit: {
    logs: (params?: Record<string, unknown>) => ['audit', 'logs', params ?? {}] as const,
    rbacSummary: ['audit', 'rbac-summary'] as const,
    rbacCoverage: ['audit', 'rbac-coverage'] as const,
  },
} as const
