# Part-F13.1 — Frontend Smoke Test Fix Pass

## Status

Completed as a non-invasive smoke-test hardening pass.

This part does **not** change backend business logic and does **not** change frontend feature/business screens. It improves the smoke-test helper and documents the accepted verification standard after Part-F13.

## Why this pass exists

Part-F13 introduced the frontend smoke-test checklist. This fix pass hardens the helper script so the smoke test is more useful and less misleading.

## What changed

- Smoke helper now validates that frontend routes return the Vite/React SPA shell.
- Frontend route probes now check for:
  - reachable route URL
  - HTML response
  - root React mount element
- Backend route probes now use explicit accepted status lists.
- Optional authenticated `/users/me` probe added through `API_AUTH_TOKEN`.
- Better terminal output with area, route, status, URL, and failure reason.
- Summary section added with total/passed/failed count.
- Result template updated for F13.1.

## Updated file

```txt
scripts/frontend-smoke-check.mjs
docs/FRONTEND_SMOKE_TEST_RESULT_TEMPLATE.md
docs/PART_F13_1_FRONTEND_SMOKE_TEST_FIX_PASS.md
```

## Apply patch

```bash
cd /e/Projects/CSRM-Payroll-System

unzip -o csrm-payroll-part-f13-1-frontend-smoke-test-fix-pass-patch.zip
```

## Verify files

```bash
cd /e/Projects/CSRM-Payroll-System

test -f scripts/frontend-smoke-check.mjs && echo "Smoke helper script OK"
test -f docs/FRONTEND_SMOKE_TEST_RESULT_TEMPLATE.md && echo "Smoke result template OK"
test -f docs/PART_F13_1_FRONTEND_SMOKE_TEST_FIX_PASS.md && echo "F13.1 doc OK"
```

Expected:

```txt
Smoke helper script OK
Smoke result template OK
F13.1 doc OK
```

## Standard test commands

### Frontend build

```bash
cd /e/Projects/CSRM-Payroll-System/client

npm run lint
npm run build
```

Expected:

```txt
npm run lint  -> no error
npm run build -> ends with ✓ built in ...
```

The Vite chunk-size warning is acceptable for now. It is not a build failure.

### Backend build

```bash
cd /e/Projects/CSRM-Payroll-System/server

npm run build
```

Expected:

```txt
No TypeScript error
```

## Run backend and frontend

### Terminal 1 — Backend

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run dev
```

### Terminal 2 — Frontend

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run dev
```

## Run smoke helper

From project root:

```bash
cd /e/Projects/CSRM-Payroll-System

node scripts/frontend-smoke-check.mjs
```

Expected result:

```txt
Smoke helper completed successfully.
```

## Optional authenticated API probe

If you want to verify `/users/me`, provide a valid access token:

```bash
API_AUTH_TOKEN="paste_access_token_here" node scripts/frontend-smoke-check.mjs
```

This does not mutate data.

## Manual browser routes to verify

```txt
/login
/dashboard
/masters/companies
/masters/branches
/masters/major-departments
/masters/departments
/masters/designations
/masters/company-bank-accounts
/employees
/attendance
/leave
/payroll
/salary/structures
/salary/sheets
/salary/statements
/salary/payment-distributions
/reports/center
/reports/salary-summary
/bank-sheets
/reports/month-end-control
/reports/layout-standards
/audit/logs
/rbac/audit
```

## Acceptance checklist

- No infinite `Checking session`.
- No CORS error.
- No red runtime error in browser console.
- Protected routes redirect correctly when logged out.
- Logged-in permitted users can access allowed screens.
- Permission-denied users see clean forbidden/inline permission UI.
- Tables, drawers, buttons, filters, empty states, and error states remain usable.
- Main routes render on desktop/tablet/mobile widths.

## Git commands

```bash
cd /e/Projects/CSRM-Payroll-System

rm -f csrm-payroll-part-f13-1-frontend-smoke-test-fix-pass-patch.zip

git add scripts/frontend-smoke-check.mjs \
docs/FRONTEND_SMOKE_TEST_RESULT_TEMPLATE.md \
docs/PART_F13_1_FRONTEND_SMOKE_TEST_FIX_PASS.md

git commit -m "test(frontend): harden smoke test verification"

git push
```

## Next recommended part

```txt
Part-F14 — Route Lazy Loading + Frontend Performance Optimization
```

Reason: build is passing but the frontend bundle is growing. Route-level code splitting should be done before adding more heavy screens.
