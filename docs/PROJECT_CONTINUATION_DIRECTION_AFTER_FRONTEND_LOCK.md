# CSRM Payroll System — Continuation Direction After Frontend Completion Lock

This file is a compact continuity guide for future ChatGPT conversations.

## Current Main Next Task

```txt
Part-F16.1 — Legacy Salary Import UI Test + Backend Integration Fix Pass
```

## Current Status

```txt
Backend Core Complete ✅
Backend Code-Freeze Candidate ✅
Frontend Foundation Complete ✅
Frontend Pilot-Readiness Candidate ✅
Smoke Test Passed ✅
Route Lazy Loading Done ✅
UI Premium Polish Pass Done ✅
Legacy Salary Import Backend Done ✅
Legacy Salary Import Frontend Foundation Done ✅
```

Not yet:

```txt
Final commercial production release ❌
Full UAT with company real data ❌
Deployment hardening ❌
Full ancillary finance/admin modules ❌
```

## Completed Key Parts

Backend:

```txt
Part-50.5 — Backend Completion Lock ✅
Part-B51 — Dedicated Salary Summary Report Backend Module ✅
Part-B52 — Legacy Salary Sheet Import & Archive Module ✅
Part-B52.1 — Legacy Salary Import Backend Test + Integration Fix Pass ✅
```

Frontend:

```txt
F0–F15 completed through frontend pilot-readiness/completion lock ✅
Part-F16 — Legacy Salary Import UI Foundation ✅
```

## Immediate Next

```txt
Part-F16.1 — Legacy Salary Import UI Test + Backend Integration Fix Pass
```

Primary route:

```txt
/salary/legacy-imports
```

Backend base:

```txt
/api/v1/legacy-salary-imports
```

## Important Rule

Legacy imported salary data is external/historical archive data. It must not overwrite or update native payroll calculation, salary sheet, salary statement, or salary payment distribution.

## Upload Required in New Chat

Upload the latest GitHub-downloaded full repo ZIP.

Useful optional upload:
A real/sanitized .xlsx salary sheet sample from the current/old payroll software for testing parse-excel.

## Important Folders to Inspect

```txt
client/src/features/legacy-salary-import/
server/src/modules/legacySalaryImport/
client/src/config/
client/src/app/router/
docs/
scripts/frontend-smoke-check.mjs
```

## Future Reserved Modules

```txt
Part-B53 — Management Remuneration & Executive Compensation Module
Part-B54 — Ancillary Bill & Voucher Engine Foundation
Part-B55 — Employee Loan & Installment Deduction Module
Part-B56 — Suspense Import & Salary Adjustment Module
Part-B57 — Rod Bachai Bill Module
Part-B58 — Pharmacy / Medical Bill Module
Part-B59 — Sales Commission Module
Part-B60 — Supplier Bill + Cheque Issue Register Foundation
Part-B61 — Dining Monthly Expense Summary Module
Part-B62 — Facility Maintenance / AC Servicing Record Module
```

Do not mix these randomly into core payroll.

## UI Direction

Premium ERP UI:
clean white layout, soft shadows, rounded cards/tables, sidebar/topbar, smooth responsive behavior, modern drawers/forms/report preview/export UI.

## Development Rules

Use full updated files, exact paths, patch ZIP, verify commands, lint/build, browser/Postman test, and Git commands.
