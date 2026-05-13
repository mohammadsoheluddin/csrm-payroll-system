# Part-F4 — API Client + Error Handling Foundation

## Status

Completed as frontend foundation work.

Backend code was not changed in this part.

## Goal

Part-F4 standardizes how the frontend will communicate with the locked backend and how it will display backend errors before real CRUD/report screens start.

This part intentionally does not implement business screens yet.

## What Was Added

### 1. Central API Route Registry

File:

```txt
client/src/config/apiRoutes.ts
```

Purpose:

- Keep important backend route paths in one place.
- Avoid hardcoding report/system sub-routes repeatedly.
- Prevent wrong frontend assumptions such as calling report base routes that do not support `GET /`.

Important report/system route patterns preserved:

```txt
/report-center/catalog
/report-center/dashboard?company={{companyId}}&month=5&year=2026
/report-center/readiness?company={{companyId}}&month=5&year=2026
/month-end-process-control/status?company={{companyId}}&month=5&year=2026
/rbac-audit/summary
/rbac-audit/coverage
/payroll-reports/monthly-report?month=5&year=2026&company={{companyId}}
/bank-sheets/salary/preview?month=5&year=2026&company={{companyId}}
```

### 2. API Response Helpers

File:

```txt
client/src/lib/api/apiResponse.ts
```

Purpose:

- Unwrap standard backend success responses.
- Preserve pagination/meta when needed.
- Keep feature API files clean.

Standard backend response shape:

```ts
{
  success: true,
  message: string,
  data: TData,
  meta?: ApiMeta
}
```

### 3. Stronger API Error Normalization

File:

```txt
client/src/lib/api/apiError.ts
```

Purpose:

- Convert Axios/backend errors into one frontend error shape.
- Support 400, 401, 403, 404, 409, 422, 500, network, and unknown errors.
- Extract backend `errorSources` for form validation.
- Provide helper for applying backend field errors to React Hook Form.

Frontend normalized error shape:

```ts
{
  status?: number,
  code: ApiErrorCode,
  title: string,
  message: string,
  errorSources: ApiErrorSource[]
}
```

### 4. Query Client Defaults

Files:

```txt
client/src/lib/query/queryClient.ts
client/src/app/providers/QueryProvider.tsx
```

Purpose:

- Central TanStack Query defaults.
- Do not retry 4xx client errors.
- Retry likely network/server issues once.
- Central query error toast handling.

### 5. Query Key Registry

File:

```txt
client/src/lib/query/queryKeys.ts
```

Purpose:

- Prevent random query key naming.
- Prepare consistent cache invalidation for future CRUD modules.

### 6. Mutation Helper

File:

```txt
client/src/lib/query/useApiMutation.ts
```

Purpose:

- Standard success toast.
- Standard error toast.
- Standard query invalidation.
- Feature modules can use this instead of repeating mutation boilerplate.

### 7. Reusable Error UI

Files:

```txt
client/src/components/feedback/ApiErrorState.tsx
client/src/components/feedback/FormErrorSummary.tsx
```

Purpose:

- Standard page-level API error display.
- Standard form-level server/client error summary.
- Future CRUD forms should reuse this pattern.

### 8. File Download / Export Helper

Files:

```txt
client/src/lib/api/fileDownload.ts
client/src/components/reports/ExportActionButton.tsx
```

Purpose:

- Standard browser download flow for PDF, Excel, CSV, and other backend export endpoints.
- Supports `Content-Disposition` filename when backend sends it.
- Keeps report screens clean.

## Updated Existing Files

```txt
client/src/features/auth/api/auth.api.ts
client/src/features/auth/pages/LoginPage.tsx
client/src/features/dashboard/pages/DashboardPage.tsx
client/src/lib/api/httpClient.ts
client/src/app/providers/QueryProvider.tsx
```

## API Error Handling Rules

| Backend Status | Frontend Meaning | UI Behavior |
| --- | --- | --- |
| 400 | Invalid request | Show validation/informational error |
| 401 | Unauthenticated/session expired | Refresh token retry first, then session expired flow |
| 403 | Forbidden access | Show forbidden or warning error |
| 404 | Resource not found | Show not found error |
| 409 | Duplicate/conflicting data | Show conflict warning |
| 422 | Validation failed | Apply field errors where possible |
| 500 | Server error | Show destructive server error |
| Network | Backend unreachable/CORS/network | Show network error |

## Future Usage Example — Feature API

```ts
import { apiClient } from '@/lib/api/httpClient'
import { unwrapApiData } from '@/lib/api/apiResponse'
import type { ApiSuccessResponse } from '@/types/api.types'

export const getCompanies = async () => {
  const response = await apiClient.get<ApiSuccessResponse<Company[]>>('/companies')
  return unwrapApiData(response)
}
```

## Future Usage Example — Query

```ts
const companiesQuery = useQuery({
  queryKey: queryKeys.masterData.companies(filters),
  queryFn: () => getCompanies(filters),
})
```

## Future Usage Example — Mutation

```ts
const createCompanyMutation = useApiMutation({
  mutationFn: createCompany,
  successMessage: 'Company created successfully',
  invalidateQueries: [queryKeys.masterData.companies()],
})
```

## Future Usage Example — Export Button

```tsx
<ExportActionButton
  endpoint={apiRoutes.reports.monthlyPayrollReport}
  params={{ company: companyId, month, year }}
  fileName="monthly-payroll-report.pdf"
  label="Download PDF"
/>
```

## Local Test Commands

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
npm run dev
```

Expected:

```txt
lint passes
build passes
frontend opens at http://localhost:5173
/dashboard shows Part-F4 API foundation dashboard content
```

## Important Note

The build can show a Vite chunk-size warning. This is acceptable at this stage because the app currently imports router, auth, query, form, validation, icons, toast, and dashboard foundation code in one bundle. Later, business modules can be lazy-loaded route by route.

## Next Part

```txt
Part-F5 — Sidebar Permission Filtering + Permission-Wise UI Guard
```
