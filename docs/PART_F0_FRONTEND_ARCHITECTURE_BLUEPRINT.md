# Part-F0 — Frontend Architecture Blueprint & Folder Structure

Last Updated: 2026-05-12  
Project: CSRM Payroll System  
Status: Frontend Architecture Blueprint Finalized / No Frontend Business Code Started

---

## 1. Decision

The backend core is locked as a code-freeze candidate and is ready for frontend integration. Frontend development may start from the existing `client/` folder, but random UI coding should not start before the frontend foundation is created in the planned order.

Backend status accepted for frontend start:

```txt
Backend Core Complete
Backend Code-Freeze Candidate
Ready for Frontend Architecture and Client-Side Development
Not yet final commercial production release
```

Frontend start rule:

```txt
Do not expand backend randomly.
Only backend bug fixes, frontend integration compatibility patches, route/query corrections,
validation corrections, permission corrections, and documentation sync should be allowed.
```

---

## 2. Inspected Backend/Frontend References

The Part-F0 architecture is based on these project files and docs:

```txt
docs/BACKEND_COMPLETION_LOCK.md
docs/PART_50_5_BACKEND_COMPLETION_LOCK.md
docs/BACKEND_SMOKE_TEST_FINAL_RESULT.md
docs/BACKEND_KNOWN_ROUTE_AND_DATA_NOTES.md
docs/FRONTEND_START_READINESS_CHECKLIST.md
docs/FRONTEND_BACKEND_INTEGRATION_MAP.md
docs/API_ROUTE_CATALOG.md
docs/BACKEND_MODULE_SUMMARY.md
docs/BACKEND_PERMISSION_ENDPOINT_MATRIX.md
docs/BACKEND_TESTING_MASTER_GUIDE.md
docs/RBAC_PERMISSION_MATRIX.md
docs/PROJECT_CONTINUITY_BACKEND_COMPLETION_APPEND.md
docs/FUTURE_FRONTEND_ARCHITECTURE.md
server/src/routes/index.ts
server/src/modules/user/user.constant.ts
server/src/modules/auth/auth.controller.ts
server/src/modules/user/user.controller.ts
client/package.json
client/src/App.tsx
client/src/main.tsx
```

Important finding:

```txt
client/ already exists as a Vite React scaffold.
It is not yet the CSRM business frontend.
Part-F1 should clean/replace the starter UI and install the approved frontend dependencies.
```

---

## 3. Final Frontend Stack

Use this stack for the first production-oriented frontend phase:

| Area | Selected Tool |
| --- | --- |
| Core UI | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Server State | TanStack Query |
| Form State | React Hook Form |
| Form Validation | Zod |
| HTTP Client | Axios |
| Icons | Lucide React |
| Charts | Recharts |
| UI Building Blocks | shadcn-style reusable components |
| Toast/Feedback | Sonner or equivalent lightweight toast layer |
| Class Utilities | clsx + tailwind-merge |
| Date Utilities | date-fns |
| Optional State Store | Zustand for auth/theme/sidebar/dashboard preferences |

Decision:

```txt
Use feature-based architecture, not page-only architecture.
Keep business features isolated.
Keep shared UI components reusable.
Keep backend route/service integration outside page components.
```

---

## 4. Frontend Architecture Principles

### 4.1 Backend Remains Source of Truth

Frontend permission guards are for user experience only. Backend RBAC remains the real security layer.

### 4.2 API Calls Must Not Guess Routes

Frontend must follow backend docs and known route notes. Some report/system routes do not support base `GET /` and must call exact sub-routes.

### 4.3 Reusable ERP Components First

Build reusable components before building many screens:

```txt
Layout
Sidebar
DataTable
FilterBar
FormSectionCard
StatusBadge
ExportButtonGroup
SoftDeleteModal
RestoreModal
AuditTrailDrawer
ApprovalTimeline
ReportPreviewPanel
```

### 4.4 Feature Folder Owns Feature Logic

Each feature should contain its own pages, API service, schemas, types, hooks, and components.

### 4.5 Reports Must Use a Standard Pattern

Every report/export page should follow:

```txt
Filter -> Preview -> Export PDF/Excel/CSV -> Print -> Audit/History visibility where available
```

---

## 5. Client Folder Structure

The frontend should be organized like this:

```txt
client/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers/
│   │   │   ├── AppProviders.tsx
│   │   │   ├── QueryProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   └── router/
│   │       ├── router.tsx
│   │       ├── routeConfig.tsx
│   │       └── ProtectedRoute.tsx
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── SidebarItem.tsx
│   │   ├── data-table/
│   │   │   ├── DataTable.tsx
│   │   │   ├── DataTablePagination.tsx
│   │   │   └── DataTableToolbar.tsx
│   │   ├── forms/
│   │   │   ├── FormSectionCard.tsx
│   │   │   ├── FieldErrorText.tsx
│   │   │   └── RequiredMark.tsx
│   │   ├── feedback/
│   │   │   ├── ErrorState.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── modals/
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── SoftDeleteModal.tsx
│   │   │   └── RestoreModal.tsx
│   │   ├── reports/
│   │   │   ├── ExportButtonGroup.tsx
│   │   │   ├── ReportFilterBar.tsx
│   │   │   └── ReportPreviewPanel.tsx
│   │   ├── audit/
│   │   │   ├── AuditTrailDrawer.tsx
│   │   │   └── ApprovalTimeline.tsx
│   │   └── guards/
│   │       ├── Can.tsx
│   │       └── PermissionGuard.tsx
│   ├── config/
│   │   ├── env.ts
│   │   ├── permissions.ts
│   │   ├── roles.ts
│   │   ├── routePaths.ts
│   │   └── sidebar.config.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/auth.api.ts
│   │   │   ├── components/LoginForm.tsx
│   │   │   ├── hooks/useAuth.ts
│   │   │   ├── pages/LoginPage.tsx
│   │   │   ├── schemas/auth.schema.ts
│   │   │   └── types/auth.types.ts
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── master-data/
│   │   │   ├── companies/
│   │   │   ├── branches/
│   │   │   ├── major-departments/
│   │   │   ├── departments/
│   │   │   ├── designations/
│   │   │   └── company-bank-accounts/
│   │   ├── employees/
│   │   │   ├── employee-directory/
│   │   │   ├── employee-profile/
│   │   │   ├── employee-bank-info/
│   │   │   ├── employee-movements/
│   │   │   └── employee-bulk-import/
│   │   ├── attendance/
│   │   │   ├── attendance-register/
│   │   │   ├── attendance-import/
│   │   │   └── attendance-finalization/
│   │   ├── leave/
│   │   │   ├── leave-applications/
│   │   │   ├── leave-approval/
│   │   │   ├── leave-balances/
│   │   │   └── holidays/
│   │   ├── payroll/
│   │   │   ├── payroll-run/
│   │   │   ├── payroll-history/
│   │   │   ├── payroll-approval/
│   │   │   └── payroll-reports/
│   │   ├── salary/
│   │   │   ├── salary-structure/
│   │   │   ├── salary-sheets/
│   │   │   ├── salary-statements/
│   │   │   └── salary-payment-distributions/
│   │   ├── time-bill/
│   │   │   ├── time-bills/
│   │   │   ├── ot-statements/
│   │   │   └── ot-payment-distributions/
│   │   ├── bonus/
│   │   │   ├── bonus-sheets/
│   │   │   ├── bonus-statements/
│   │   │   └── bonus-payment-distributions/
│   │   ├── bank-sheets/
│   │   ├── reports/
│   │   │   ├── report-center/
│   │   │   ├── report-layout-standards/
│   │   │   └── month-end-process-control/
│   │   ├── audit/
│   │   ├── rbac/
│   │   └── settings/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── apiClient.ts
│   │   │   ├── apiError.ts
│   │   │   ├── apiResponse.ts
│   │   │   └── downloadFile.ts
│   │   ├── auth/
│   │   │   ├── jwt.ts
│   │   │   ├── tokenStore.ts
│   │   │   └── session.ts
│   │   ├── query/
│   │   │   ├── queryClient.ts
│   │   │   └── queryKeys.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── formatDate.ts
│   │       ├── formatMoney.ts
│   │       └── object.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── theme.store.ts
│   │   ├── sidebar.store.ts
│   │   └── dashboard.store.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── themes.css
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── common.types.ts
│   │   ├── permission.types.ts
│   │   └── route.types.ts
│   └── main.tsx
├── .env.example
├── package.json
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 6. Frontend Route Map

### 6.1 Public Routes

| Frontend Route | Screen | Backend/API Relation |
| --- | --- | --- |
| `/login` | Login | `POST /auth/login` |
| `/session-expired` | Session expired | Auth state only |
| `/forbidden` | Forbidden access | 403 fallback |
| `*` | Not found | Frontend route fallback |

### 6.2 Protected Core Routes

| Frontend Route | Screen | Required Permission |
| --- | --- | --- |
| `/dashboard` | Dashboard | logged in |
| `/users` | User List | `user:read` |
| `/users/:id` | User Details | `user:read` |
| `/settings/profile` | My Profile | logged in |
| `/settings/theme` | Theme Settings | logged in |

### 6.3 Master Data Routes

| Frontend Route | Screen | Required Permission |
| --- | --- | --- |
| `/masters/companies` | Company/Concern List | `company:read` |
| `/masters/branches` | Branch List | `branch:read` |
| `/masters/major-departments` | Major Department List | `major_department:read` |
| `/masters/departments` | Department List | `department:read` |
| `/masters/designations` | Designation List | `designation:read` |
| `/masters/company-bank-accounts` | Company Bank Account List | `company_bank_account:read` |

### 6.4 Employee / HR Routes

| Frontend Route | Screen | Required Permission |
| --- | --- | --- |
| `/employees` | Employee Directory | `employee:read` |
| `/employees/create` | Create Employee | `employee:manage` |
| `/employees/:id` | Employee Profile | `employee:read` |
| `/employees/:id/edit` | Edit Employee | `employee:manage` |
| `/employee-bank-infos` | Employee Payment Info | `employee_bank_info:read` |
| `/employee-movements` | Employee Movement | `employee_movement:read` |
| `/employee-bulk-imports` | Bulk Import Wizard | `employee_bulk_import:read` |

### 6.5 Attendance / Leave Routes

| Frontend Route | Screen | Required Permission |
| --- | --- | --- |
| `/attendance/register` | Attendance Register | `attendance:read` |
| `/attendance/manual-entry` | Manual Attendance Entry | `attendance:manage` |
| `/attendance/imports` | Attendance Import | `attendance_import:read` |
| `/attendance/finalizations` | Attendance Finalization | `attendance_finalization:read` |
| `/leave/applications` | Leave Applications | `leave:read` |
| `/leave/approval` | Leave Approval Queue | `leave:approve` |
| `/leave/balances` | Leave Balance/Ledger | `leave_balance:read` |
| `/leave/holidays` | Holiday Calendar | `holiday:read` |

### 6.6 Payroll / Salary Routes

| Frontend Route | Screen | Required Permission |
| --- | --- | --- |
| `/payroll/run` | Payroll Generate/Run | `payroll:process` |
| `/payroll/history` | Payroll List/History | `payroll:read` |
| `/payroll/approval` | Payroll Approval | `payroll:approve` |
| `/salary/structures` | Salary Structure | `salary_structure:read` |
| `/salary/sheets` | Salary Sheet | `salary_sheet:read` |
| `/salary/statements` | Salary Statement | `salary_statement:read` |
| `/salary/payment-distributions` | Salary Payment Distribution | `salary_payment_distribution:read` |

### 6.7 Time Bill / OT / Bonus Routes

| Frontend Route | Screen | Required Permission |
| --- | --- | --- |
| `/time-bill/time-bills` | Time Bill | `time_bill:read` |
| `/time-bill/ot-statements` | OT Statement | `ot_statement:read` |
| `/time-bill/ot-payment-distributions` | OT Payment Distribution | `ot_payment_distribution:read` |
| `/bonus/sheets` | Bonus Sheet | `bonus_sheet:read` |
| `/bonus/statements` | Bonus Statement | `bonus_statement:read` |
| `/bonus/payment-distributions` | Bonus Payment Distribution | `bonus_payment_distribution:read` |

### 6.8 Report / Audit / System Routes

| Frontend Route | Screen | Required Permission |
| --- | --- | --- |
| `/reports/report-center` | Report Center | `report_center:read` |
| `/reports/payroll-monthly` | Payroll Monthly Report | `payroll_report:read` |
| `/reports/bank-sheets` | Bank Sheet Preview/Export | `bank_sheet:read` |
| `/reports/report-layouts` | Report Layout Standards | `report_layout_standard:read` |
| `/system/month-end` | Month-End Control Panel | `month_end_process_control:read` |
| `/system/audit-logs` | Audit Log Viewer | `audit_log:read` |
| `/system/rbac-audit` | RBAC Audit Dashboard | `rbac_audit:read` |

---

## 7. Sidebar Structure

Recommended sidebar groups:

```txt
Dashboard
Master Setup
  Companies / Concerns
  Branches
  Major Departments
  Departments
  Designations
  Company Bank Accounts
HR & Employee
  Employee Directory
  Employee Payment Info
  Employee Movement
  Employee Bulk Import
Attendance & Leave
  Attendance Register
  Attendance Import
  Attendance Finalization
  Leave Applications
  Leave Approval
  Leave Balance / Ledger
  Holiday Calendar
Payroll & Salary
  Salary Structure
  Payroll Run
  Payroll History
  Payroll Approval
  Salary Sheet
  Salary Statement
  Salary Payment Distribution
Time Bill / OT
  Time Bill
  OT Statement
  OT Payment Distribution
Bonus
  Bonus Sheet
  Bonus Statement
  Bonus Payment Distribution
Reports & Exports
  Report Center
  Payroll Monthly Report
  Bank Sheet
  Report Layout Standard
System & Audit
  Month-End Control
  Audit Logs
  RBAC Audit
Settings
  Profile
  Theme / Display
```

Sidebar visibility rule:

```txt
A group is visible if at least one child item is visible.
A child item is visible if user has the required permission.
Admin and super_admin receive all permissions.
```

---

## 8. Permission Guard Strategy

Frontend permission guard layers:

```txt
1. Auth guard: is user logged in?
2. Route guard: does route require permission?
3. Sidebar guard: should menu item be visible?
4. Component guard: should create/edit/delete/export/approve button be visible?
5. Backend guard: final security check from backend
```

Recommended components/utilities:

```txt
<ProtectedRoute />
<PermissionRoute anyOf={["employee:read"]} />
<Can anyOf={["employee:manage"]}>Create Employee</Can>
hasPermission(userPermissions, "payroll:process")
hasAnyPermission(userPermissions, ["payroll:read", "payroll:process"])
hasAllPermissions(userPermissions, ["attendance_finalization:read", "attendance_finalization:lock"])
```

Important backend observation:

```txt
/auth/login returns accessToken only.
refreshToken is set as httpOnly cookie.
/users/me returns the current user profile, but not a permission array.
```

Therefore, first frontend implementation should:

```txt
Decode accessToken for userId, email, role, employeeId.
Call /users/me for profile details.
Build frontend permissions from role using a synced role-permission map.
Keep this map in client/src/config/permissions.ts.
Treat backend server/src/modules/user/user.constant.ts as source for syncing.
```

Later improvement:

```txt
Backend may add /users/me to include permissions.
If added later, frontend can use server-provided permissions instead of local mapping.
```

---

## 9. API Client Strategy

### 9.1 Base URL

Use environment variable:

```txt
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 9.2 Axios Client

Recommended flow:

```txt
apiClient
-> request interceptor adds Authorization: Bearer accessToken
-> withCredentials true for refresh cookie
-> response interceptor handles 401
-> refresh once via POST /auth/refresh-token
-> retry original request after refresh
-> logout if refresh fails
```

### 9.3 Backend Response Shape

Success response:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "meta": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorSources": [
    {
      "path": "body.company",
      "message": "Invalid company ID"
    }
  ]
}
```

Frontend behavior:

```txt
400 -> show validation errors, map errorSources to fields where possible
401 -> try refresh token once; if failed, redirect session expired/login
403 -> show forbidden page or disabled action message
404 -> show not found, but verify route note first for report/system routes
409 -> show business-rule conflict modal/message
500 -> show generic system error with retry option
```

---

## 10. Auth/Token Handling Strategy

Recommended first phase:

```txt
accessToken: memory store, optionally mirrored to localStorage only if needed for dev reload stability
refreshToken: httpOnly cookie from backend
axios withCredentials: true
on app boot: try refresh-token, then /users/me
on logout: POST /auth/logout, clear access token and auth store
```

Practical note:

```txt
Backend currently uses app.use(cors()) and sets refreshToken cookie without sameSite/maxAge options.
If refresh cookie does not work from Vite frontend during integration,
handle it as a controlled backend integration patch later, not as random backend expansion.
```

---

## 11. Dashboard Widget Customization Strategy

Dashboard should start simple and grow safely.

### 11.1 Widget Types

Initial widgets:

```txt
Employee summary
Attendance today
Pending leave
Payroll status
Salary payment summary
Pending approvals
Month-end lock status
Department-wise employee count
Attendance trend
Leave balance alert
Payment distribution summary
Audit risk alerts
System health
```

### 11.2 Widget Configuration

Use a frontend config-driven model:

```txt
widgetKey
label
requiredPermission
component
size
order
defaultVisible
rolePreset
```

### 11.3 Persistence

Phase 1:

```txt
localStorage dashboard preferences per userId
```

Phase 2:

```txt
backend saved dashboard preferences if business requires multi-device sync
```

---

## 12. Theme Strategy

Must support:

```txt
light mode
dark mode
future corporate blue theme
future compact ERP theme
future modern dashboard theme
table density: compact / comfortable
```

Implementation direction:

```txt
Use Tailwind CSS + CSS variables.
Store theme mode in localStorage.
Use data-theme or class strategy on html/body.
Keep calculation/report content independent from theme.
```

Initial theme tokens:

```txt
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--secondary
--muted
--border
--destructive
--success
--warning
```

---

## 13. Reusable Component Strategy

### 13.1 DataTable

Required capabilities:

```txt
server-side pagination
search
filter
sort placeholder
row actions
status badge
permission-based action buttons
deleted list support
density compact/comfortable
export button slot
```

### 13.2 Form Components

Required capabilities:

```txt
React Hook Form integration
Zod schema validation
backend errorSources field mapping
section cards
required markers
controlled select/date/month-year inputs
submit/cancel buttons
```

### 13.3 Modal Components

Required modals:

```txt
ConfirmDialog
SoftDeleteModal with deleteReason
RestoreModal with restoreReason
BusinessConflictModal for 409
```

### 13.4 Audit Components

Required components:

```txt
AuditTrailDrawer
ApprovalTimeline
RiskLevelBadge
ActorBadge
```

### 13.5 Report Components

Required components:

```txt
ReportFilterBar
MonthYearPicker
CompanyFilter
DepartmentFilter
ReportPreviewPanel
ExportButtonGroup
PrintButton
DownloadProgressState
```

---

## 14. Report/PDF/Excel/CSV Download UI Pattern

Standard report page layout:

```txt
Page title
Filter card
Preview button
Report summary cards
Report preview table/panel
Export button group
Print button
Error/conflict message area
```

Download behavior:

```txt
Use axios responseType: blob
Infer filename from Content-Disposition if available
Fallback filename: module-report-month-year.extension
Show loading state per export type
Show 400/409 messages as readable business messages
```

Important exact routes from backend known notes:

```http
GET /report-center/catalog
GET /report-center/dashboard?company={companyId}&month=5&year=2026
GET /report-center/readiness?company={companyId}&month=5&year=2026
GET /report-center/quick-links?company={companyId}&month=5&year=2026
GET /report-center/export-route?company={companyId}&reportType=salary_sheet
GET /report-center/saved-configs

GET /month-end-process-control/status?company={companyId}&month=5&year=2026
GET /month-end-process-control/checklist?company={companyId}&month=5&year=2026

GET /rbac-audit/summary
GET /rbac-audit/modules
GET /rbac-audit/permissions
GET /rbac-audit/roles
GET /rbac-audit/matrix
GET /rbac-audit/coverage
GET /rbac-audit/route-coverage

GET /payroll-reports/monthly-report?month=5&year=2026&company={companyId}
GET /payroll-reports/monthly-report/export/csv?month=5&year=2026&company={companyId}
GET /payroll-reports/monthly-report/export/excel?month=5&year=2026&company={companyId}
GET /payroll-reports/payslip/{employeeId}
GET /payroll-reports/payslip/{employeeId}/pdf

GET /bank-sheets/salary/preview?month=5&year=2026&company={companyId}
GET /bank-sheets/salary/export/excel?month=5&year=2026&company={companyId}
GET /bank-sheets/salary/export/pdf?month=5&year=2026&company={companyId}
```

Query-required endpoints:

```http
GET /salary-payment-distributions?month=5&year=2026
GET /ot-payment-distributions?month=5&year=2026
GET /bonus-statements?bonusMonth=2026-05
GET /bonus-payment-distributions?bonusMonth=2026-05
```

---

## 15. Frontend Development Order

Follow this order strictly:

```txt
Part-F1 — Frontend Project Setup
Part-F2 — Layout + Routing + Theme Foundation
Part-F3 — Auth + Token + Protected Routes
Part-F4 — API Client + Error Handling
Part-F5 — Sidebar + Permission Guard
Part-F6 — Dashboard Shell + Widget System
Part-F7 — Master Data Foundation Screens
Part-F8 — Employee Directory + Profile Foundation
Part-F9 — Attendance + Leave Foundation
Part-F10 — Payroll + Salary Foundation
Part-F11 — Reports + Export Foundation
Part-F12 — Audit Log + RBAC Audit Screens
Part-F13 — Frontend Smoke Test + Backend Integration Check
Part-F14 — UI Polish + Responsive ERP Layout
Part-F15 — Pilot Readiness Checklist
```

Do not jump into random module pages before Auth/Layout/API/Permission foundation is completed.

---

## 16. Part-F1 Start Scope

Part-F1 should only do project setup and dependency installation.

Part-F1 should include:

```txt
clean default Vite demo UI
install Tailwind CSS
install React Router
install TanStack Query
install React Hook Form
install Zod
install Axios
install Lucide React
install Recharts
install class utilities
create base folder structure
create env example
create empty placeholder route/pages only if necessary
run build/lint
```

Part-F1 should not implement full business modules yet.

---

## 17. Acceptance Checklist for Part-F0

Part-F0 is complete when:

```txt
frontend stack finalized
client folder structure finalized
route map finalized
sidebar structure finalized
permission guard strategy finalized
API client strategy finalized
auth/token handling strategy finalized
dashboard widget customization strategy finalized
light/dark/multi-theme strategy finalized
reusable component strategy finalized
report/export UI pattern finalized
frontend development order finalized
frontend architecture docs created
no random frontend UI coding started
```
