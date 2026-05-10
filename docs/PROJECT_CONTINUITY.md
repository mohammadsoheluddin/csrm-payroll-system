# CSRM Payroll System — Project Continuity Documentation

Last Updated: 2026-05-10  
Current Sync Point: Part-48.0 — Docs Sync & Current State Lock

---

## 1. Project Identity

Project Name: CSRM Payroll System

Primary Organization Context:

- Chakda Steel & Re-Rolling Mills (Pvt.) Ltd. / CSRM
- Technosum Steel Limited / TSL
- CSRM-controlled or centrally processed sister concerns / payroll reporting groups

Primary Goal:

Build a production-oriented HR, Attendance, Leave, Payroll, Reporting, Bank Payment, Audit Log, and RBAC system based on real CSRM/TSL payroll workflows.

Current Product Maturity:

Early Enterprise HRIS / Payroll Backend Platform

The project has moved beyond a basic payroll CRUD system. It now includes core HR, attendance, leave, payroll, reporting, salary sheet, time bill, bonus, bank sheet, audit, RBAC, and month-end workflow foundations.

---

## 2. Technology Stack

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
- Backend-first development is currently the correct direction

Testing / Tooling:

- Postman
- MongoDB Atlas / Compass
- Git / GitHub
- VS Code

Important Development Rule:

This project must continue with the current backend/frontend flow. Do not randomly change database, deployment strategy, package architecture, or folder structure unless a separate migration/variant is intentionally planned.

---

## 3. Current Backend Module Inventory

The current backend contains these major module folders under:

`server/src/modules`

Core / Master Modules:

1. auth
2. user
3. branch
4. company
5. companyBankAccount
6. majorDepartment
7. department
8. designation

Employee / HR Modules:

9. employee
10. employeeBankInfo
11. employeeBulkImport
12. employeeMovement

Attendance / Leave Modules:

13. attendance
14. attendanceImport
15. attendanceFinalization
16. leave
17. leaveBalance
18. holiday

Payroll / Salary Modules:

19. salaryStructure
20. payroll
21. payrollReport
22. salarySheet
23. salaryStatement
24. salaryPaymentDistribution

Time Bill / OT Modules:

25. timeBill
26. otStatement
27. otPaymentDistribution

Bonus Modules:

28. bonusSheet
29. bonusStatement
30. bonusPaymentDistribution

Bank / Payment Modules:

31. bankSheet
32. bankSheetHistory

Reporting / System Modules:

33. reportCenter
34. reportLayoutStandard
35. monthEndProcessControl
36. auditLog
37. rbacAudit

---

## 4. Current Route Registration Status

The main route registry is:

`server/src/routes/index.ts`

Current route registry already includes routes for the active modules, including:

- `/auth`
- `/protected`
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

Current observation:

- Module folder and route registration are broadly aligned.
- Route-level RBAC style is still mixed in some places.
- Some routes use permission-based authorization.
- Some routes still use direct role-based authorization.
- Future RBAC consistency pass is required.

---

## 5. Current Completed / Mostly Completed Work Areas

Core Platform:

- Auth module
- User module
- JWT authentication
- Role and permission foundation
- Global error handling
- Zod validation pattern
- sendResponse utility pattern
- catchAsync utility pattern
- AppError pattern
- Audit log foundation
- RBAC audit foundation

Organization / Master Data:

- Company / Concern
- Major Department / Payroll Reporting Group
- Department
- Branch
- Designation
- Company Bank Account

Employee / HR:

- Employee master
- Employee office info refactor
- Employee bank/payment info
- Employee bulk import foundation
- Employee movement foundation

Attendance / Leave:

- Attendance module
- Attendance import foundation
- Attendance finalization foundation
- Leave module
- Leave balance module
- Holiday module

Payroll / Salary / Report:

- Salary structure
- Payroll basic engine
- Payroll report module
- Salary sheet module
- Salary statement module
- Salary payment distribution module
- Report center
- Report layout standard

Bank / Payment:

- Bank sheet foundation
- Bank sheet history
- Company bank account
- Salary payment distribution
- Bonus payment distribution
- OT payment distribution

Time Bill / OT / Bonus:

- Time bill module
- OT statement module
- OT payment distribution module
- Bonus sheet module
- Bonus statement module
- Bonus payment distribution module

Month-End / Control:

- Month-end process control foundation
- Payroll locking and finalization concept exists across modules
- Further standardization is required before production use

---

## 6. Organization Hierarchy Decision

Current hierarchy for payroll and reporting:

Company / Concern  
→ Major Department / Payroll Reporting Group  
→ Department  
→ Designation  
→ Employee

Important mapping from old salary sheets:

- Old salary sheet "Department" should map to the new system's "Major Department / Payroll Reporting Group".
- Old salary sheet "Sub-Department" should map to the new system's "Department".
- Section/Sub-Section Module is postponed for now.
- If needed later, Section/Sub-Section can be added as an optional deeper layer.

Primary company/legal payroll control:

- CSRM / Chakda Steel & Re-Rolling Mills (Pvt.) Ltd.

Important major department / payroll reporting group examples:

1. Office
2. Accounts & Finance / A&F
3. Sales & Marketing
4. Procurement
5. Scrap Yard
6. SMS
7. ARRM
8. 4B Ship
9. CSRM Green Bricks
10. Chakda Dredging
11. CSRM Real Estate
12. TSL Office
13. TSL SMS
14. TSL ARRM

Important clarification:

Some groups like 4B Ship, CSRM Green Bricks, Chakda Dredging, and CSRM Real Estate may be real sister concerns. For current payroll reporting, they may still be treated as Major Department / Payroll Reporting Group because CSRM central HR/Accounts may process payroll centrally.

---

## 7. Employee Identity Policy

Official `employeeId` is permanent.

Rules:

- Once an `employeeId` is assigned to an employee, it must never be reused.
- Even if the employee resigns, retires, is terminated, becomes inactive, or is soft-deleted, the same `employeeId` must not be assigned to a new employee.
- `employeeId` should not be casually editable after employee creation.

Reason:

Employee ID connects:

- Payroll history
- Attendance history
- Leave history
- Salary history
- Payslip
- Bank payment
- Bonus
- Time bill / OT
- TA/DA claim if added later
- Audit log
- Legal/compliance records

Correct approach:

- Old employee resigned: status should represent resignation/inactive/terminated as needed.
- New employee joined: assign a new employeeId.
- Do not reuse the previous employeeId.

Different note:

- officeId / cardNo / device card may later need reassignment in rare cases.
- If cardNo/device ID is ever reassigned, a separate card assignment history module should be created.

---

## 8. Important Reference Payroll Requirements

Old payroll UI/report references should inform future API/UI/report design.

Important employee form fields:

- Office / Company
- Designation
- Department
- Sub Department
- Joining Date
- Confirmation Date
- Salary Gross
- Duty Hour / Day
- Leave Day
- Status

Important salary charge fields:

- Gross
- Basic
- House Rent
- Medical
- Conveyance
- Tiffin calculation
- OT calculation
- OT Rate
- Bank Pay Amount
- Effective Date
- Tax
- Shift

Important report references:

- Salary Sheet
- Salary Statement
- Time Bill
- OT Statement
- Bank Sheet
- Bonus Sheet
- Bonus Statement
- Payment Distribution
- Department-wise summary
- Company/concern-wise summary
- Signature sections for prepared/checked/accounts/approved

---

## 9. Current Technical Observations

Current positive state:

- Backend module coverage is broad.
- Many real payroll workflows are already represented.
- Route registry is mostly aligned with modules.
- Project has moved toward enterprise-grade domain separation.
- Documentation library is rich and useful.

Current risks:

1. Documentation drift:
   - Some docs still described older Part-30 stage.
   - Part-48.0 updates the key continuity docs to the current state.

2. Soft delete inconsistency:
   - Many modules have `isDeleted`.
   - Some modules also have `deletedAt`, `updatedBy`, etc.
   - Restore behavior is not standardized yet.
   - Deleted-list APIs are not standardized yet.
   - Audit log metadata for delete/restore is not standardized yet.

3. Hard delete risk:
   - Some regeneration flows may use hard delete patterns.
   - For payroll/leave/attendance/accounting-grade data, hard delete should be avoided unless there is a very specific safe reason.

4. RBAC inconsistency:
   - Some routes are permission-based.
   - Some routes are still role-based.
   - A future RBAC enforcement consistency pass is required.

5. Build health:
   - Dependency install is clean.
   - TypeScript build should be separately checked and stabilized.
   - Large Mongoose + TypeScript project may require compile performance review.

6. Frontend:
   - Frontend is still starter/scaffold level.
   - Real frontend should start only after API conventions, docs, and key backend workflows are stable.

7. Cleanup:
   - There is a suspicious stray file-like path: `server/srccommontypes.ts`.
   - There is an unusual docs filename containing multiple document names together.
   - Cleanup can be handled later after current backend standards are locked.

---

## 10. Current Sync Point

Latest sync step:

Part-48.0 — Docs Sync & Current State Lock

Purpose:

- Bring key docs up to date with the actual current backend.
- Stop future chats from continuing from outdated Part-30 context.
- Prepare the project for the next standardization part.

Next planned implementation part:

Part-48.1 — Soft Delete / Restore Standardization Foundation

---

## 11. Immediate Next Development Sequence

Recommended next sequence:

1. Part-48.0 — Docs Sync & Current State Lock
2. Part-48.1 — Soft Delete / Restore Standardization Foundation
3. Part-48.2 — Apply Soft Delete Standard to Core Master Modules
4. Part-48.3 — Restore + Deleted List APIs
5. Part-48.4 — Apply Soft Delete Standard to HR / Employee Modules
6. Part-48.5 — Apply Soft Delete Standard to Payroll / Payment / Report Modules
7. Part-49.1 — Build Health / TypeScript Compile Stabilization
8. Part-49.2 — RBAC Route Enforcement Consistency Pass
9. Part-50.1 — README + Final Continuity Pack Update
10. Part-51.1 — Frontend Planning or API Documentation Pack

---

## 12. Part-48.1 Scope Preview

Part-48.1 should not randomly refactor all modules at once.

Part-48.1 should create the standard foundation first:

Expected output:

- A reusable soft delete/restore standard
- Shared TypeScript interfaces/types where useful
- Standard metadata fields:
  - isDeleted
  - deletedAt
  - deletedBy
  - deleteReason
  - restoredAt
  - restoredBy
  - restoreReason
  - updatedBy
- Standard service behavior
- Standard query behavior
- Standard audit behavior
- Standard route convention
- Standard Postman test guide

Part-48.1 should avoid dangerous broad rewrites.

Apply gradually by module groups in later parts.

---

## 13. Development Style Rules

For all future parts:

1. Give full updated files only, not partial snippets.
2. Mention exact file paths.
3. Keep compatibility with existing folder structure.
4. Do not break existing APIs unless the change is explicitly intentional.
5. Keep code production-ready and clean.
6. Use consistent naming conventions.
7. Explain business logic clearly.
8. Give step-by-step Postman testing guide for code/API changes.
9. End every code-change response with Git commands.
10. Git commands must include only changed/added files.
11. Use Bangla + English mixed explanation where helpful.
12. If repo cannot be inspected, ask for ZIP or specific files instead of guessing blindly.
13. For docs-only changes, no Postman test is required.

---

## 14. GitHub / Continuation Rule

Primary repo:

https://github.com/mohammadsoheluddin/csrm-payroll-system

If a future chat cannot inspect GitHub properly:

- Ask the user to upload a ZIP of the repo.
- Or ask the user to paste specific files.
- Do not guess the current code blindly.

Most important docs to read first in a new chat:

1. `docs/PROJECT_CONTINUITY.md`
2. `docs/NEXT_CHAT_PROMPT.md`
3. `docs/MODULE_STATUS_TRACKER.md`
4. `docs/SOFT_DELETE_RESTORE_STANDARD.md`
5. `docs/RBAC_PERMISSION_MATRIX.md`
6. `docs/API_CONVENTIONS.md`
7. `docs/CODEBASE_RULES.md`
8. `docs/POSTMAN_TESTING_STRATEGY.md`

---

## 15. Final Current Direction

The project is not lost or messy beyond recovery.

The correct current phase is:

Standardization before expansion.

Before adding many new modules, the backend should standardize:

- Soft delete / restore
- RBAC route enforcement
- audit metadata
- build health
- docs continuity
- API conventions
- report/export conventions

Current next best step:

Part-48.1 — Soft Delete / Restore Standardization Foundation
