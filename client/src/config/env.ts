export const env = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
    'http://localhost:5000/api/v1',
  appName: import.meta.env.VITE_APP_NAME ?? 'CSRM Payroll System',
} as const
