# CSRM Payroll System

**CSRM Payroll System** is a full-stack HR, attendance, leave, payroll, reporting, audit, and RBAC system being developed for CSRM-style multi-concern operations.

The project is under active development. The backend has advanced well beyond the initial foundation, and the frontend has moved beyond scaffold work into practical module UI development. It should not yet be described as production-ready; workflow completion, hardening, testing, and operational preparation are still ongoing.

## Current Development Direction

Current work is focused on disciplined payroll-core completion rather than open-ended module expansion:

- employee full profile / digital service book
- employee document management and digital vault workflows
- attendance finalization / monthly lock readiness
- leave, payroll safety, reporting, and audit hardening
- practical frontend screens connected to existing backend APIs

The system keeps a strict separation between native payroll and imported legacy salary history:

> Legacy salary imported data is archive, reporting, and comparison data only. It must not be mixed into native payroll calculation.

## Current Status

### Backend

The backend is already a substantial TypeScript/Express/MongoDB application with:

- authentication and permission-based RBAC
- company, branch, department, designation, and employee master data
- Employee Full Profile / Digital Service Book API
- Employee Document Management
- File Storage Upload Endpoint for employee documents
- attendance, attendance import, attendance finalization, leave, and leave-balance modules
- salary structures, payroll, salary sheets/statements/payment distributions
- Legacy Salary Import Archive
- payroll reports, salary summary, report center, month-end control, RBAC audit, and audit logs

### Frontend

The frontend is no longer only a scaffold. Practical module UI development now includes:

- employee directory
- Employee Document Upload UI
- Full Employee Profile UI
- Attendance Register + Finalization UI Foundation
- leave applications
- payroll workflows and reporting pages
- dashboard, audit, report center, bank sheet, and master-data screens

Some planned routes remain placeholders, and some workflows are intentionally surfaced in the UI before their final live processing actions are connected.

## Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- Zod validation
- JWT authentication
- PDFKit / ExcelJS reporting utilities

### Frontend

- React
- TypeScript
- Vite
- TanStack Query
- utility-class styling and shared UI components

## Core Business Rules

- Employee master data belongs in the payroll/HR system.
- Sensitive HR, salary, bank, and document data must remain permission-aware.
- Attendance finalization is intended to become the payroll-ready source; raw attendance rows should not directly drive payroll without approval/finalization.
- Legacy salary imported data is reference-only and must stay separate from native payroll calculation.

## API Base URL

Local backend base URL:

```text
http://localhost:5000/api/v1
```

Health check:

```text
GET http://localhost:5000/
```

## API Route Summary

All module routes are mounted under `/api/v1`.

| Area | Base Route |
| --- | --- |
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Companies | `/api/v1/companies` |
| Company Bank Accounts | `/api/v1/company-bank-accounts` |
| Major Departments | `/api/v1/major-departments` |
| Departments | `/api/v1/departments` |
| Branches | `/api/v1/branches` |
| Designations | `/api/v1/designations` |
| Employees | `/api/v1/employees` |
| Employee Profiles | `/api/v1/employee-profiles` |
| Employee Documents | `/api/v1/employee-documents` |
| Employee Bulk Imports | `/api/v1/employee-bulk-imports` |
| Employee Bank Infos | `/api/v1/employee-bank-infos` |
| Employee Movements | `/api/v1/employee-movements` |
| Attendance | `/api/v1/attendance` |
| Attendance Imports | `/api/v1/attendance-imports` |
| Attendance Finalizations | `/api/v1/attendance-finalizations` |
| Leave | `/api/v1/leave` |
| Leave Balances | `/api/v1/leave-balances` |
| Holiday | `/api/v1/holiday` |
| Salary Structure | `/api/v1/salary-structure` |
| Salary Sheets | `/api/v1/salary-sheets` |
| Salary Statements | `/api/v1/salary-statements` |
| Salary Payment Distributions | `/api/v1/salary-payment-distributions` |
| Salary Summary | `/api/v1/salary-summary` |
| Legacy Salary Imports | `/api/v1/legacy-salary-imports` |
| Payroll | `/api/v1/payroll` |
| Payroll Reports | `/api/v1/payroll-reports` |
| Report Center | `/api/v1/report-center` |
| Report Layout Standards | `/api/v1/report-layout-standards` |
| RBAC Audit | `/api/v1/rbac-audit` |
| Month-End Process Control | `/api/v1/month-end-process-control` |
| Time Bills | `/api/v1/time-bills` |
| OT Statements | `/api/v1/ot-statements` |
| OT Payment Distributions | `/api/v1/ot-payment-distributions` |
| Bonus Sheets | `/api/v1/bonus-sheets` |
| Bonus Statements | `/api/v1/bonus-statements` |
| Bonus Payment Distributions | `/api/v1/bonus-payment-distributions` |
| Bank Sheets | `/api/v1/bank-sheets` |
| Audit Logs | `/api/v1/audit-logs` |

### Notable Newer Endpoints

```text
GET  /api/v1/employee-profiles/:employeeRef
GET  /api/v1/employee-profiles/:employeeRef/summary
POST /api/v1/employee-documents/upload
GET  /api/v1/employee-documents/:id/download
GET  /api/v1/legacy-salary-imports
GET  /api/v1/attendance-finalizations
```

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

## Verification Commands

### Backend

```bash
cd server
npm run build
npm run route:sanity
```

### Frontend

```bash
cd client
npm run lint
npm run build
```

## Setup

### Backend

```bash
cd server
npm install
npm run dev
```

Create `server/.env` from the project requirements before starting the API.

### Frontend

```bash
cd client
npm install
npm run dev
```

## Roadmap

Near-term direction:

1. Attendance finalization backend hardening and live workflow UI
2. Leave ledger and opening balance work
3. Payroll safety rules, eligibility checks, and draft/sandbox workflows
4. Continued report, audit, and payment-control improvements
5. Continued frontend completion across existing backend modules

Longer-term ideas remain documented, but implementation is intentionally kept small, controlled, and serial.

## Codex Workflow

Project work is documented in `AGENTS.md` and part-specific files under `docs/`.

Typical workflow:

1. inspect the repo before editing
2. read the relevant part docs
3. preserve existing module boundaries and permissions
4. keep legacy salary archive data separate from native payroll logic
5. run the required verification commands before finalizing

## Disclaimer

This project is under active development. Some modules are already advanced, some UI flows are still being completed, and production-readiness work remains ongoing.
