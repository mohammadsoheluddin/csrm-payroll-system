# Part-F10 — Payroll + Salary Foundation Screens

## Status

Completed as a frontend foundation pass.

Backend code was not changed in this part.

## Goal

Part-F10 connects the existing backend payroll and salary APIs to the frontend UI foundation. The purpose is to make payroll and salary pages visible and usable as backend-connected ERP screens without changing the backend calculation engine.

## Active Frontend Routes

- `/payroll`
- `/salary/structures`
- `/salary/sheets`
- `/salary/statements`
- `/salary/payment-distributions`

These routes no longer use generic placeholder pages.

## Backend API Areas Used

### Payroll

- `GET /payroll`
- `GET /payroll/deleted`
- `POST /payroll/generate`
- `PATCH /payroll/:id/process`
- `PATCH /payroll/:id/approve`
- `PATCH /payroll/:id/lock`
- `PATCH /payroll/:id/restore`
- `DELETE /payroll/:id`

### Salary Structure

- `GET /salary-structure`
- `GET /salary-structure/deleted`
- `POST /salary-structure/create`
- `PATCH /salary-structure/:id`
- `PATCH /salary-structure/:id/restore`
- `DELETE /salary-structure/:id`

### Salary Sheets

- `GET /salary-sheets`
- `GET /salary-sheets/deleted`
- `POST /salary-sheets/generate`
- `GET /salary-sheets/summary`
- `PATCH /salary-sheets/:id/process`
- `PATCH /salary-sheets/:id/approve`
- `PATCH /salary-sheets/:id/lock`
- `PATCH /salary-sheets/:id/unlock`
- `PATCH /salary-sheets/:id/restore`
- `DELETE /salary-sheets/:id`
- Bulk process/approve/lock/unlock routes

### Salary Statements

- `GET /salary-statements`
- `GET /salary-statements/deleted`
- `POST /salary-statements/generate`
- `GET /salary-statements/summary`
- `PATCH /salary-statements/:id/process`
- `PATCH /salary-statements/:id/approve`
- `PATCH /salary-statements/:id/lock`
- `PATCH /salary-statements/:id/unlock`
- `PATCH /salary-statements/:id/restore`
- `DELETE /salary-statements/:id`
- Bulk process/approve/lock/unlock routes

### Salary Payment Distribution

- `GET /salary-payment-distributions`
- `GET /salary-payment-distributions/deleted`
- `POST /salary-payment-distributions/generate`
- `GET /salary-payment-distributions/summary`
- `GET /salary-payment-distributions/export/preview`
- `GET /salary-payment-distributions/export/excel`
- `GET /salary-payment-distributions/export/pdf`
- `GET /salary-payment-distributions/export/csv`
- `PATCH /salary-payment-distributions/:id/process`
- `PATCH /salary-payment-distributions/:id/approve`
- `PATCH /salary-payment-distributions/:id/lock`
- `PATCH /salary-payment-distributions/:id/unlock`
- `PATCH /salary-payment-distributions/:id/restore`
- `DELETE /salary-payment-distributions/:id`
- Bulk process/approve/lock/unlock routes

## Completed Frontend Features

### Payroll Run

- Period filter: month/year/company/major department/department/branch/employee/status
- Active/deleted mode
- List records
- Generate monthly payroll
- Process payroll record
- Approve payroll record
- Lock payroll record
- Soft delete payroll record
- Restore deleted payroll record
- Record detail drawer
- Monthly payroll Excel/CSV download button foundation
- Permission-wise action visibility

### Salary Structure

- Active/deleted mode
- List salary structures
- Create salary structure
- Edit salary structure
- Soft delete salary structure
- Restore salary structure
- Employee lookup dropdown
- Backend validation error display
- Salary totals summary cards

### Salary Sheets / Statements / Payment Distributions

- Shared workflow page engine
- Period filter
- Active/deleted mode
- Generate records
- List records
- Single record process/approve/lock/unlock/delete/restore
- Bulk process/approve/lock/unlock foundation
- Payment mode filter for salary payment distribution
- Export buttons for salary payment distribution
- Backend summary endpoint call foundation
- Record detail drawer
- Permission-wise action visibility

## Frontend Files Added

- `client/src/features/payroll/api/payroll.api.ts`
- `client/src/features/payroll/config/payrollWorkflow.config.ts`
- `client/src/features/payroll/hooks/usePayrollLookups.ts`
- `client/src/features/payroll/types/payroll.types.ts`
- `client/src/features/payroll/utils/payroll.utils.ts`
- `client/src/features/payroll/components/PayrollActionDialog.tsx`
- `client/src/features/payroll/components/PayrollDetailDrawer.tsx`
- `client/src/features/payroll/components/PayrollGeneratePanel.tsx`
- `client/src/features/payroll/components/PayrollPeriodToolbar.tsx`
- `client/src/features/payroll/components/PayrollStatCards.tsx`
- `client/src/features/payroll/components/SalaryStructureFormPanel.tsx`
- `client/src/features/payroll/pages/PayrollRunPage.tsx`
- `client/src/features/payroll/pages/PayrollWorkflowPage.tsx`
- `client/src/features/payroll/pages/SalaryStructuresPage.tsx`

## Frontend Files Updated

- `client/src/config/apiRoutes.ts`
- `client/src/lib/query/queryKeys.ts`
- `client/src/app/router/routeConfig.tsx`
- `client/src/app/router/router.tsx`

## Testing Commands

```bash
cd /e/Projects/CSRM-Payroll-System/client

npm run lint
npm run build
npm run dev
```

Expected:

- Lint passes
- Build passes
- Vite chunk-size warning may appear and is acceptable at this stage

## Browser Routes To Test

```txt
http://localhost:5173/payroll
http://localhost:5173/salary/structures
http://localhost:5173/salary/sheets
http://localhost:5173/salary/statements
http://localhost:5173/salary/payment-distributions
```

## Important Notes

1. This part does not change payroll calculation logic.
2. The frontend depends on correct backend data readiness: employees, salary structures, attendance finalization, salary sheets, salary statements, and payment distributions.
3. Some backend routes require company/month/year filters. No-data responses are expected if backend prerequisites are not prepared.
4. Salary Payment Distribution export requires company/month/year and payment mode where backend validation requires it.
5. A follow-up integration fix pass is recommended after real browser testing.

## Recommended Next Part

`Part-F10.1 — Payroll + Salary UI Test & Backend Integration Fix Pass`

This follow-up should verify real data behavior, backend route/query mismatch, export validation, action lifecycle, and empty/no-data handling.
