# Part-F11.1 — Reports + Export UI Test & Backend Integration Fix Pass

## Status
Completed as a frontend-only integration hardening pass. Backend code was not changed.

## Purpose
Part-F11 added report center and export foundation screens. Part-F11.1 hardens backend route compatibility, preview row normalization, totals detection, bank sheet export behavior, and dependent filter safety.

## Completed
- Added backend route-safe salary bank sheet Excel/PDF export integration.
- Added bank_sheet:export permission-gated export buttons.
- Improved preview row normalization for multiple backend response shapes.
- Improved totals normalization for summaryTotals, grandTotals, and grandTotal response shapes.
- Improved report metric currency formatting for total/gross/net/bank/cash/payable/salary/OT/AIT/loan/suspense keys.
- Improved dependent report filters: company resets lower filters, empty dependent dropdowns are disabled.
- Hardened lookup retry callback usage to avoid runtime callback mismatch.
- Added this documentation file.

## Cumulative Patch Note
This patch is safe to apply after Part-F10.2 even if the Part-F11 patch was not applied yet. It includes the Part-F11 report files plus the Part-F11.1 integration fixes.

## Routes Covered
- `/reports/center`
- `/reports/salary-summary`
- `/bank-sheets`
- `/reports/month-end-control`
- `/reports/layout-standards`

## Backend Routes Used
- `GET /report-center/catalog`
- `GET /report-center/dashboard`
- `GET /report-center/readiness`
- `GET /month-end-process-control/status`
- `GET /salary-summary/preview`
- `GET /salary-summary/export/csv`
- `GET /salary-summary/export/excel`
- `GET /salary-summary/export/pdf`
- `GET /payroll-reports/monthly-report`
- `GET /payroll-reports/monthly-report/export/csv`
- `GET /payroll-reports/monthly-report/export/excel`
- `GET /bank-sheets/salary/preview`
- `GET /bank-sheets/salary/export/excel`
- `GET /bank-sheets/salary/export/pdf`

## Testing
Run:

```bash
cd client
npm run lint
npm run build
npm run dev
```

Then test these pages with backend running:

```txt
/reports/center
/reports/salary-summary
/bank-sheets
/reports/month-end-control
/reports/layout-standards
```

## Notes
Frontend does not calculate payroll, salary, OT, bank/cash, AIT, loan, suspense, payable, or total values. The frontend only displays backend-calculated report data and triggers backend exports.
