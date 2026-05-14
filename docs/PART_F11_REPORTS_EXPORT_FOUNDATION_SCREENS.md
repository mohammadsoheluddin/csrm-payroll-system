# Part-F11 — Reports + Export Foundation Screens

## Status

Completed frontend foundation for report preview/export screens.

Backend code was not changed in this part.

## Goals Completed

- Report Center page connected to backend route-note-safe sub-routes.
- Salary Summary page connected to the dedicated B51 backend module.
- Bank Sheet page connected to salary bank sheet preview and monthly payroll report preview/export routes.
- Month-End Process Control page connected to backend status route.
- Report Layout Standards page created to lock preview/export UI rules.
- Permission-aware report access and export action foundation.
- Shared report period toolbar, preview table, metric cards, and export toolbar.

## Active Frontend Routes

- `/reports/center`
- `/reports/salary-summary`
- `/bank-sheets`
- `/reports/month-end-control`
- `/reports/layout-standards`

## Backend Routes Used Safely

These routes follow the known backend route notes and do not assume base report routes support `GET /`.

- `GET /report-center/catalog`
- `GET /report-center/dashboard?company={{companyId}}&month=5&year=2026`
- `GET /report-center/readiness?company={{companyId}}&month=5&year=2026`
- `GET /month-end-process-control/status?company={{companyId}}&month=5&year=2026`
- `GET /payroll-reports/monthly-report?month=5&year=2026&company={{companyId}}`
- `GET /payroll-reports/monthly-report/export/csv?month=5&year=2026&company={{companyId}}`
- `GET /payroll-reports/monthly-report/export/excel?month=5&year=2026&company={{companyId}}`
- `GET /bank-sheets/salary/preview?month=5&year=2026&company={{companyId}}`
- `GET /salary-summary/preview?month=5&year=2026&groupBy=majorDepartment`
- `GET /salary-summary/export/csv?month=5&year=2026&groupBy=majorDepartment`
- `GET /salary-summary/export/excel?month=5&year=2026&groupBy=majorDepartment`
- `GET /salary-summary/export/pdf?month=5&year=2026&groupBy=majorDepartment`

## New Files

- `client/src/features/reports/api/reports.api.ts`
- `client/src/features/reports/components/ReportPeriodToolbar.tsx`
- `client/src/features/reports/components/ReportMetricCards.tsx`
- `client/src/features/reports/components/ReportPreviewTable.tsx`
- `client/src/features/reports/components/ReportExportToolbar.tsx`
- `client/src/features/reports/pages/ReportCenterPage.tsx`
- `client/src/features/reports/pages/SalarySummaryReportPage.tsx`
- `client/src/features/reports/pages/BankSheetsPage.tsx`
- `client/src/features/reports/pages/MonthEndControlPage.tsx`
- `client/src/features/reports/pages/ReportLayoutStandardsPage.tsx`
- `client/src/features/reports/types/report.types.ts`
- `client/src/features/reports/utils/report.utils.ts`

## Updated Files

- `client/src/app/router/router.tsx`
- `client/src/app/router/routeConfig.tsx`
- `client/src/lib/query/queryKeys.ts`

## Design Rules

- Frontend must not calculate salary, OT, tax, loan, suspense, bank/cash, or payable amounts.
- Frontend may only filter, preview, display, and download backend-controlled report data.
- Official export files must use backend file routes.
- Preview must be available before export wherever possible.
- Sensitive exports must be permission-controlled.

## Manual Browser Test

Run backend and frontend, then check:

- `/reports/center`
- `/reports/salary-summary`
- `/bank-sheets`
- `/reports/month-end-control`
- `/reports/layout-standards`

Expected:

- Pages render without placeholder.
- Permission guards work.
- Company/month/year filters appear.
- Backend no-data or validation errors show cleanly.
- Salary Summary export buttons appear only with `salary_summary:export`.
- Monthly Payroll Report export buttons appear only with `payroll_report:export`.

## Next Recommended Part

Part-F11.1 — Reports + Export UI Test & Backend Integration Fix Pass.
