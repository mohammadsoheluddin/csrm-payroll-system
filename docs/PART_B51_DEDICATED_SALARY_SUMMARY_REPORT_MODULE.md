# Part-B51 — Dedicated Salary Summary Report Backend Module

## Status

Completed as a controlled backend extension after backend code-freeze candidate.

This module is intentionally backend-calculated because Salary Summary is a critical management/payroll report. The frontend must not calculate these totals from UI state.

## Business Purpose

Salary Summary provides company/concern and unit-wise totals for:

- Salary & Wages
- OT / Time Bill payable summary
- Combined Salary/Wages totals
- Combined OT totals
- Group total for Salary, Wages & OT

The uploaded reference workbook `Salary Summary.xlsx` was used as the functional reference for this module. The old report contains groupings such as Office, ARRM, SMS, Scrap Yard, 4B and company sections such as CSRM and TSL. The backend implementation keeps this dynamic through `groupBy` and source payroll data.

## New Backend Module

```txt
server/src/modules/salarySummary/
├── salarySummary.interface.ts
├── salarySummary.validation.ts
├── salarySummary.service.ts
├── salarySummary.export.ts
├── salarySummary.controller.ts
└── salarySummary.route.ts
```

## New API Routes

Base path:

```txt
/api/v1/salary-summary
```

Routes:

```txt
GET /api/v1/salary-summary/preview
GET /api/v1/salary-summary/export/csv
GET /api/v1/salary-summary/export/excel
GET /api/v1/salary-summary/export/pdf
```

Example preview:

```txt
GET /api/v1/salary-summary/preview?month=5&year=2026&groupBy=majorDepartment
```

Example with company filter:

```txt
GET /api/v1/salary-summary/preview?month=5&year=2026&company={{companyId}}&groupBy=majorDepartment
```

Export examples:

```txt
GET /api/v1/salary-summary/export/excel?month=5&year=2026&groupBy=majorDepartment
GET /api/v1/salary-summary/export/pdf?month=5&year=2026&groupBy=majorDepartment
GET /api/v1/salary-summary/export/csv?month=5&year=2026&groupBy=majorDepartment
```

## Query Parameters

| Parameter | Required | Notes |
|---|---:|---|
| `payrollMonth` | Conditional | Use `YYYY-MM`; alternative to `month` + `year` |
| `month` | Conditional | Required when `payrollMonth` is not supplied |
| `year` | Conditional | Required when `payrollMonth` is not supplied |
| `company` | No | Optional company/concern filter; omit for group-level summary |
| `majorDepartment` | No | Optional major department filter |
| `department` | No | Optional department/section filter |
| `branch` | No | Optional branch filter |
| `groupBy` | No | `company`, `majorDepartment`, `department`, `branch`; default `majorDepartment` |
| `includeUnlocked` | No | `true` or `false`; preview only. Exports always require locked data. |

## Data Sources

The module reads from:

```txt
SalaryPaymentDistribution
OtPaymentDistribution
```

The module does not create payroll data. It only summarizes existing generated payroll/payment distribution records.

## Locked Data Rule

Preview can be generated for analysis, but export is audit-ready and locked-data controlled.

Export is blocked when:

```txt
Salary Payment Distribution is missing
Salary Payment Distribution records are not locked
OT Payment Distribution records exist but are not locked
```

If no OT Payment Distribution exists, the report can still show salary/wages summary and returns a warning.

## Permissions

New permissions:

```txt
salary_summary:read
salary_summary:export
```

Initial role assignment:

| Role | Read | Export |
|---|---:|---:|
| super_admin | Yes | Yes |
| admin | Yes | Yes |
| hr | Yes | Yes |
| accounts | Yes | Yes |
| manager | Yes | No |
| employee | No | No |

## Report Center Integration

The report is registered in the Report Center catalog as:

```txt
salary_summary_report
```

Report Center export paths:

```txt
preview: /api/v1/salary-summary/preview
csv:     /api/v1/salary-summary/export/csv
excel:   /api/v1/salary-summary/export/excel
pdf:     /api/v1/salary-summary/export/pdf
```

## Output Structure

Preview returns:

```txt
payrollMonth
filters
meta
readiness
salaryAndWagesSections
overtimeSections
combinedTotals
```

Important totals:

```txt
salaryAndWages.grossAmount
salaryAndWages.netAmount
salaryAndWages.bankAndMobileAmount
salaryAndWages.cashAmount
salaryAndWages.aitAmount
salaryAndWages.loanAmount
salaryAndWages.suspenseAmount
overtime.grossAmount
overtime.bankAndMobileAmount
overtime.cashAmount
groupTotal.grossAmount
groupTotal.netAmount
groupTotal.bankAndMobileAmount
groupTotal.cashAmount
```

## Important Deduction Note

Current payroll schemas do not yet have dedicated AIT/Loan/Suspense sub-modules. The Salary Summary service maps AIT, loan and suspense from available payroll fields when present. Suspense also includes unpaid payable balance when payment split is lower than payable salary.

Future enhancement:

```txt
Dedicated AIT / Loan / Suspense deduction module or salary deduction breakdown schema
```

When that module is added, Salary Summary can directly consume those fields without changing the frontend contract.

## Local Test Commands

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run build
npm run dev
```

Then test with Postman after login token:

```txt
GET {{baseUrl}}/salary-summary/preview?month=5&year=2026&groupBy=majorDepartment
GET {{baseUrl}}/salary-summary/export/excel?month=5&year=2026&groupBy=majorDepartment
GET {{baseUrl}}/salary-summary/export/pdf?month=5&year=2026&groupBy=majorDepartment
GET {{baseUrl}}/salary-summary/export/csv?month=5&year=2026&groupBy=majorDepartment
```

Expected headers for export:

```txt
Excel: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
PDF: application/pdf
CSV: text/csv; charset=utf-8
```

## Changed Files

```txt
server/src/modules/salarySummary/salarySummary.interface.ts
server/src/modules/salarySummary/salarySummary.validation.ts
server/src/modules/salarySummary/salarySummary.service.ts
server/src/modules/salarySummary/salarySummary.export.ts
server/src/modules/salarySummary/salarySummary.controller.ts
server/src/modules/salarySummary/salarySummary.route.ts
server/src/routes/index.ts
server/src/modules/user/user.constant.ts
server/src/modules/auditLog/auditLog.interface.ts
server/src/modules/reportCenter/reportCenter.service.ts
docs/PART_B51_DEDICATED_SALARY_SUMMARY_REPORT_MODULE.md
```
