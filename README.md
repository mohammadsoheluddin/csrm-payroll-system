# CSRM Payroll System

**CSRM Payroll System** is an enterprise-oriented full-stack HR, attendance, leave, payroll, reporting, audit, and role-based access control system being developed for CSRM-style multi-concern steel industry operations.

This project is being built step by step for real HR and payroll workflows, with a strong focus on maintainability, permission control, auditability, reporting, and future production readiness.

> **Current Status:** Active development. Backend core and many advanced payroll/HR modules are already implemented or in polishing. Frontend development has moved beyond scaffold work into practical module screens and workflow foundations. The system should not yet be described as production-ready because workflow hardening, testing, operational preparation, and UI completion are still ongoing.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Current Development Direction](#current-development-direction)
- [Current Status](#current-status)
- [Core Business Principles](#core-business-principles)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Backend Architecture Pattern](#backend-architecture-pattern)
- [Frontend Architecture Direction](#frontend-architecture-direction)
- [Core Feature Areas](#core-feature-areas)
- [User Roles](#user-roles)
- [Role-Based Access Control](#role-based-access-control)
- [Organization and Master Data](#organization-and-master-data)
- [Employee Management](#employee-management)
- [Attendance Workflow](#attendance-workflow)
- [Leave Workflow](#leave-workflow)
- [Salary and Payroll Workflow](#salary-and-payroll-workflow)
- [Legacy Salary Import Archive](#legacy-salary-import-archive)
- [Reports and Export](#reports-and-export)
- [Audit and Control](#audit-and-control)
- [API Base URL](#api-base-url)
- [API Route Summary](#api-route-summary)
- [Notable Newer Endpoints](#notable-newer-endpoints)
- [Frontend Route Snapshot](#frontend-route-snapshot)
- [Environment Variables](#environment-variables)
- [Installation and Setup](#installation-and-setup)
- [Available Scripts and Verification Commands](#available-scripts-and-verification-commands)
- [Postman Testing Guide](#postman-testing-guide)
- [Known Development Notes](#known-development-notes)
- [Project Documentation Map](#project-documentation-map)
- [Codex / AI Development Workflow](#codex--ai-development-workflow)
- [Future Roadmap](#future-roadmap)
- [Production Readiness Checklist](#production-readiness-checklist)
- [Author](#author)
- [Disclaimer](#disclaimer)

---

## Project Purpose

The CSRM Payroll System is designed to manage HR and payroll-related operations in a structured, secure, and maintainable way.

The long-term goal is to build a practical, enterprise-grade payroll and HR management system for organizations like **Chakda Steel & Re-Rolling Mills (Pvt.) Ltd. (CSRM)** and related concerns, with support for:

- multi-concern company structure
- branch, department, major department, section, and designation management
- employee full profile / digital service book
- employee document management
- employee bank and salary-related information
- attendance register and attendance import
- attendance finalization / payroll readiness
- leave application, leave balance, and leave ledger control
- salary structure and payroll calculation foundations
- salary sheets, salary statements, and payment distribution workflows
- time bill, OT, bonus, and bank-sheet related payroll reports
- legacy salary sheet import and archive
- PDF, Excel, CSV, and JSON report outputs
- audit logs, RBAC audit, and month-end process control
- frontend screens for practical HR/payroll operations

This README is the main entry document for developers, maintainers, Codex sessions, and future ChatGPT continuation.

---

## Current Development Direction

Current work is focused on **disciplined payroll-core completion** rather than uncontrolled module expansion.

Primary direction:

- employee full profile / digital service book
- employee document management and digital vault workflows
- attendance register and attendance finalization readiness
- leave balance, leave ledger, and opening balance management
- payroll safety rules, payroll lock, and payroll eligibility checks
- salary sheet, salary statement, payment distribution, time bill, OT, bonus, and bank-sheet reporting
- audit log, RBAC audit, and month-end process control hardening
- frontend module completion connected to existing backend APIs
- report layout standardization based on real CSRM salary/time bill formats
- strict separation between native payroll calculation and imported legacy salary history

Important project direction:

> Legacy salary imported data is archive, reporting, comparison, and historical reference data only. It must not be mixed into native payroll calculation.

---

## Current Status

### Backend

The backend is already a substantial **TypeScript + Express + MongoDB/Mongoose** application.

Implemented or actively developed backend areas include:

- Authentication and JWT-based login
- User management
- Permission-based RBAC
- Company, branch, major department, department, designation, and employee master data
- Employee full profile / digital service book API
- Employee document management
- File storage upload endpoint for employee documents
- Employee bulk import foundation
- Employee bank information
- Employee movement and effective-date payroll impact foundation
- Attendance management
- Attendance import
- Attendance finalization
- Leave and leave balance modules
- Holiday management
- Salary structure
- Salary sheets
- Salary statements
- Salary payment distributions
- Salary summary
- Payroll processing and payroll reports
- Legacy salary import archive
- Report center
- Report layout standards
- Month-end process control
- Time bills
- OT statements
- OT payment distributions
- Bonus sheets
- Bonus statements
- Bonus payment distributions
- Bank sheets
- RBAC audit
- Audit logs

### Frontend

The frontend is no longer only a scaffold. Practical module UI development has started and currently includes or is planned around:

- employee directory
- employee profile page
- employee document upload UI
- attendance register
- attendance finalization UI foundation
- leave applications
- payroll workflow screens
- salary structure screen
- legacy salary import screen
- report center
- salary summary report
- month-end control
- audit log viewer
- RBAC audit screen
- bank sheet and master-data related screens

Some frontend routes may still be placeholders, and some workflows are intentionally displayed in the UI before final live processing actions are connected.

---

## Core Business Principles

The project follows these business and architecture rules:

1. **Payroll/HR owns employee master data.**  
   Other future systems may have users, but employee records should stay in the payroll/HR system.

2. **Sensitive data must be permission-aware.**  
   Salary, bank, HR, document, leave, attendance, and audit data must be protected through RBAC and route guards.

3. **Attendance finalization should become the payroll-ready source.**  
   Raw attendance rows should not directly drive payroll without approval/finalization.

4. **Legacy salary import is reference-only.**  
   Imported salary sheets from old payroll software must stay separate from native payroll calculation.

5. **Payroll actions must be auditable.**  
   Processing, approval, payment, lock/unlock, and sensitive updates should preserve history.

6. **Reports should reflect real company formats.**  
   Salary sheets, time bills, OT summaries, bank sheets, and other exports should follow CSRM-style operational layouts.

7. **Development must remain serial and controlled.**  
   Large ideas should be documented, but implementation should proceed through clear parts, small batches, verification, and Git commits.

---

## Tech Stack

### Backend

| Technology    | Purpose                          |
| ------------- | -------------------------------- |
| Node.js       | Backend runtime                  |
| Express.js    | API server framework             |
| TypeScript    | Type-safe backend development    |
| MongoDB       | Database                         |
| Mongoose      | MongoDB object modeling          |
| Zod           | Request validation               |
| JWT           | Authentication and authorization |
| bcrypt        | Password hashing                 |
| PDFKit        | PDF report generation            |
| ExcelJS       | Excel report export              |
| dotenv        | Environment configuration        |
| cors          | Cross-origin resource sharing    |
| cookie-parser | Cookie parsing middleware        |
| ts-node-dev   | Development server               |

### Frontend

| Technology                                   | Purpose                           |
| -------------------------------------------- | --------------------------------- |
| React                                        | UI library                        |
| TypeScript                                   | Type-safe frontend development    |
| Vite                                         | Frontend build tooling            |
| TanStack Query                               | API state and data fetching       |
| Utility-class styling / shared UI components | UI layout and reusable components |

### Tools

| Tool             | Purpose                                                         |
| ---------------- | --------------------------------------------------------------- |
| VS Code          | Development editor                                              |
| Git Bash         | Preferred terminal workflow                                     |
| Git              | Version control                                                 |
| GitHub           | Source code hosting                                             |
| Postman          | API testing                                                     |
| MongoDB Atlas    | Cloud database                                                  |
| MongoDB Compass  | Database inspection                                             |
| Browser DevTools | Frontend debugging                                              |
| Codex / ChatGPT  | Guided development, review, refactor, and documentation support |

---

## Repository Structure

Expected root structure:

```text
csrm-payroll-system/
├── client/
├── server/
├── docs/
├── database/
├── AGENTS.md
├── README.md
└── .gitignore
```

Expected server structure:

```text
server/
├── src/
│   ├── app/
│   │   └── config/
│   ├── config/
│   ├── errors/
│   ├── interfaces/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── company/
│   │   ├── branch/
│   │   ├── majorDepartment/
│   │   ├── department/
│   │   ├── designation/
│   │   ├── employee/
│   │   ├── employeeProfile/
│   │   ├── employeeDocument/
│   │   ├── employeeBulkImport/
│   │   ├── employeeBankInfo/
│   │   ├── employeeMovement/
│   │   ├── attendance/
│   │   ├── attendanceImport/
│   │   ├── attendanceFinalization/
│   │   ├── leave/
│   │   ├── leaveBalance/
│   │   ├── holiday/
│   │   ├── salaryStructure/
│   │   ├── salarySheet/
│   │   ├── salaryStatement/
│   │   ├── salaryPaymentDistribution/
│   │   ├── salarySummary/
│   │   ├── legacySalaryImport/
│   │   ├── payroll/
│   │   ├── payrollReport/
│   │   ├── reportCenter/
│   │   ├── reportLayoutStandard/
│   │   ├── rbacAudit/
│   │   ├── monthEndProcessControl/
│   │   ├── timeBill/
│   │   ├── otStatement/
│   │   ├── otPaymentDistribution/
│   │   ├── bonusSheet/
│   │   ├── bonusStatement/
│   │   ├── bonusPaymentDistribution/
│   │   ├── bankSheet/
│   │   └── auditLog/
│   ├── routes/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── .env
```

Expected frontend structure may evolve, but the general direction is:

```text
client/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── employees/
│   │   ├── attendance-leave/
│   │   ├── payroll/
│   │   ├── salary/
│   │   ├── reports/
│   │   ├── audit/
│   │   ├── rbac/
│   │   └── master-data/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   ├── services/
│   └── main.tsx
├── package.json
└── vite.config.ts
```

> Folder names should follow the actual project structure. If the current repo differs from the examples above, inspect the repo before editing.

---

## Backend Architecture Pattern

Most backend modules should follow this pattern:

```text
module/
├── module.interface.ts
├── module.model.ts
├── module.validation.ts
├── module.service.ts
├── module.controller.ts
├── module.route.ts
└── module.constant.ts
```

### File Responsibilities

| File            | Responsibility                                                   |
| --------------- | ---------------------------------------------------------------- |
| `interface.ts`  | TypeScript types and interfaces                                  |
| `model.ts`      | Mongoose schema and model                                        |
| `validation.ts` | Zod request validation                                           |
| `service.ts`    | Business logic and database operations                           |
| `controller.ts` | Request/response handling                                        |
| `route.ts`      | API route definition and middleware binding                      |
| `constant.ts`   | Static constants, enums, permissions, and module-level constants |

### Common Backend Utilities

Typical shared utilities and middleware may include:

- `catchAsync`
- `sendResponse`
- `AppError`
- `globalErrorHandler`
- `validateRequest`
- `auth`
- `requirePermission`
- audit log helper
- export helpers for PDF/Excel/CSV
- query builder / pagination helpers
- file upload helper
- report layout utility

---

## Frontend Architecture Direction

The frontend should remain clean, modular, and role-aware.

Expected principles:

- feature-based folder structure
- shared layout and sidebar components
- role-aware navigation
- protected routes
- TanStack Query for server data
- reusable form, table, filter, card, badge, modal, and export components
- clear loading, empty, error, and permission-denied states
- responsive design for desktop, tablet, and mobile
- premium ERP-style visual polish
- no hardcoded business data unless intentionally used as demo/fallback
- API contracts should match backend routes and response shapes

Frontend screens should be practical for real HR/payroll operations, not only visual mockups.

---

## Core Feature Areas

### Authentication

- User login
- Password hashing
- JWT access token
- JWT refresh token
- Protected routes
- Role and permission-aware access

### User Management

- User creation
- User role assignment
- User status handling
- Permission-based access control
- Employee user linking for self-service use cases

### Organization and Master Data

- Company / concern management
- Branch management
- Major department management
- Department management
- Designation management
- Company bank account management
- Future section/sub-department support

### Employee Management

- Employee profile
- Employee full profile / digital service book
- Employee document management
- Employee bulk import
- Employee bank information
- Employee movement and effective-date impact tracking
- Employee self-service foundation

### Attendance and Leave

- Attendance register
- Attendance import
- Attendance finalization
- Leave application
- Leave approval/rejection/cancellation
- Leave balance
- Leave ledger / opening balance direction
- Holiday management
- Replacement leave support

### Salary and Payroll

- Salary structure
- Payroll processing
- Payroll approval
- Payroll payment status
- Payroll lock/unlock
- Salary sheets
- Salary statements
- Salary payment distributions
- Payroll reports
- Payslip and export support

### Reports and Controls

- Payroll reports
- Salary summary
- Report center
- Report layout standards
- Month-end process control
- Bank sheets
- Time bills
- OT statements
- Bonus statements
- PDF/Excel/CSV export foundations

### Audit and Security

- Audit logs
- RBAC audit
- Permission enforcement
- Payroll status history
- Sensitive module update tracking
- Future audit export and retention policy

---

## User Roles

The system currently follows a role-based model.

| Role          | Description                                                                      |
| ------------- | -------------------------------------------------------------------------------- |
| `super_admin` | Highest-level system user with full control                                      |
| `admin`       | Administrative user with broad system access                                     |
| `hr`          | HR user for employee, attendance, leave, holiday, salary, and payroll operations |
| `accounts`    | Accounts user for payroll, payment, payslip, bank sheet, and report access       |
| `manager`     | Manager user for approval and reporting workflows based on permission            |
| `employee`    | Employee user for limited self-service access                                    |

> Exact permission coverage must always be verified from the current `user.constant.ts`, permission matrix, and route guards.

---

## Role-Based Access Control

The system uses permission-based RBAC.

### RBAC Flow

```text
Request
↓
auth()
↓
JWT Verify
↓
req.user set
↓
requirePermission(requiredPermission)
↓
Check role permission matrix
↓
Allowed → Controller
Denied  → 403 Forbidden
```

### Common Permission Pattern

| Module           | Read Permission         | Manage Permission            |
| ---------------- | ----------------------- | ---------------------------- |
| User             | `user:read`             | `user:manage`                |
| Branch           | `branch:read`           | `branch:manage`              |
| Department       | `department:read`       | `department:manage`          |
| Employee         | `employee:read`         | `employee:manage`            |
| Attendance       | `attendance:read`       | `attendance:manage`          |
| Leave            | `leave:read`            | `leave:manage`               |
| Leave Approval   | -                       | `leave:approve`              |
| Holiday          | `holiday:read`          | `holiday:manage`             |
| Salary Structure | `salary_structure:read` | `salary_structure:manage`    |
| Payroll          | `payroll:read`          | Payroll-specific permissions |
| Audit Log        | `audit_log:read`        | -                            |

### Payroll Permission Examples

```text
payroll:read
payroll:update
payroll:process
payroll:approve
payroll:pay
payroll:lock
payroll:unlock
payroll:batch_approve
payroll:batch_lock
payroll:audit_read
```

### RBAC Testing Rules

Every sensitive route should be tested with:

- allowed role
- forbidden role
- missing token
- invalid token
- expired token
- employee self-service restriction, where applicable

---

## Organization and Master Data

The system should support CSRM-style multi-concern operations.

Possible hierarchy:

```text
Company / Concern
↓
Branch / Location
↓
Major Department
↓
Department
↓
Sub-Department / Section
↓
Employee
```

Business examples may include:

- CSRM
- Technosam Steel Limited / TSL
- CSRM Green Bricks
- CSRM Real Estate
- 4B Ship
- Chakda Dredging
- Scrap Yard
- Office
- SMS
- ARRM
- Accounts & Finance
- HR & Admin
- Sales & Marketing
- Procurement

This hierarchy should help reports, filters, salary sheets, time bills, attendance summaries, and payroll exports.

---

## Employee Management

Employee management should be the central HR foundation.

Important concepts:

```text
Employee = HR/payroll profile
User     = Login account
```

Not every employee needs a user account.

For employee self-service:

```text
1. Create employee profile
2. Create user with employee role
3. Link user with employee profile
4. Login as employee
5. Use employee token
6. Access only allowed self-service data
```

Employee-related future or active areas:

- personal information
- office information
- joining and confirmation details
- designation and department
- salary information
- bank information
- document vault
- movement history
- service book
- status history
- resignation/termination/exit information
- audit trail

---

## Attendance Workflow

Attendance is a major payroll input and should be controlled carefully.

Expected flow:

```text
Raw Attendance Entry / Import
↓
Validation and Correction
↓
Attendance Register Review
↓
Attendance Finalization
↓
Monthly Lock / Payroll Readiness
↓
Payroll Calculation
```

Important rules:

- Raw attendance should not directly drive final payroll without finalization.
- Attendance import should support future biometric/punch device data.
- Manual attendance correction should be auditable.
- Finalized attendance should be protected from uncontrolled changes.
- Payroll should use approved/finalized attendance summary, not unverified raw rows.
- Date range, employee, department, branch, company, and status filters should be supported in reports.

Future biometric direction:

- device punch import
- duplicate punch cleanup
- missing punch detection
- late/early/absent calculation
- manual correction request
- approved correction workflow
- attendance summary generation
- monthly finalization lock

---

## Leave Workflow

The Leave module supports policy-based leave control.

### Leave Types

```text
casual
sick
earned
paid
unpaid
maternity
paternity
official
replacement
others
```

### Leave Statuses

```text
pending
approved
rejected
cancelled
```

### Auto Total Days

`totalDays` should be calculated automatically by the backend from `startDate` and `endDate`.

Example:

```text
2026-05-05 to 2026-05-07 = 3 days
```

Frontend/Postman should not need to send `totalDays` if backend auto-calculation is active.

### Overlapping Leave Prevention

For the same employee, overlapping active leave should be blocked.

Active statuses:

```text
pending
approved
```

Example:

```text
Existing: casual leave, 2026-05-05 to 2026-05-07
New: sick leave, 2026-05-06 to 2026-05-08
Result: blocked
```

Rejected or cancelled leave should not block future leave.

### Leave Balance Policy

Current or planned policy control may include:

```text
Casual Leave: yearly allowed limit
Sick Leave: yearly allowed limit
Earned Leave: policy based
Replacement Leave: holiday-work based
Management Concern Leave: controlled exception
```

Only active leave statuses should consume leave balance:

```text
pending
approved
```

Rejected and cancelled leave should not consume balance.

### Management Concern Leave

For special leave types such as:

```text
paid
unpaid
others
```

The request may require:

```text
managementConcern: true
managementConcernNote: string
managementConcernBy: optional user id
```

Important:

```text
Management concern does not mean final approval.
The leave still starts as pending.
Final approval happens through the leave approval route.
```

### Replacement Leave

Replacement leave is used when an employee works on an official holiday and later takes replacement leave.

Expected rules:

1. `replacementForDate` is required.
2. `replacementForDate` must exist in Holiday records.
3. Employee must have attendance on that date.
4. Attendance status must be `present` or `late`.
5. Replacement leave should normally be one day at a time.
6. Replacement leave should be taken after the worked holiday date.
7. The same worked holiday date should not be reused for another active replacement leave.

Example:

```text
Worked holiday date: 2026-06-17
Replacement leave date: 2026-06-18
Result: allowed
```

Blocked example:

```text
Worked holiday date: 2026-06-17
Replacement leave date: 2026-06-17
Result: blocked
```

---

## Salary and Payroll Workflow

Payroll should follow controlled calculation, approval, payment, and lock stages.

General status flow:

```text
draft → processed → approved → paid
```

### Status Meaning

| Status      | Meaning                                      |
| ----------- | -------------------------------------------- |
| `draft`     | Payroll is created but not finalized         |
| `processed` | Payroll calculation has been processed       |
| `approved`  | Payroll has been approved by authorized user |
| `paid`      | Payroll has been marked as paid              |

### Payroll Lock Rule

When payroll is locked:

- sensitive update should be restricted
- payroll history should be preserved
- audit trail should remain available
- reports should remain reproducible
- unlock should require higher permission and audit reason

### Payroll Month Format

Payroll month should follow:

```text
YYYY-MM
```

Example:

```text
2026-05
```

### Payroll Safety Direction

Future payroll safety should include:

- attendance finalization requirement
- salary structure effective-date validation
- employee status eligibility check
- duplicate payroll prevention
- payroll draft/sandbox preview
- payroll approval workflow
- payroll lock
- change reason and audit trail
- report regeneration consistency

---

## Legacy Salary Import Archive

The system includes or plans a controlled legacy salary import archive.

Purpose:

- import salary sheet data from old/current payroll software
- preserve historical payroll records
- search and filter old salary information
- generate reports, charts, and comparisons
- support migration review without corrupting native payroll logic

Strict rule:

```text
Legacy salary imported data = Archive / reporting / comparison only
Native payroll calculation = Current system payroll engine only
```

Do not:

- use imported legacy salary as native salary structure
- use imported legacy attendance as finalized attendance
- mix imported legacy net salary into active payroll calculation
- overwrite employee master payroll data without controlled import/mapping workflow

Possible features:

- Excel upload
- validation preview
- import batch history
- rejected row report
- searchable archive
- month/company/department filter
- employee mapping by office ID
- comparison between legacy and native payroll
- export archived salary report

---

## Reports and Export

The system supports and/or plans multiple output formats:

| Feature                    | Format             |
| -------------------------- | ------------------ |
| Payslip API                | JSON               |
| Payslip Export             | PDF                |
| Payroll Report             | JSON               |
| Payroll Report Export      | CSV                |
| Payroll Report Export      | Excel              |
| Salary Sheet               | JSON / PDF / Excel |
| Salary Statement           | JSON / PDF / Excel |
| Time Bill                  | JSON / PDF / Excel |
| OT Statement               | JSON / PDF / Excel |
| Bonus Statement            | JSON / PDF / Excel |
| Bank Sheet                 | JSON / PDF / Excel |
| Audit Log Export           | Future             |
| Report Center Saved Config | Future / ongoing   |

### Expected Salary Summary Layout

Future reports should follow CSRM-style salary/time bill formats:

```text
Company Header
Report Title
Month / Date Range
Company / Concern
Department / Section
Employee Rows
Sub-Department Total
Department Total
Grand Total
Signature Section
```

Common salary report columns:

```text
SL
Office ID
Employee Name
Designation
Attendance
Leave
Absent
Holiday
Payable Days
Gross Salary
Basic
House Rent
Medical
Conveyance
Tiffin
Overtime
Deduction
Net Salary
Bank Pay
Cash Pay
Signature
```

### Signature Section Examples

Reports may include signature blocks such as:

```text
Prepared By
Checked By
Accounts
Approved By
Authorized Signature
```

---

## Audit and Control

Audit log foundation is important for enterprise readiness.

Audit log may include:

- module name
- action type
- entity ID
- previous data
- new data
- changed fields
- user information
- request metadata
- device/network metadata
- change reason
- timestamp

Future improvement:

- extend audit logging across all sensitive modules
- add audit log filtering
- add audit log export
- add audit retention policy
- add role-wise audit review
- add payroll lock/unlock reason tracking
- add before/after comparison UI

---

## API Base URL

Local backend base URL:

```text
http://localhost:5000/api/v1
```

Health check:

```text
GET http://localhost:5000/
```

Expected response example:

```json
{
  "success": true,
  "message": "CSRM Payroll Backend Running"
}
```

---

## API Route Summary

All module routes are mounted under:

```text
/api/v1
```

| Area                         | Base Route                             |
| ---------------------------- | -------------------------------------- |
| Auth                         | `/api/v1/auth`                         |
| Users                        | `/api/v1/users`                        |
| Companies                    | `/api/v1/companies`                    |
| Company Bank Accounts        | `/api/v1/company-bank-accounts`        |
| Major Departments            | `/api/v1/major-departments`            |
| Departments                  | `/api/v1/departments`                  |
| Branches                     | `/api/v1/branches`                     |
| Designations                 | `/api/v1/designations`                 |
| Employees                    | `/api/v1/employees`                    |
| Employee Profiles            | `/api/v1/employee-profiles`            |
| Employee Documents           | `/api/v1/employee-documents`           |
| Employee Bulk Imports        | `/api/v1/employee-bulk-imports`        |
| Employee Bank Infos          | `/api/v1/employee-bank-infos`          |
| Employee Movements           | `/api/v1/employee-movements`           |
| Attendance                   | `/api/v1/attendance`                   |
| Attendance Imports           | `/api/v1/attendance-imports`           |
| Attendance Finalizations     | `/api/v1/attendance-finalizations`     |
| Leave                        | `/api/v1/leave`                        |
| Leave Balances               | `/api/v1/leave-balances`               |
| Holiday                      | `/api/v1/holiday`                      |
| Salary Structure             | `/api/v1/salary-structure`             |
| Salary Sheets                | `/api/v1/salary-sheets`                |
| Salary Statements            | `/api/v1/salary-statements`            |
| Salary Payment Distributions | `/api/v1/salary-payment-distributions` |
| Salary Summary               | `/api/v1/salary-summary`               |
| Legacy Salary Imports        | `/api/v1/legacy-salary-imports`        |
| Payroll                      | `/api/v1/payroll`                      |
| Payroll Reports              | `/api/v1/payroll-reports`              |
| Report Center                | `/api/v1/report-center`                |
| Report Layout Standards      | `/api/v1/report-layout-standards`      |
| RBAC Audit                   | `/api/v1/rbac-audit`                   |
| Month-End Process Control    | `/api/v1/month-end-process-control`    |
| Time Bills                   | `/api/v1/time-bills`                   |
| OT Statements                | `/api/v1/ot-statements`                |
| OT Payment Distributions     | `/api/v1/ot-payment-distributions`     |
| Bonus Sheets                 | `/api/v1/bonus-sheets`                 |
| Bonus Statements             | `/api/v1/bonus-statements`             |
| Bonus Payment Distributions  | `/api/v1/bonus-payment-distributions`  |
| Bank Sheets                  | `/api/v1/bank-sheets`                  |
| Audit Logs                   | `/api/v1/audit-logs`                   |

> Always verify this table with the current `server/src/routes/index.ts` before final release.

---

## Notable Newer Endpoints

Examples of newer or important endpoints:

```text
GET  /api/v1/employee-profiles/:employeeRef
GET  /api/v1/employee-profiles/:employeeRef/summary
POST /api/v1/employee-documents/upload
GET  /api/v1/employee-documents/:id/download
GET  /api/v1/legacy-salary-imports
GET  /api/v1/attendance-finalizations
```

Exact request/response contracts should be verified from the current route, validation, controller, and service files.

---

## Frontend Route Snapshot

Current implemented or actively used frontend areas include:

```text
/employees
/employees/:employeeRef/profile
/employees/documents
/attendance
/leave
/payroll
/salary/structures
/salary/legacy-imports
/reports/center
/reports/salary-summary
/reports/month-end-control
/audit/logs
/rbac/audit
```

Additional routes may exist depending on the latest frontend implementation.

---

## Environment Variables

Create a `.env` file inside the `server/` folder.

Example:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb+srv://your-db-user:your-db-password@your-cluster.mongodb.net/csrm-payroll?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES=7d
```

Additional variables may be required for:

- file upload storage
- CORS origin
- refresh token cookie options
- production deployment
- email/SMS integrations
- cloud storage
- logging
- rate limiting

Never commit real `.env` values to GitHub.

---

## Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/mohammadsoheluddin/csrm-payroll-system.git
cd csrm-payroll-system
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` inside `server/`, then run:

```bash
npm run dev
```

Backend should run on:

```text
http://localhost:5000
```

### 3. Frontend Setup

From the project root or a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend should run on the Vite development server URL shown in the terminal.

---

## Available Scripts and Verification Commands

### Backend

Run from `server/`:

```bash
npm run dev
```

Starts backend in development mode.

```bash
npm run build
```

Compiles TypeScript.

```bash
npm start
```

Runs compiled backend, usually from `dist/server.js`.

```bash
npm run route:sanity
```

Runs route sanity verification if available in the current project scripts.

### Frontend

Run from `client/`:

```bash
npm run dev
```

Starts frontend development server.

```bash
npm run lint
```

Runs frontend lint checks.

```bash
npm run build
```

Builds frontend for production.

### Recommended Verification Before Commit

```bash
cd server
npm run build
npm run route:sanity
```

```bash
cd client
npm run lint
npm run build
```

If a command does not exist in the current `package.json`, inspect scripts first:

```bash
cat package.json
```

---

## Postman Testing Guide

Recommended testing order:

```text
1. Start backend server
2. Login and collect access token
3. Test health check
4. Create or verify company/branch/master data
5. Create major department / department / designation
6. Create employee
7. Create employee profile / service-book information
8. Upload employee document
9. Create employee bank information
10. Create attendance
11. Import attendance, if import module is active
12. Review attendance register
13. Finalize attendance
14. Create holiday
15. Create leave
16. Approve/reject/cancel leave
17. Verify leave balance
18. Create salary structure
19. Process payroll or salary sheet workflow
20. Approve payroll/salary workflow
21. Mark payment / distribution workflow
22. Lock payroll/month-end process where available
23. Test payslip JSON
24. Test payslip PDF
25. Test salary/payroll report JSON
26. Test CSV/Excel/PDF exports
27. Test report center
28. Test audit logs
29. Test RBAC audit
30. Test forbidden cases for each role
```

Common header:

```text
Authorization: Bearer ACCESS_TOKEN
```

Recommended Postman environment variables:

```text
BASE_URL=http://localhost:5000/api/v1
SUPER_ADMIN_ACCESS_TOKEN=
ADMIN_ACCESS_TOKEN=
HR_ACCESS_TOKEN=
ACCOUNTS_ACCESS_TOKEN=
MANAGER_ACCESS_TOKEN=
EMPLOYEE_ACCESS_TOKEN=
EMPLOYEE_ID=
EMPLOYEE_REF=
COMPANY_ID=
BRANCH_ID=
DEPARTMENT_ID=
DESIGNATION_ID=
PAYROLL_MONTH=2026-05
```

### Role-Based Postman Testing

Every important API should be tested with:

| Scenario                       | Expected Result                                              |
| ------------------------------ | ------------------------------------------------------------ |
| Super admin token              | Allowed for full-control endpoints                           |
| Admin token                    | Allowed for admin-level endpoints                            |
| HR token                       | Allowed for HR/payroll operational endpoints                 |
| Accounts token                 | Allowed for payroll/payment/report endpoints                 |
| Manager token                  | Allowed only where manager approval/report permission exists |
| Employee token                 | Allowed only for own self-service endpoints                  |
| Missing token                  | 401 Unauthorized                                             |
| Invalid token                  | 401 Unauthorized                                             |
| Valid token without permission | 403 Forbidden                                                |
| Invalid request body           | 400 Validation Error                                         |
| Non-existing ID                | 404 Not Found                                                |
| Duplicate business key         | 400/409 depending on implementation                          |

---

## Known Development Notes

### Employee ID vs User ID

Do not confuse:

```text
Employee ID = HR/payroll profile ID
User ID     = login account ID
```

Some APIs need employee `_id`, some may use `employeeRef`, `officeId`, or user-linked employee reference.

### Role Naming

Correct role naming should follow the project constants.

Example:

```text
super_admin
```

Avoid:

```text
superAdmin
```

### Payroll Month

Use:

```text
YYYY-MM
```

Example:

```text
2026-05
```

### Common Local Development Issues

Possible issues:

```text
MongoDB Atlas IP not whitelisted
Invalid MongoDB URI
mongodb+srv URI with port number
Wrong JWT secret
Wrong role name
Wrong permission constant
Missing Authorization header
Using User ID instead of Employee ID
Missing route import in routes/index.ts
Wrong middleware folder path
TypeScript build errors after route/controller changes
PDFKit type mismatch
ESM/CommonJS import mismatch
Zod version/type mismatch
```

### Frontend Protected Route Note

Protected frontend routes may redirect to login if there is no valid token. For visual verification, use valid login credentials or test with a seeded/authenticated environment.

---

## Project Documentation Map

Important project documentation may live under `docs/` and root files.

Recommended important documents:

```text
README.md
AGENTS.md
docs/PROJECT_CONTINUITY.md
docs/NEXT_CHAT_PROMPT.md
docs/ATTENDANCE_FINALIZATION_FLOW.md
docs/PAYROLL_CALCULATION_RULES.md
docs/TIME_BILL_CALCULATION_RULES.md
docs/BANK_EXPORT_SPEC.md
docs/LEAVE_POLICY_RULES.md
docs/REPORT_FILTER_STANDARD.md
docs/PDF_EXPORT_LAYOUT_GUIDE.md
docs/EXCEL_EXPORT_LAYOUT_GUIDE.md
docs/ORACLE_MIGRATION_BLUEPRINT.md
```

Part-specific documents should be kept under `docs/` and should explain:

- purpose
- changed files
- business rules
- route/API details
- validation rules
- verification commands
- Postman test cases
- remaining work
- known limitations

---

## Codex / AI Development Workflow

When using Codex, ChatGPT, or any AI coding assistant, follow this workflow:

```text
1. Inspect the current repo before editing.
2. Read README.md, AGENTS.md, PROJECT_CONTINUITY.md, and relevant part docs.
3. Do not guess route names, permission names, or folder paths.
4. Preserve existing module boundaries.
5. Preserve RBAC and audit patterns.
6. Keep legacy salary archive data separate from native payroll calculation.
7. Make small, controlled, serial changes.
8. Provide full updated files when replacing code.
9. Run required verification commands.
10. Summarize changed files, verification result, and next logical part.
```

### Required Final Report Style for AI/Codex Work

After each development part, report:

```text
Part name:
Branch:
Files changed:
Business logic added:
API routes affected:
Frontend routes affected:
Verification commands run:
Result:
Known limitations:
Next recommended part:
Git commands:
```

### Recommended Git Commands After a Completed Part

Use only relevant changed files:

```bash
git status --short
git add README.md docs/RELEVANT_DOC.md server/src/relevant-file.ts client/src/relevant-file.tsx
git commit -m "docs: update project README and continuity notes"
git push
```

---

## Future Roadmap

### Near-Term Roadmap

1. Attendance finalization backend hardening and live workflow UI
2. Attendance register UI polish and authenticated visual verification
3. Leave ledger and opening balance management
4. Payroll safety rules and eligibility checks
5. Payroll draft/sandbox workflow
6. Salary sheet and payment distribution hardening
7. Legacy salary import archive reporting and comparison
8. Report center improvement
9. Audit log viewer and RBAC audit hardening
10. Frontend completion across existing backend modules

### Backend Roadmap

- Complete remaining validation polishing
- Complete RBAC permission coverage review
- Add organization hierarchy support where missing
- Add section/sub-department support where needed
- Improve attendance summary reporting
- Improve leave summary reporting
- Improve payroll salary sheet overview reporting
- Improve PDF/Excel report layout
- Add Swagger/OpenAPI documentation
- Add automated tests
- Add production-grade logging
- Add Docker support
- Add deployment guide
- Add backup and restore guide

### Frontend Roadmap

- Role-based dashboard
- Sidebar menu by role and permission
- Employee management UI completion
- Employee profile/service book UI completion
- Employee document vault UI completion
- Attendance register and finalization UI completion
- Leave application and approval UI completion
- Holiday UI
- Salary structure UI
- Payroll processing UI
- Payroll approval UI
- Payslip view/download UI
- Salary sheet and report UI
- Legacy salary import UI
- Report center UI
- Audit log UI
- RBAC audit UI
- Responsive layout improvement
- Error/loading/empty/forbidden states
- Form validation polish

### Reporting Roadmap

Future reports should support:

- employee-wise report
- department-wise report
- section-wise report
- company/concern-wise report
- date range filter
- month/year filter
- status filter
- PDF export
- Excel export
- CSV export
- printable signature section
- saved report configuration
- report layout standardization

### Future Infrastructure Options

The current project continues with:

```text
MongoDB + Mongoose + Express + React
```

Future cloned/separate variants may explore:

- local/on-premise server deployment
- self-hosted MongoDB
- Dockerized deployment
- PostgreSQL alternative backend
- Oracle alternative backend
- Oracle APEX separate version
- multi-tenant SaaS version
- API gateway / microservice architecture

These future variants should be explored separately and should not disrupt the current working project flow.

---

## Production Readiness Checklist

Before production deployment:

```text
[ ] Complete backend validation polish
[ ] Complete RBAC review
[ ] Complete frontend dashboard
[ ] Complete all critical frontend workflows
[ ] Add/update .env.example
[ ] Add Swagger/OpenAPI documentation
[ ] Add automated tests
[ ] Add seed script for initial admin and master data
[ ] Add production CORS config
[ ] Add Helmet/security headers
[ ] Add rate limiter
[ ] Add request logger
[ ] Add error logger
[ ] Add audit retention policy
[ ] Add database backup policy
[ ] Add file upload storage policy
[ ] Add payroll lock/unlock policy
[ ] Add deployment documentation
[ ] Add Dockerfile
[ ] Add docker-compose.yml
[ ] Add server health check
[ ] Add monitoring/log review process
[ ] Complete final security review
[ ] Complete user acceptance testing
[ ] Complete HR/accounts workflow sign-off
```

---

## Author

**Mohammad Sohel Uddin**  
HR & Admin Professional  
Web Development Learner  
Project: CSRM Payroll System

---

## Disclaimer

This project is under active development. Some modules are implemented, some are being improved, and some workflows are planned for future development.

This README is designed as the main project entry document and should be updated regularly as the backend, frontend, reports, documentation, and deployment process evolve.
