# Part-F16 — Legacy Salary Import UI Foundation

## Status

Completed as frontend UI foundation.

## Scope

This part connects the dedicated backend module `Part-B52 — Legacy Salary Sheet Import & Archive Module` with frontend screens. It does not mix imported salary data with the native payroll calculation engine.

## Route

```txt
/salary/legacy-imports
```

Sidebar path:

```txt
Payroll Engine → Payroll → Legacy Salary Import
```

## Main Capabilities

- Upload `.xlsx` salary sheets from current/old payroll software.
- Convert selected Excel file to Base64 in browser.
- Call backend parse endpoint.
- Show parse mapping summary.
- Preview mapped/manual rows before commit.
- Commit previewed rows as external archive batch.
- List active and deleted archive batches.
- Soft delete and restore archive batches.
- Search archived salary records.
- View backend summary by department, major department, company, sheet type, or status.
- Download template CSV/Excel.
- Export archived records as CSV/Excel.
- Apply role/permission guards.

## Backend APIs Used

```txt
GET    /legacy-salary-imports/template/csv
GET    /legacy-salary-imports/template/excel
POST   /legacy-salary-imports/parse-excel
POST   /legacy-salary-imports/preview
POST   /legacy-salary-imports/commit
GET    /legacy-salary-imports
GET    /legacy-salary-imports/deleted
GET    /legacy-salary-imports/records
GET    /legacy-salary-imports/summary
GET    /legacy-salary-imports/records/export/csv
GET    /legacy-salary-imports/records/export/excel
DELETE /legacy-salary-imports/:id
PATCH  /legacy-salary-imports/:id/restore
```

## Permission Mapping

Frontend permissions added/synced:

```txt
legacy_salary_import:read
legacy_salary_import:process
legacy_salary_import:export
legacy_salary_import:delete
```

Role behavior:

```txt
super_admin: all via permission list
admin      : all via permission list
hr         : read/process/export/delete
accounts   : read/process/export/delete
manager    : read only
employee   : no access
```

## Important Product Rule

Imported salary sheet data is treated as:

```txt
External / Historical / Legacy Payroll Archive
```

It must not update or overwrite:

```txt
Native payroll calculation
Native salary sheet
Native salary statement
Native salary payment distribution
```

The UI intentionally describes this separation with archive-safe messaging.

## Files Added

```txt
client/src/features/legacy-salary-import/api/legacySalaryImport.api.ts
client/src/features/legacy-salary-import/components/LegacySalaryArchivePanel.tsx
client/src/features/legacy-salary-import/components/LegacySalaryFiltersPanel.tsx
client/src/features/legacy-salary-import/components/LegacySalaryPreviewPanel.tsx
client/src/features/legacy-salary-import/components/LegacySalaryRecordsPanel.tsx
client/src/features/legacy-salary-import/components/LegacySalaryUploadPanel.tsx
client/src/features/legacy-salary-import/pages/LegacySalaryImportPage.tsx
client/src/features/legacy-salary-import/types/legacySalaryImport.types.ts
client/src/features/legacy-salary-import/utils/legacySalaryImport.utils.ts
```

## Files Updated

```txt
client/src/app/router/lazyPages.tsx
client/src/app/router/routeConfig.tsx
client/src/app/router/routePreloaders.ts
client/src/app/router/router.tsx
client/src/config/apiRoutes.ts
client/src/config/permissions.ts
client/src/config/routePaths.ts
client/src/config/sidebar.config.tsx
client/src/lib/query/queryKeys.ts
scripts/frontend-smoke-check.mjs
```

## Local Test

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
npm run dev
```

Backend + frontend running:

```txt
http://localhost:5173/salary/legacy-imports
```

## Browser Test Checklist

- Route opens for authorized role.
- Sidebar shows `Legacy Salary Import` for allowed roles.
- Template Excel/CSV download buttons work.
- `.xlsx` file select works.
- Parse Excel calls backend and shows mapping summary.
- Preview Import shows valid/invalid rows and totals.
- Commit Archive creates archive batch.
- Archive tab lists batches.
- Deleted tab lists deleted batches.
- Restore works for deleted batch.
- Records tab lists imported rows.
- Summary cards/grouping work.
- Records export CSV/Excel works.
- No data state is clean.
- Permission denied state works for disallowed roles.

## Next Recommended

```txt
Part-F16.1 — Legacy Salary Import UI Test + Backend Integration Fix Pass
```
