# CSRM Payroll System — Backend Testing Master Guide

Last Updated: 2026-05-11  
Created In: Part-50.2 — Backend API Documentation Pack

---

## 1. Purpose

This guide defines the backend testing order before declaring the backend codebase as completion-ready.

This is not a replacement for automated tests. It is a practical manual smoke test guide for the current project stage.

---

## 2. Pre-Test Commands

From project root:

```bash
cd /e/Projects/CSRM-Payroll-System

node scripts/backend-health-check.cjs
```

From server folder:

```bash
cd /e/Projects/CSRM-Payroll-System/server

npm run typecheck
npm run route:sanity
npm run build:clean
npm run dev
```

Expected:

```txt
typecheck passed
route sanity passed
build passed
server running
MongoDB connected
```

---

## 3. Postman Environment

Required variables:

```txt
baseUrl = http://localhost:5000/api/v1
adminToken = admin/super_admin access token
hrToken = HR access token
accountsToken = Accounts access token
managerToken = Manager access token
employeeToken = Employee access token
companyId = test company id
branchId = test branch id
majorDepartmentId = test major department id
departmentId = test department id
designationId = test designation id
employeeId = test employee ObjectId
```

Important:

Do not use real production-like master data for destructive tests.

Use test names like:

```txt
ZZ Test Company
ZZ Test Branch
ZZ Test Department
ZZ Test Employee
```

---

## 4. Smoke Test Order

### Stage 1 — Auth

```txt
Admin login
HR login
Accounts login
Manager login
Employee login
Invalid login
Token missing test
Token invalid test
```

Expected:

```txt
Valid login returns token
Invalid login returns proper error
Missing token returns unauthorized
```

---

### Stage 2 — Master Data

Test:

```txt
Company
Branch
Major Department
Department
Designation
Company Bank Account
```

For each:

```txt
Create
List
Get by ID
Update
Soft delete
Deleted list
Restore
Invalid ObjectId test
Duplicate code/name test where applicable
```

---

### Stage 3 — Employee / HR

Test:

```txt
Employee create
Employee list
Employee details
Employee update
Employee lifecycle change
Employee restore/delete flow with caution
Employee bank info
Employee movement
Employee bulk import
```

Employee lifecycle test:

```json
{
  "employmentStatus": "resigned",
  "effectiveDate": "2026-05-11",
  "reason": "Smoke test resigned flow"
}
```

Then reactivate if test data:

```json
{
  "employmentStatus": "active",
  "effectiveDate": "2026-05-11",
  "reason": "Smoke test reactivation"
}
```

---

### Stage 4 — Attendance / Leave

Test:

```txt
Attendance create/list/update
Attendance import if sample file available
Attendance finalization create/lock
Leave apply
Leave approve/reject
Leave balance list/update
Holiday create/list/delete/restore
```

Important:

Payroll generation should be blocked unless attendance finalization is locked.

---

### Stage 5 — Payroll / Salary

Test:

```txt
Salary structure create/list
Payroll generate
Payroll list
Payroll details
Payroll update if allowed
Payroll soft delete/restore only for safe/draft records
Salary sheet
Salary statement
Salary payment distribution
```

Payroll generate valid body:

```json
{
  "month": 5,
  "year": 2026,
  "company": "{{companyId}}"
}
```

Expected if attendance finalization missing:

```txt
409 Conflict
Locked attendance finalization is required
```

This is expected business-rule behavior, not route/RBAC failure.

---

### Stage 6 — Time Bill / OT / Bonus

Test:

```txt
Time bill generate/list
OT statement generate/list
OT payment distribution
Bonus sheet
Bonus statement
Bonus payment distribution
```

Only use test/draft/unlocked records for delete/restore tests.

---

### Stage 7 — Bank / Payment / Report

Test:

```txt
Bank sheet preview/export
Bank sheet history
Report center
Report layout standard
PDF export
Excel export
CSV export if available
JSON report
```

Check content types:

```txt
application/pdf
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
text/csv
application/json
```

---

### Stage 8 — Audit / RBAC

Test permission denied:

```txt
Use employee token
GET /payroll
Expected: 403 Forbidden
```

Then use admin token:

```http
GET {{baseUrl}}/audit-logs?action=permission_denied
```

Expected:

```txt
permission_denied log exists
riskLevel high
category authorization
```

Other audit tests:

```txt
GET /audit-logs
GET /audit-logs/sensitive
GET /audit-logs?riskLevel=high
GET /audit-logs?category=authorization
```

---

## 5. Soft Delete / Restore Common Test

For each supported resource:

```txt
GET /resource
DELETE /resource/:id
GET /resource/:id
GET /resource/deleted
PATCH /resource/:id/restore
GET /resource/:id
```

Expected:

```txt
After delete, normal GET should not return active record.
Deleted list should show record.
After restore, normal GET should return record again.
```

---

## 6. RBAC Role-Wise Test

| Role | Expected |
| ---- | -------- |
| super_admin | Full access |
| admin | Broad access |
| hr | HR/employee/attendance/leave/payroll preparation access |
| accounts | Payroll/payment/bank/report access |
| manager | Limited team/report/approval access |
| employee | Self-service only |

Employee should not access:

```txt
/users
/audit-logs
/payroll admin routes
/company-bank-accounts manage routes
```

---

## 7. Test Result Template

Use this format in notes:

```txt
Module:
Endpoint:
Role/Token:
Request Body:
Expected:
Actual:
Status:
Bug/Note:
```

Example:

```txt
Module: Payroll
Endpoint: POST /payroll/generate
Role: admin
Expected: 409 if attendance finalization missing
Actual: 409
Status: Passed
```

---

## 8. Backend Completion Criteria

Backend can be called code-freeze candidate when:

```txt
[ ] health check passes
[ ] build passes
[ ] route sanity passes
[ ] auth smoke test passes
[ ] master data smoke test passes
[ ] employee smoke test passes
[ ] attendance/leave smoke test passes
[ ] payroll business-rule test passes
[ ] audit permission_denied test passes
[ ] no broken route imports
[ ] no uncommitted files
```

---

## 9. Next Part

After this documentation pack:

```txt
Part-50.3 — Postman Master Collection Cleanup
Part-50.4 — Backend Smoke Testing
Part-50.5 — Backend Completion Lock
```
