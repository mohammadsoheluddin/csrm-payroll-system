# NEXT CHAT PROMPT — CSRM Payroll System Frontend + Legacy Salary Import Continuation

Use this prompt at the beginning of the next ChatGPT conversation.

---

## Project Identity

We are continuing my long-running project: **CSRM Payroll System**.

My name is **Sohel**. I am an HR/Admin professional and I am building this payroll/HR software step by step with ChatGPT.

This is not a generic payroll app. It is being built for a real heavy-industry company environment with CSRM/TSL-style payroll, HR, attendance, leave, salary, reporting, approval, audit, export, and future finance/admin-adjacent modules.

---

## Very Important Instruction for the Assistant

Before giving any code:

1. Inspect the uploaded latest project ZIP first.
2. Read the important docs from the repo.
3. Do not guess file structure blindly.
4. Give **full updated files**, not snippets.
5. Mention exact file paths.
6. Use patch ZIP style when possible so I can apply by command:
   ```bash
   unzip -o PATCH_FILE_NAME.zip
   ```
7. Give verify commands, lint/build commands, browser test steps, and Git commands.
8. Do not randomly change backend architecture or database approach.
9. Do not start random new modules without checking the current project state.
10. Keep the frontend UI consistent with the locked premium ERP design direction.

---

## Repository / Project Root Structure

Expected project root:

```txt
CSRM-Payroll-System/
├── server/
├── client/
├── docs/
├── postman/
├── scripts/
└── README.md
```

Backend stack:

```txt
Node.js
Express.js
TypeScript
MongoDB
Mongoose
JWT Auth
RBAC / permissions
Zod validation
Postman
```

Frontend stack:

```txt
React
TypeScript
Vite
Tailwind CSS
React Router
TanStack Query
React Hook Form
Zod
Axios
Lucide React
Recharts
Zustand
shadcn-style reusable component direction
```

---

## Current Overall Status

Backend:

```txt
Backend Core Complete ✅
Backend Code-Freeze Candidate ✅
Commercial production release ❌ not yet
```

Frontend:

```txt
Frontend foundation complete ✅
Frontend pilot-readiness candidate ✅
Smoke test passed ✅
Route lazy loading/performance optimization done ✅
UI design standard locked ✅
Commercial production release ❌ not yet
```

Important: The project is now suitable for internal pilot validation and further module expansion, but not final commercial release yet.

---

## Completed Frontend Parts

```txt
Part-F0   — Frontend Architecture Blueprint & Folder Structure ✅
Part-F1   — Frontend Project Setup ✅
Part-F2   — Layout + Routing + Theme Foundation ✅
Part-F3   — Auth + Token + Protected Routes ✅
Part-F3.1 — Auth CORS + Session Bootstrap Hotfix ✅
Part-F4   — API Client + Error Handling Foundation ✅
Part-F4.1 — Frontend UI Reference Lock & Design Standard ✅
Part-F5   — Sidebar Permission Filtering + Permission-Wise UI Guard ✅
Part-F6   — Dashboard Widget Customization + Role-Based Dashboard Foundation ✅
Part-F7   — Master Data Foundation Screens ✅
Part-F7.1 — Master Data UI Test + Backend Integration Fix Pass ✅
Part-F8   — Employee Directory + Profile Foundation ✅
Part-F8.1 — Employee Directory UI Test + Backend Integration Fix Pass ✅
Part-F9   — Attendance + Leave Foundation Screens ✅
Part-F9.1 — Attendance + Leave UI Test & Backend Integration Fix Pass ✅
Part-F10  — Payroll + Salary Foundation Screens ✅
Part-F10.1 — Payroll Lookup Build Hotfix ✅
Part-F10.2 — Payroll + Salary UI Test & Backend Integration Fix Pass ✅
Part-F11  — Reports + Export Foundation Screens ✅
Part-F11.1 — Reports + Export UI Test & Backend Integration Fix Pass ✅
Part-F12  — Audit Log + RBAC Audit Screens ✅
Part-F12.1 — Audit Log + RBAC Audit UI Test & Backend Integration Fix Pass ✅
Part-F12.2 — Global UI Responsiveness & Premium Polish Pass ✅
Part-F13  — Frontend Smoke Test + Backend Integration Check ✅
Part-F13.1 — Frontend Smoke Test Fix Pass ✅
Part-F14  — Route Lazy Loading + Frontend Performance Optimization ✅
Part-F15  — Pilot Readiness Checklist + Frontend Completion Lock ✅
Part-F16  — Legacy Salary Import UI Foundation ✅
```

Current next part:

```txt
Part-F16.1 — Legacy Salary Import UI Test + Backend Integration Fix Pass
```

---

## Completed / Added Backend Extension Parts After Backend Lock

Even though backend core was locked, these controlled extensions were added because they are important business modules:

```txt
Part-B51   — Dedicated Salary Summary Report Backend Module ✅
Part-B52   — Legacy Salary Sheet Import & Archive Module ✅
Part-B52.1 — Legacy Salary Import Backend Test + Integration Fix Pass ✅
```

---

## Current Target Part

Start from:

```txt
Part-F16.1 — Legacy Salary Import UI Test + Backend Integration Fix Pass
```

Goal:

```txt
Test and harden the Part-F16 Legacy Salary Import UI against the B52/B52.1 backend module.
```

Focus areas:

```txt
Upload .xlsx file from browser
Convert file to base64
POST /legacy-salary-imports/parse-excel
Show mappedHeaders and unmappedHeaders
Show mappedPayload rows
Manual JSON preview route
POST /legacy-salary-imports/preview
POST /legacy-salary-imports/commit
Archive batch list
Deleted batch list
Soft delete / restore
Records list
Summary by group
Template CSV/Excel download
Records CSV/Excel export
Permission guard
No mixing with native payroll engine
Clean validation/error UI
```

Important rule:

```txt
Legacy imported salary data must remain external/historical archive data.
It must NOT overwrite or update native payroll calculation, native salary sheet,
native salary statement, or native salary payment distribution.
```

---

## Important Legacy Salary Backend Routes

Base:

```txt
/api/v1/legacy-salary-imports
```

Routes:

```txt
GET    /legacy-salary-imports/template/csv
GET    /legacy-salary-imports/template/excel

POST   /legacy-salary-imports/parse-excel
POST   /legacy-salary-imports/preview
POST   /legacy-salary-imports/commit

GET    /legacy-salary-imports
GET    /legacy-salary-imports/deleted
GET    /legacy-salary-imports/:id

GET    /legacy-salary-imports/records
GET    /legacy-salary-imports/summary

GET    /legacy-salary-imports/records/export/csv
GET    /legacy-salary-imports/records/export/excel

DELETE /legacy-salary-imports/:id
PATCH  /legacy-salary-imports/:id/restore
```

Permissions:

```txt
legacy_salary_import:read
legacy_salary_import:process
legacy_salary_import:export
legacy_salary_import:delete
```

Access plan:

```txt
super_admin ✅ full
admin       ✅ full
hr          ✅ read/process/export/delete
accounts    ✅ read/process/export/delete
manager     ✅ read only
employee    ❌ no access
```

---

## Important Frontend Route

```txt
/salary/legacy-imports
```

Sidebar location:

```txt
Payroll Engine → Payroll → Legacy Salary Import
```

---

## Important Smoke Test Status

Latest authenticated smoke helper passed:

```txt
Total : 27
Passed: 27
Failed: 0
Smoke helper completed successfully.
```

When using the authenticated smoke command, replace the placeholder with a real access token:

```bash
API_AUTH_TOKEN="PASTE_REAL_ACCESS_TOKEN_HERE" node scripts/frontend-smoke-check.mjs
```

Do not literally use `"REAL_ACCESS_TOKEN_HERE"`.

---

## UI Design Direction

The UI design direction is already locked. The application should follow:

```txt
Premium ERP/Admin Dashboard style
Clean white background
Soft shadows
Rounded cards/tables
Left sidebar + sticky topbar
Modern filter toolbar
Right-side drawer/panel
Multi-step form style
Dashboard KPI cards + charts
Professional report preview/export UI
Smooth responsive behavior
Mobile/tablet friendly layout
Eye-catching but corporate/professional
```

The user provided multiple UI reference screenshots earlier. The target is not exact pixel copy, but the UI should be highly similar in design quality and overall ERP feel.

Important docs to read:

```txt
docs/PART_F4_1_FRONTEND_UI_REFERENCE_LOCK_AND_DESIGN_STANDARD.md
docs/FRONTEND_SCREEN_DESIGN_REFERENCE_MATRIX.md
docs/FRONTEND_COMPONENT_STYLE_GUIDE.md
docs/PART_F12_2_GLOBAL_UI_RESPONSIVENESS_AND_PREMIUM_POLISH_PASS.md
```

---

## Important Existing Docs to Read First

Read these if available:

```txt
docs/FRONTEND_COMPLETION_LOCK.md
docs/PILOT_READINESS_CHECKLIST.md
docs/NEXT_CHAT_PROMPT_FRONTEND_COMPLETION_LOCK.md
docs/PART_F15_PILOT_READINESS_CHECKLIST_FRONTEND_COMPLETION_LOCK.md

docs/PART_B52_LEGACY_SALARY_SHEET_IMPORT_ARCHIVE_MODULE.md
docs/PART_B52_1_LEGACY_SALARY_IMPORT_BACKEND_TEST_INTEGRATION_FIX_PASS.md
docs/PART_F16_LEGACY_SALARY_IMPORT_UI_FOUNDATION.md

docs/BACKEND_COMPLETION_LOCK.md
docs/PART_50_5_BACKEND_COMPLETION_LOCK.md
docs/BACKEND_SMOKE_TEST_FINAL_RESULT.md
docs/BACKEND_KNOWN_ROUTE_AND_DATA_NOTES.md
docs/FRONTEND_BACKEND_INTEGRATION_MAP.md
docs/API_ROUTE_CATALOG.md
docs/BACKEND_PERMISSION_ENDPOINT_MATRIX.md
docs/RBAC_PERMISSION_MATRIX.md
```

---

## Files / Folders to Inspect for Part-F16.1

Backend:

```txt
server/src/modules/legacySalaryImport/
server/src/routes/index.ts
server/src/modules/user/user.constant.ts
server/src/modules/auditLog/auditLog.interface.ts
server/src/modules/reportCenter/reportCenter.service.ts
```

Frontend:

```txt
client/src/features/legacy-salary-import/
client/src/app/router/router.tsx
client/src/app/router/lazyPages.tsx
client/src/app/router/routeConfig.tsx
client/src/app/router/routePreloaders.ts
client/src/config/apiRoutes.ts
client/src/config/permissions.ts
client/src/config/routePaths.ts
client/src/config/sidebar.config.tsx
client/src/lib/query/queryKeys.ts
client/src/lib/api/
client/src/components/
scripts/frontend-smoke-check.mjs
```

---

## What I Will Upload in the New Chat

I will upload:

```txt
1. Latest GitHub downloaded full project ZIP after all commits/pushes.
```

Optional but useful:

```txt
2. A sample current/old payroll salary sheet Excel file, preferably .xlsx, for testing Legacy Salary Import parse-excel.
```

Do not require me to upload all old ancillary Excel reference files unless we start those modules.

---

## Reference Files Already Discussed Earlier

Some reference files were uploaded in previous chats for future modules. They include examples such as:

```txt
Salary Summary.xlsx
Medicine Bill-2025.xlsx / Medicine Bill-2025.xlsm
Monthly Bill-25.xlsx
Monthly Bill-26.xlsx
Monthly Bill Payment Cheque Issue Format-2025.xlsx
Cheque Issue Sheet-2025.xlsx
Daily Cheque Issue Report-2026.xlsx
New Bank Account List.xlsx
Joining Record (CSRM & TSL).xlsx
Motor Bike Register.xlsx
Rovin Gorda Bill.xlsx
Auto Mills Bill.xlsx
Jalal-related bill files
```

These are for future modules like:

```txt
Pharmacy / Medical Bill
Supplier Monthly Bill
Cheque Issue Register
Motor Bike / Installment
Joining record / employee reference
Rod Bachai / Production / Dhalai / operational bill
Ancillary Bill & Voucher Engine
```

Important: These real reference files should not be committed to GitHub unless intentionally sanitized.

---

## Future Planned Backend / Business Modules

Reserved future modules:

```txt
Part-B52 — Legacy Salary Sheet Import & Archive Module ✅ done
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

These should not be mixed randomly into core payroll. They should be designed as controlled adjacent modules.

---

## Development Style

The user prefers:

```txt
Full updated files, not snippets
Exact file paths
Patch ZIP when possible
Clear apply command
Verify commands
npm run lint/build commands
Backend build commands
Browser/Postman test guide
Git add/commit/push commands
Bangla + English explanation where useful
Production-oriented code
No random UI coding outside planned part
No backend guessing without inspecting uploaded repo
```

Git command style:

```bash
git add <changed files only>
git commit -m "meaningful message"
git push
```

Before Git add, remove patch ZIP:

```bash
rm -f PATCH_FILE_NAME.zip
```

---

## Now Start This Part

Start:

```txt
Part-F16.1 — Legacy Salary Import UI Test + Backend Integration Fix Pass
```

Do not start new unrelated modules yet.

Expected output:

```txt
1. Inspect uploaded ZIP/repo/docs first
2. Identify any integration mismatch
3. Provide patch ZIP
4. Include verify commands
5. Include frontend lint/build commands
6. Include backend build command if needed
7. Include browser test steps for /salary/legacy-imports
8. Include Git commands
```
