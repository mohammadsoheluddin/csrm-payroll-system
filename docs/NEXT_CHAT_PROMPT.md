# Next Chat Resume Prompt — CSRM Payroll System

Use this prompt at the beginning of a new ChatGPT conversation to continue the project safely.

---

We are continuing my long-running project: **CSRM Payroll System**.

My name is Sohel. I am an HR/Admin professional and I am building this payroll system step by step with ChatGPT. Continue exactly in the same project style, not as a generic payroll project.

GitHub repo:

https://github.com/mohammadsoheluddin/csrm-payroll-system

Very important:

Before giving code, inspect the current repo carefully. If you cannot access or inspect the GitHub repo properly, tell me clearly and ask me to upload a ZIP of the repo or paste the required files. Do not guess blindly.

---

## First Read These Docs

Read these first if available:

1. `docs/PROJECT_CONTINUITY.md`
2. `docs/NEXT_CHAT_PROMPT.md`
3. `docs/MODULE_STATUS_TRACKER.md`
4. `docs/SOFT_DELETE_RESTORE_STANDARD.md`
5. `docs/API_CONVENTIONS.md`
6. `docs/CODEBASE_RULES.md`
7. `docs/RBAC_PERMISSION_MATRIX.md`
8. `docs/POSTMAN_TESTING_STRATEGY.md`

After reading, confirm the latest project state before coding.

---

## Project Stack

Backend:

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Zod
- JWT
- bcrypt
- PDFKit
- ExcelJS

Frontend:

- React / Vite scaffold exists
- Frontend is not yet fully implemented
- Backend-first development is currently continuing

Testing / Tools:

- Postman
- MongoDB Atlas / Compass
- VS Code
- Git / GitHub

---

## Development Style — Very Important

Always follow this style:

1. Give full updated files only, not snippets.
2. Mention exact file paths.
3. Say whether to replace or create the file.
4. Maintain compatibility with existing project structure.
5. Do not randomly change database/deployment approach.
6. Keep code production-ready and clean.
7. Follow consistent naming conventions.
8. Clearly explain business logic.
9. Give organized Postman test cases after each API/module part.
10. End every code-change response with Git add/commit/push commands.
11. Git commands must include only changed/added files.
12. Use Bangla + English mixed explanation where helpful.
13. Avoid breaking existing working APIs.
14. If repo state is uncertain, inspect first or ask for files.

For docs-only changes:

- No Postman test is required.
- Still provide exact file paths and Git commands.

---

## Current Project Maturity

Current maturity:

Early Enterprise HRIS / Payroll Backend Platform

This is no longer only a basic payroll CRUD system. The backend now includes core HR, attendance, leave, salary, payroll, salary sheet, time bill, OT, bonus, bank sheet, report center, audit, RBAC, and month-end control foundations.

---

## Current Backend Module Inventory

Current modules under `server/src/modules` include:

Core / Master:

- auth
- user
- branch
- company
- companyBankAccount
- majorDepartment
- department
- designation

Employee / HR:

- employee
- employeeBankInfo
- employeeBulkImport
- employeeMovement

Attendance / Leave:

- attendance
- attendanceImport
- attendanceFinalization
- leave
- leaveBalance
- holiday

Payroll / Salary:

- salaryStructure
- payroll
- payrollReport
- salarySheet
- salaryStatement
- salaryPaymentDistribution

Time Bill / OT:

- timeBill
- otStatement
- otPaymentDistribution

Bonus:

- bonusSheet
- bonusStatement
- bonusPaymentDistribution

Bank / Payment:

- bankSheet
- bankSheetHistory

Reporting / System:

- reportCenter
- reportLayoutStandard
- monthEndProcessControl
- auditLog
- rbacAudit

---

## Route Registration Context

Main route registry:

`server/src/routes/index.ts`

Current route registry includes routes for the active modules, such as:

- `/auth`
- `/users`
- `/companies`
- `/company-bank-accounts`
- `/major-departments`
- `/designations`
- `/employees`
- `/employee-bulk-imports`
- `/employee-bank-infos`
- `/employee-movements`
- `/departments`
- `/branches`
- `/attendance`
- `/attendance-imports`
- `/attendance-finalizations`
- `/leave`
- `/leave-balances`
- `/holiday`
- `/salary-structure`
- `/salary-sheets`
- `/salary-statements`
- `/salary-payment-distributions`
- `/payroll`
- `/payroll-reports`
- `/report-center`
- `/report-layout-standards`
- `/rbac-audit`
- `/time-bills`
- `/ot-statements`
- `/ot-payment-distributions`
- `/month-end-process-control`
- `/bonus-sheets`
- `/bonus-statements`
- `/bonus-payment-distributions`
- `/bank-sheets`
- `/audit-logs`
- `/bank-sheet-history`

---

## Organization Hierarchy

Current hierarchy:

Company / Concern  
→ Major Department / Payroll Reporting Group  
→ Department  
→ Designation  
→ Employee

Important mapping from old salary sheet:

- Old salary sheet "Department" = new Major Department / Payroll Reporting Group
- Old salary sheet "Sub-Department" = new Department
- Section/Sub-Section Module is postponed for now

Relevant CSRM/TSL payroll context:

- CSRM
- TSL
- Office
- Accounts & Finance / A&F
- Sales & Marketing
- Procurement
- Scrap Yard
- SMS
- ARRM
- 4B Ship
- CSRM Green Bricks
- Chakda Dredging
- CSRM Real Estate

---

## Important Employee ID Rule

`employeeId` is permanent.

Rules:

- employeeId must never be reused.
- employeeId should not be casually editable after employee creation.
- Even if an employee resigns, retires, is terminated, becomes inactive, or is soft-deleted, the same employeeId must not be assigned to a new employee.
- New employee means new employeeId.

Reason:

Employee ID connects attendance, leave, payroll, salary, payslip, bank payment, bonus, time bill, audit log, and legal/compliance history.

---

## Current Technical Observations

Important current observations:

1. Docs were recently synced at Part-48.0.
2. Backend module coverage is broad.
3. Frontend is still starter/scaffold level.
4. Soft delete exists but is not standardized.
5. Restore APIs are not standardized.
6. Deleted-list APIs are not standardized.
7. Audit metadata for delete/restore is not standardized.
8. Some modules may still use hard-delete patterns in regeneration flows.
9. Route-level RBAC is mixed:
   - Some routes use permission-based checks.
   - Some routes still use role-based checks.
10. Build health should be checked separately:

- `npm ci --ignore-scripts` was clean during ZIP inspection.
- `npm run build` / `tsc` may need separate stabilization/performance review.

---

## Current Sync Point

Latest completed sync step:

Part-48.0 — Docs Sync & Current State Lock

Purpose:

- Update continuity docs to match the actual current backend.
- Prevent future chats from continuing with outdated Part-30 context.
- Prepare for soft delete/restore standardization.

---

## Immediate Next Part

Start next:

# Part-48.1 — Soft Delete / Restore Standardization Foundation

Part-48.1 should create the foundation only.

Do not refactor all modules randomly in one step.

Expected Part-48.1 goals:

1. Define reusable soft delete/restore standard.
2. Add shared types/interfaces if appropriate.
3. Define standard metadata:
   - isDeleted
   - deletedAt
   - deletedBy
   - deleteReason
   - restoredAt
   - restoredBy
   - restoreReason
   - updatedBy
4. Define default query behavior.
5. Define deleted-list behavior.
6. Define restore behavior.
7. Define audit log behavior.
8. Define route naming convention.
9. Give Postman testing guide.
10. End with Git commands.

---

## Recommended Next Sequence

Recommended roadmap:

1. Part-48.1 — Soft Delete / Restore Standardization Foundation
2. Part-48.2 — Apply Soft Delete Standard to Core Master Modules
3. Part-48.3 — Restore + Deleted List APIs
4. Part-48.4 — Apply Soft Delete Standard to HR / Employee Modules
5. Part-48.5 — Apply Soft Delete Standard to Payroll / Payment / Report Modules
6. Part-49.1 — Build Health / TypeScript Compile Stabilization
7. Part-49.2 — RBAC Route Enforcement Consistency Pass
8. Part-50.1 — README + Final Continuity Pack Update
9. Part-51.1 — Frontend Planning or API Documentation Pack

---

## Files Likely Needed for Part-48.1

Before coding Part-48.1, inspect these files:

- `server/src/modules/auditLog/auditLog.interface.ts`
- `server/src/modules/auditLog/auditLog.model.ts`
- `server/src/modules/auditLog/auditLog.service.ts`
- `server/src/modules/user/user.constant.ts`
- `server/src/middlewares/auth.ts`
- `server/src/middlewares/validateRequest.ts`
- `server/src/utils/catchAsync.ts`
- `server/src/utils/sendResponse.ts`
- `server/src/errors/AppError.ts`
- `server/src/routes/index.ts`
- representative module files:
  - `server/src/modules/company/company.model.ts`
  - `server/src/modules/department/department.model.ts`
  - `server/src/modules/designation/designation.model.ts`
  - `server/src/modules/branch/branch.model.ts`
  - `server/src/modules/employee/employee.model.ts`

Also search current usage of:

- `isDeleted`
- `deletedAt`
- `deletedBy`
- `deleteReason`
- `restore`
- `deleteMany`
- `findByIdAndDelete`
- `findOneAndDelete`

---

## Do Not Do These

Do not:

- Convert the project to PostgreSQL/Prisma now.
- Change deployment strategy now.
- Start frontend randomly before backend standardization.
- Rewrite all modules in one part.
- Remove existing APIs without confirming impact.
- Guess route names or permissions without inspecting current files.
- Give `.patch` format unless explicitly requested.
- Give partial snippets when full files are requested.

---

## Response Style Expected

When I say "Start Part-48.1", respond with:

1. Small summary of what will be changed.
2. Exact files to replace/create.
3. Full updated files only.
4. Business logic explanation.
5. Postman testing guide.
6. Build/test commands.
7. Git add/commit/push commands.

Use Bangla + English explanation where useful.
