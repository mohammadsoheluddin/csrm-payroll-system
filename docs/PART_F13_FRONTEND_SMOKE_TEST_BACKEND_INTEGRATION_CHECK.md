# Part-F13 — Frontend Smoke Test + Backend Integration Check

## Status

This part is a verification/checkpoint part. It does not introduce business UI code and does not change backend logic.

## Goal

Validate that the frontend foundation from Part-F1 through Part-F12.2 is still stable after adding:

- Auth + protected routes
- Master Data screens
- Employee Directory
- Attendance + Leave screens
- Payroll + Salary screens
- Reports + Export screens
- Audit Log + RBAC Audit screens
- Global responsive UI polish

## What this smoke test confirms

- Git working tree is clean before and after test.
- Frontend TypeScript build passes.
- Frontend ESLint passes.
- Backend TypeScript build passes.
- Frontend dev server starts.
- Backend dev server starts.
- Protected route redirect behavior works.
- Main feature routes load without crashing.
- Permission/sidebar guards still work.
- Backend no-data responses show clean UI states.
- Report/export pages use route-note-safe backend endpoints.
- UI responsiveness remains acceptable across desktop/tablet/mobile widths.

## Required terminals

Use two VS Code terminals.

### Terminal 1 — Backend

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run dev
```

Expected:

```txt
MongoDB connected successfully
Server running on port 5000
```

### Terminal 2 — Frontend

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run dev
```

Expected:

```txt
Local: http://localhost:5173/
```

## Pre-test commands

From project root:

```bash
cd /e/Projects/CSRM-Payroll-System

git status
git log --oneline -8
ls *.zip
```

Expected:

```txt
nothing to commit, working tree clean
```

If `ls *.zip` shows patch ZIP files, remove them before Git commit:

```bash
rm -f *.zip
```

## Required file verification

```bash
cd /e/Projects/CSRM-Payroll-System

test -f client/src/features/master-data/pages/MasterDataFoundationPage.tsx && echo "Master Data OK"
test -f client/src/features/employees/pages/EmployeeDirectoryPage.tsx && echo "Employee Directory OK"
test -f client/src/features/attendance-leave/pages/AttendanceRegisterPage.tsx && echo "Attendance OK"
test -f client/src/features/attendance-leave/pages/LeaveApplicationsPage.tsx && echo "Leave OK"
test -f client/src/features/payroll/pages/PayrollRunPage.tsx && echo "Payroll OK"
test -f client/src/features/reports/pages/ReportCenterPage.tsx && echo "Reports OK"
test -f client/src/features/audit/pages/AuditLogsPage.tsx && echo "Audit OK"
test -f client/src/features/audit/pages/RbacAuditPage.tsx && echo "RBAC Audit OK"
test -f docs/PART_F12_2_GLOBAL_UI_RESPONSIVENESS_AND_PREMIUM_POLISH_PASS.md && echo "UI polish doc OK"
test -f docs/PART_F13_FRONTEND_SMOKE_TEST_BACKEND_INTEGRATION_CHECK.md && echo "F13 doc OK"
```

Expected:

```txt
Master Data OK
Employee Directory OK
Attendance OK
Leave OK
Payroll OK
Reports OK
Audit OK
RBAC Audit OK
UI polish doc OK
F13 doc OK
```

## Build verification

### Frontend

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

Vite chunk-size warning is acceptable for now. It is not a build failure. Route-based lazy loading/code splitting can be handled in a later optimization part.

### Backend

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run build
```

Expected:

```txt
No TypeScript error
```

## Browser route smoke test

Run backend and frontend together, then test these routes.

### Auth

```txt
http://localhost:5173/login
http://localhost:5173/dashboard
http://localhost:5173/forbidden
http://localhost:5173/session-expired
```

Expected:

- Login page opens.
- Dashboard redirects to login if not authenticated.
- Dashboard opens after valid login.
- Header shows user/role after login.
- Logout works.
- No infinite `Checking session` state.
- No CORS error in Console.

### Master Data

```txt
http://localhost:5173/masters/companies
http://localhost:5173/masters/branches
http://localhost:5173/masters/major-departments
http://localhost:5173/masters/departments
http://localhost:5173/masters/designations
http://localhost:5173/masters/company-bank-accounts
```

Expected:

- Screens load.
- Table/search/filter UI appears.
- Create/edit buttons appear only for permitted roles.
- Backend validation errors show inside form panel.

### Employee

```txt
http://localhost:5173/employees
```

Expected:

- Employee list loads or clean empty/error state appears.
- Profile drawer opens.
- Create/edit/lifecycle/delete/restore actions respect permissions.

### Attendance + Leave

```txt
http://localhost:5173/attendance
http://localhost:5173/leave
```

Expected:

- Attendance and leave lists load or clean empty/error state appears.
- Leave approval dialog appears only for permitted users.
- Leave balance snapshot works when employee/year is selected and backend has data.

### Payroll + Salary

```txt
http://localhost:5173/payroll
http://localhost:5173/salary/structures
http://localhost:5173/salary/sheets
http://localhost:5173/salary/statements
http://localhost:5173/salary/payment-distributions
```

Expected:

- Payroll and salary screens load.
- Generate/process/approve/lock/export actions show only for permitted users.
- Core payroll generate does not send unsupported `allowCashFallback`.
- Payment distribution keeps cash fallback where supported.

### Reports + Export

```txt
http://localhost:5173/reports/center
http://localhost:5173/reports/salary-summary
http://localhost:5173/bank-sheets
http://localhost:5173/reports/month-end-control
http://localhost:5173/reports/layout-standards
```

Expected:

- Report pages load.
- Salary Summary page connects to B51 backend route.
- Export buttons are permission-aware.
- Backend no-data responses show clean error/empty state.
- Do not call unsafe base routes like `/report-center` directly.

### Audit + RBAC

```txt
http://localhost:5173/audit/logs
http://localhost:5173/rbac/audit
```

Expected:

- Audit log list loads.
- Audit detail drawer opens safely.
- RBAC summary/coverage/matrix previews load.
- Unauthorized users are blocked by permission guard.

## Responsive UI smoke test

Use browser DevTools responsive mode.

Check widths:

```txt
1440px desktop
1024px laptop/tablet landscape
768px tablet
390px mobile
```

Expected:

- Sidebar is usable.
- Mobile drawer opens/closes smoothly.
- Header does not overflow.
- Tables scroll horizontally when necessary.
- Filter toolbar wraps cleanly.
- Buttons remain clickable.
- Drawers/modals remain readable.
- Loading/empty/error states look polished.

## Smoke test issue log template

Use this format when reporting any issue:

```txt
Route:
Role:
Action:
Expected:
Actual:
Console error:
Network request URL:
Network status code:
Screenshot:
```

## F13 acceptance criteria

Part-F13 is accepted when:

```txt
Git status clean ✅
Frontend lint passed ✅
Frontend build passed ✅
Backend build passed ✅
Backend dev server runs ✅
Frontend dev server runs ✅
Login/protected routes work ✅
Main feature routes load ✅
No infinite session check ✅
No CORS error ✅
No red runtime error in console ✅
Responsive behavior acceptable ✅
```

## Next recommended part

```txt
Part-F14 — Route Lazy Loading + Frontend Performance Optimization
```

Alternative backend reserved part:

```txt
Part-B52 — Legacy Salary Sheet Import & Archive Module
```
