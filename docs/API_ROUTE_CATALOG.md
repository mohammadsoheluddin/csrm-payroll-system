# CSRM Payroll System — Backend API Route Catalog

Last Updated: 2026-05-11  
Created In: Part-50.2 — Backend API Documentation Pack  
Status: Documentation Foundation / Backend Reference

---

## 1. Purpose

This document lists the backend API route groups that exist or are expected based on the current CSRM Payroll System backend module structure.

This is a route catalog for developers, testers, frontend integration, and future maintenance.

> Note: This document is a practical route catalog. Before final production release, it should be cross-checked against `server/src/routes/index.ts` and each `*.route.ts` file after the final backend smoke test.

---

## 2. Base URL

Local development base URL:

```txt
http://localhost:5000/api/v1
```

Postman environment variable:

```txt
{{baseUrl}}
```

---

## 3. Auth

| Method | Endpoint | Purpose | Auth |
| ------ | -------- | ------- | ---- |
| POST | `/auth/login` | Login user | Public |
| POST | `/auth/refresh-token` | Refresh access token | Public / refresh token |
| POST | `/auth/change-password` | Change password | Authenticated |
| POST | `/auth/logout` | Logout/session cleanup | Authenticated |

Frontend pages:

```txt
Login
Change Password
Session Expired
Forbidden Access
```

---

## 4. User / RBAC

| Method | Endpoint | Purpose | Permission |
| ------ | -------- | ------- | ---------- |
| GET | `/users` | User list | `user:read` |
| GET | `/users/:id` | User details | `user:read` |
| POST | `/users` | Create user | `user:manage` |
| PATCH | `/users/:id` | Update user | `user:manage` |
| DELETE | `/users/:id` | Delete/disable user | `user:manage` |

Related docs:

```txt
docs/RBAC_PERMISSION_MATRIX.md
docs/PART_49_2_RBAC_ROUTE_ENFORCEMENT_CONSISTENCY.md
```

---

## 5. Organization / Master Data

### Company / Concern

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/companies` | Active company list |
| GET | `/companies/deleted` | Deleted company list |
| GET | `/companies/:id` | Company details |
| POST | `/companies` | Create company |
| PATCH | `/companies/:id` | Update company |
| DELETE | `/companies/:id` | Soft delete company |
| PATCH | `/companies/:id/restore` | Restore deleted company |

### Branch

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/branches` | Active branch list |
| GET | `/branches/deleted` | Deleted branch list |
| GET | `/branches/:id` | Branch details |
| POST | `/branches` | Create branch |
| PATCH | `/branches/:id` | Update branch |
| DELETE | `/branches/:id` | Soft delete branch |
| PATCH | `/branches/:id/restore` | Restore deleted branch |

### Major Department

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/major-departments` | Active major department list |
| GET | `/major-departments/deleted` | Deleted major department list |
| GET | `/major-departments/:id` | Major department details |
| POST | `/major-departments` | Create major department |
| PATCH | `/major-departments/:id` | Update major department |
| DELETE | `/major-departments/:id` | Soft delete major department |
| PATCH | `/major-departments/:id/restore` | Restore deleted major department |

### Department

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/departments` | Active department list |
| GET | `/departments/deleted` | Deleted department list |
| GET | `/departments/:id` | Department details |
| POST | `/departments` | Create department |
| PATCH | `/departments/:id` | Update department |
| DELETE | `/departments/:id` | Soft delete department |
| PATCH | `/departments/:id/restore` | Restore deleted department |

### Designation

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/designations` | Active designation list |
| GET | `/designations/deleted` | Deleted designation list |
| GET | `/designations/:id` | Designation details |
| POST | `/designations` | Create designation |
| PATCH | `/designations/:id` | Update designation |
| DELETE | `/designations/:id` | Soft delete designation |
| PATCH | `/designations/:id/restore` | Restore deleted designation |

### Company Bank Account

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/company-bank-accounts` | Company bank account list |
| GET | `/company-bank-accounts/:id` | Bank account details |
| POST | `/company-bank-accounts` | Create company bank account |
| PATCH | `/company-bank-accounts/:id` | Update company bank account |
| DELETE | `/company-bank-accounts/:id` | Delete/soft delete bank account |

---

## 6. Employee / HR

### Employee

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/employees` | Employee list |
| GET | `/employees/deleted` | Deleted employee list |
| GET | `/employees/:id` | Employee details |
| POST | `/employees` | Create employee |
| PATCH | `/employees/:id` | Update employee basic data |
| PATCH | `/employees/:id/lifecycle` | Change employee lifecycle/status |
| DELETE | `/employees/:id` | Soft delete employee |
| PATCH | `/employees/:id/restore` | Restore deleted employee |

Important:

```txt
Employee ID must never be reused.
Employee lifecycle change should use /lifecycle.
Generic update should not be used for resignation/termination/retirement/suspension.
```

### Employee Bank Info

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/employee-bank-infos` | Active employee payment info list |
| GET | `/employee-bank-infos/deleted` | Deleted employee payment info list |
| GET | `/employee-bank-infos/:id` | Payment info details |
| POST | `/employee-bank-infos` | Create payment info |
| PATCH | `/employee-bank-infos/:id` | Update payment info |
| DELETE | `/employee-bank-infos/:id` | Soft delete payment info |
| PATCH | `/employee-bank-infos/:id/restore` | Restore payment info |

### Employee Movement

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/employee-movements` | Movement list |
| GET | `/employee-movements/deleted` | Deleted movement list |
| GET | `/employee-movements/:id` | Movement details |
| POST | `/employee-movements` | Create movement |
| PATCH | `/employee-movements/:id` | Update movement |
| DELETE | `/employee-movements/:id` | Soft delete movement |
| PATCH | `/employee-movements/:id/restore` | Restore movement |

### Employee Bulk Import

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/employee-bulk-imports` | Bulk import batch list |
| GET | `/employee-bulk-imports/deleted` | Deleted batch list |
| GET | `/employee-bulk-imports/:id` | Batch details |
| POST | `/employee-bulk-imports` | Run bulk import |
| DELETE | `/employee-bulk-imports/:id` | Soft delete batch |
| PATCH | `/employee-bulk-imports/:id/restore` | Restore batch |
| PATCH | `/employee-bulk-imports/:id/revert` | Revert created employees if supported |

---

## 7. Attendance / Leave

### Attendance

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/attendance` | Attendance list |
| GET | `/attendance/deleted` | Deleted attendance list |
| GET | `/attendance/:id` | Attendance details |
| POST | `/attendance` | Create/manual attendance |
| PATCH | `/attendance/:id` | Update attendance |
| DELETE | `/attendance/:id` | Soft delete attendance |
| PATCH | `/attendance/:id/restore` | Restore attendance |

### Attendance Import

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/attendance-imports` | Import batch list |
| GET | `/attendance-imports/deleted` | Deleted import batch list |
| GET | `/attendance-imports/:id` | Import batch details |
| POST | `/attendance-imports` | Import attendance |
| DELETE | `/attendance-imports/:id` | Soft delete import batch |
| PATCH | `/attendance-imports/:id/restore` | Restore import batch |

### Attendance Finalization

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/attendance-finalizations` | Finalization list |
| GET | `/attendance-finalizations/deleted` | Deleted finalization list |
| GET | `/attendance-finalizations/:id` | Finalization details |
| POST | `/attendance-finalizations` | Create/finalize attendance period |
| PATCH | `/attendance-finalizations/:id` | Update finalization |
| DELETE | `/attendance-finalizations/:id` | Soft delete finalization if not locked |
| PATCH | `/attendance-finalizations/:id/restore` | Restore finalization |

### Leave

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/leave` | Leave list |
| GET | `/leave/deleted` | Deleted leave list |
| GET | `/leave/:id` | Leave details |
| POST | `/leave` | Apply/create leave |
| PATCH | `/leave/:id` | Update leave |
| PATCH | `/leave/:id/approve` | Approve leave if available |
| PATCH | `/leave/:id/reject` | Reject leave if available |
| DELETE | `/leave/:id` | Soft delete leave if allowed |
| PATCH | `/leave/:id/restore` | Restore leave if no conflict |

### Leave Balance

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/leave-balances` | Leave balance list |
| GET | `/leave-balances/deleted` | Deleted balance list |
| GET | `/leave-balances/:id` | Leave balance details |
| POST | `/leave-balances` | Create/opening balance |
| PATCH | `/leave-balances/:id` | Update balance |
| DELETE | `/leave-balances/:id` | Soft delete balance |
| PATCH | `/leave-balances/:id/restore` | Restore balance |

### Holiday

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/holiday` | Holiday list |
| GET | `/holiday/deleted` | Deleted holiday list |
| GET | `/holiday/:id` | Holiday details |
| POST | `/holiday` | Create holiday |
| PATCH | `/holiday/:id` | Update holiday |
| DELETE | `/holiday/:id` | Soft delete holiday |
| PATCH | `/holiday/:id/restore` | Restore holiday |

---

## 8. Payroll / Salary

### Salary Structure

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/salary-structure` | Salary structure list |
| GET | `/salary-structure/deleted` | Deleted salary structure list |
| GET | `/salary-structure/:id` | Salary structure details |
| POST | `/salary-structure` | Create salary structure |
| PATCH | `/salary-structure/:id` | Update salary structure |
| DELETE | `/salary-structure/:id` | Soft delete salary structure |
| PATCH | `/salary-structure/:id/restore` | Restore salary structure |

### Payroll

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/payroll` | Payroll list |
| GET | `/payroll/deleted` | Deleted payroll list |
| GET | `/payroll/:id` | Payroll details |
| POST | `/payroll/generate` | Generate payroll |
| PATCH | `/payroll/:id` | Update payroll |
| DELETE | `/payroll/:id` | Soft delete payroll if not locked/finalized/paid |
| PATCH | `/payroll/:id/restore` | Restore payroll if safe |

Payroll generation body standard:

```json
{
  "month": 5,
  "year": 2026,
  "company": "MongoObjectId",
  "branch": "OptionalMongoObjectId",
  "majorDepartment": "OptionalMongoObjectId",
  "department": "OptionalMongoObjectId",
  "employee": "OptionalMongoObjectId",
  "overwrite": false,
  "remarks": "Optional remarks"
}
```

Important:

```txt
Payroll generation requires locked attendance finalization.
If attendance finalization is missing, response may be 409 Conflict.
```

### Payroll Reports

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/payroll-reports` | Payroll report JSON/list |
| GET | `/payroll-reports/monthly` | Monthly report if available |
| GET | `/payroll-reports/payslip/:id` | Payslip JSON/PDF if available |
| GET | `/payroll-reports/export` | CSV/Excel/PDF export if available |

---

## 9. Salary Sheet / Statement / Payment

### Salary Sheet

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/salary-sheets` | Salary sheet list |
| GET | `/salary-sheets/deleted` | Deleted salary sheet list |
| GET | `/salary-sheets/:id` | Salary sheet details |
| POST | `/salary-sheets` | Generate/create salary sheet |
| DELETE | `/salary-sheets/:id` | Soft delete if safe |
| PATCH | `/salary-sheets/:id/restore` | Restore if safe |

### Salary Statement

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/salary-statements` | Salary statement list |
| GET | `/salary-statements/deleted` | Deleted salary statement list |
| GET | `/salary-statements/:id` | Salary statement details |
| POST | `/salary-statements` | Generate/create salary statement |
| DELETE | `/salary-statements/:id` | Soft delete if safe |
| PATCH | `/salary-statements/:id/restore` | Restore if safe |

### Salary Payment Distribution

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/salary-payment-distributions` | Payment distribution list |
| GET | `/salary-payment-distributions/deleted` | Deleted payment distribution list |
| GET | `/salary-payment-distributions/:id` | Payment distribution details |
| POST | `/salary-payment-distributions` | Generate/create distribution |
| DELETE | `/salary-payment-distributions/:id` | Soft delete if safe |
| PATCH | `/salary-payment-distributions/:id/restore` | Restore if safe |

---

## 10. Time Bill / OT

### Time Bill

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/time-bills` | Time bill list |
| GET | `/time-bills/deleted` | Deleted time bill list |
| GET | `/time-bills/:id` | Time bill details |
| POST | `/time-bills` | Generate/create time bill |
| DELETE | `/time-bills/:id` | Soft delete if safe |
| PATCH | `/time-bills/:id/restore` | Restore if safe |

### OT Statement

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/ot-statements` | OT statement list |
| GET | `/ot-statements/deleted` | Deleted OT statement list |
| GET | `/ot-statements/:id` | OT statement details |
| POST | `/ot-statements` | Generate/create OT statement |
| DELETE | `/ot-statements/:id` | Soft delete if safe |
| PATCH | `/ot-statements/:id/restore` | Restore if safe |

### OT Payment Distribution

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/ot-payment-distributions` | OT payment distribution list |
| GET | `/ot-payment-distributions/deleted` | Deleted list |
| GET | `/ot-payment-distributions/:id` | Details |
| POST | `/ot-payment-distributions` | Generate/create distribution |
| DELETE | `/ot-payment-distributions/:id` | Soft delete if safe |
| PATCH | `/ot-payment-distributions/:id/restore` | Restore if safe |

---

## 11. Bonus

### Bonus Sheet

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/bonus-sheets` | Bonus sheet list |
| GET | `/bonus-sheets/deleted` | Deleted bonus sheet list |
| GET | `/bonus-sheets/:id` | Bonus sheet details |
| POST | `/bonus-sheets` | Generate/create bonus sheet |
| DELETE | `/bonus-sheets/:id` | Soft delete if safe |
| PATCH | `/bonus-sheets/:id/restore` | Restore if safe |

### Bonus Statement

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/bonus-statements` | Bonus statement list |
| GET | `/bonus-statements/deleted` | Deleted bonus statement list |
| GET | `/bonus-statements/:id` | Bonus statement details |
| POST | `/bonus-statements` | Generate/create bonus statement |
| DELETE | `/bonus-statements/:id` | Soft delete if safe |
| PATCH | `/bonus-statements/:id/restore` | Restore if safe |

### Bonus Payment Distribution

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/bonus-payment-distributions` | Bonus payment distribution list |
| GET | `/bonus-payment-distributions/deleted` | Deleted list |
| GET | `/bonus-payment-distributions/:id` | Details |
| POST | `/bonus-payment-distributions` | Generate/create distribution |
| DELETE | `/bonus-payment-distributions/:id` | Soft delete if safe |
| PATCH | `/bonus-payment-distributions/:id/restore` | Restore if safe |

---

## 12. Bank Sheet / Bank Sheet History

### Bank Sheet

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/bank-sheets` | Bank sheet preview/list/export layer |
| GET | `/bank-sheets/export` | Bank sheet export if available |

### Bank Sheet History

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/bank-sheet-history` | Bank sheet history list |
| GET | `/bank-sheet-history/deleted` | Deleted history list |
| GET | `/bank-sheet-history/:id` | History details |
| DELETE | `/bank-sheet-history/:id` | Soft delete history if safe |
| PATCH | `/bank-sheet-history/:id/restore` | Restore history if safe |

---

## 13. Report Center / Layout

### Report Center

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/report-center` | Saved report config/list |
| GET | `/report-center/deleted` | Deleted report config list |
| GET | `/report-center/:id` | Report config details |
| POST | `/report-center` | Create saved report config |
| PATCH | `/report-center/:id` | Update saved report config |
| DELETE | `/report-center/:id` | Soft delete saved report config |
| PATCH | `/report-center/:id/restore` | Restore saved report config |

### Report Layout Standard

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/report-layout-standards` | Layout standard list |
| GET | `/report-layout-standards/:id` | Layout standard details |
| POST | `/report-layout-standards` | Create layout standard |
| PATCH | `/report-layout-standards/:id` | Update layout standard |

---

## 14. Month-End Process Control

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/month-end-process-control` | Month-end control list |
| GET | `/month-end-process-control/:id` | Control details |
| POST | `/month-end-process-control` | Create process control |
| PATCH | `/month-end-process-control/:id` | Update status/lock/unlock if supported |

Purpose:

```txt
Controls payroll period readiness, locking, and process governance.
```

---

## 15. Audit Log / RBAC Audit

### Audit Log

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/audit-logs` | Audit log list |
| GET | `/audit-logs/summary` | Audit summary |
| GET | `/audit-logs/timeline` | Audit timeline |
| GET | `/audit-logs/filter-options` | Filter options |
| GET | `/audit-logs/sensitive` | Sensitive/high-risk audit logs |
| GET | `/audit-logs/:id` | Audit log details |

Supported important filters:

```txt
action
module
riskLevel
category
actorRole
actorEmail
entityId
fromDate
toDate
searchTerm
page
limit
```

### RBAC Audit

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/rbac-audit` | RBAC audit result |
| GET | `/rbac-audit/permission-matrix` | Permission coverage/matrix if available |

---

## 16. Standard Soft Delete / Restore Pattern

For most active modules:

```http
GET    /resource/deleted
DELETE /resource/:id
PATCH  /resource/:id/restore
```

Soft delete body:

```json
{
  "deleteReason": "Optional reason"
}
```

Restore body:

```json
{
  "restoreReason": "Optional reason"
}
```

Important route order:

```txt
/deleted must be placed before /:id
/summary must be placed before /:id
/export must be placed before /:id
/sensitive must be placed before /:id
```

---

## 17. Standard Error Examples

Validation error:

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

Forbidden error:

```json
{
  "success": false,
  "message": "Forbidden access"
}
```

Business conflict:

```json
{
  "success": false,
  "message": "Payroll generation blocked."
}
```

---

## 18. Final Verification Needed

Before finalizing this catalog:

```bash
cd /e/Projects/CSRM-Payroll-System/server

npm run route:sanity
npm run typecheck
npm run build:clean
```

Then run backend smoke test:

```txt
Part-50.4 — Backend Smoke Testing
```
