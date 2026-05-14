# Part-F10.2 — Payroll + Salary UI Test & Backend Integration Fix Pass

## Status

Completed.

This part hardens the frontend payroll/salary foundation screens against backend validation and workflow route behavior. No backend code was changed.

## Scope

Part-F10 introduced backend-connected screens for:

- Payroll Run
- Salary Structures
- Salary Sheets
- Salary Statements
- Salary Payment Distributions

Part-F10.2 fixes integration issues discovered during UI/build/test planning.

## Changes

### 1. Payroll generate payload cleanup

The core backend `POST /payroll/generate` route uses strict validation and does not accept `allowCashFallback`.

Fixed:

- `allowCashFallback` is now sent only for modules that support it.
- Empty string, null, and undefined fields are removed before submit.
- Month/year are normalized to numbers for POST/PATCH body payloads.

### 2. Bulk workflow payload cleanup

Bulk workflow actions now use a dedicated payload cleaner.

Fixed:

- Empty optional filters are removed.
- Month/year are converted to numbers.
- `strict` is only included when explicitly provided.
- `paymentMode` is preserved only when selected.

### 3. Payroll lookup filtering

Payroll screens now use dependent lookup options.

Fixed:

- Major Department options can be filtered by selected Company.
- Department options can be filtered by selected Company + Major Department.
- Employee options can be filtered by Company, Major Department, Department, and Branch.

### 4. Payroll toolbar dependent reset

Changing higher-level filters now clears lower-level selections.

Fixed:

- Company change clears Major Department, Department, and Employee.
- Major Department change clears Department and Employee.
- Department or Branch change clears Employee.

### 5. Salary Payment Distribution export guard

Backend salary payment distribution export requires a payment mode.

Fixed:

- Excel/PDF export buttons stay disabled until month, year, company, and payment mode are selected.

### 6. Backend field error mapping

Backend validation paths such as `body.effectiveFrom`, `query.company`, or `params.id` are now normalized for frontend form fields.

Fixed:

- `body.fieldName` maps to `fieldName`.
- Nested paths preserve full field names and top-level fallbacks.

## Files Updated

```txt
client/src/features/payroll/api/payroll.api.ts
client/src/features/payroll/components/PayrollGeneratePanel.tsx
client/src/features/payroll/components/PayrollPeriodToolbar.tsx
client/src/features/payroll/hooks/usePayrollLookups.ts
client/src/features/payroll/pages/PayrollRunPage.tsx
client/src/features/payroll/pages/PayrollWorkflowPage.tsx
client/src/features/payroll/utils/payroll.utils.ts
client/src/lib/api/apiError.ts
docs/PART_F10_2_PAYROLL_SALARY_UI_TEST_BACKEND_INTEGRATION_FIX_PASS.md
```

## Test Result

Tested successfully:

```bash
cd client
npm run lint
npm run build
```

Result:

```txt
Lint passed
Build passed
```

Vite chunk-size warning may appear. It is not a build error and will be handled later through route-based lazy loading/code splitting.

## Browser Test Checklist

Backend and frontend should both be running.

Open:

```txt
/payroll
/salary/structures
/salary/sheets
/salary/statements
/salary/payment-distributions
```

Check:

- Payroll generate no longer sends unsupported `allowCashFallback`.
- Salary Payment Distribution generate can still send cash fallback option.
- Company filter resets dependent filters.
- Major Department filter resets Department and Employee.
- Employee dropdown narrows according to selected organization filters.
- Salary Payment Distribution export requires payment mode.
- Backend validation errors show against form fields where possible.
