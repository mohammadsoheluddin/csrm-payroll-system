# Part-50.4 — Backend Smoke Testing

Last Updated: 2026-05-11  
Project: CSRM Payroll System  
Part Type: Manual QA / Backend Verification  
API Change: No  
Backend Source Code Change: No

---

## 1. Purpose

Part-50.4 is the backend smoke testing phase.

The goal is not to add new code. The goal is to verify that the backend is healthy after the recent standardization work.

This part validates:

- Auth
- RBAC
- Master data
- HR / employee
- Attendance / leave
- Payroll / salary
- Reports
- Audit logs
- Soft delete / restore
- Route sanity
- Business-rule conflict behavior

---

## 2. Required Pre-Test Commands

Run from project root:

```bash
cd /e/Projects/CSRM-Payroll-System

node scripts/backend-health-check.cjs
```

Then run server:

```bash
cd /e/Projects/CSRM-Payroll-System/server

npm run dev
```

Expected:

```txt
MongoDB connected
Server running
No runtime import error
```

---

## 3. Postman Environment

Use this environment:

```txt
CSRM Payroll Backend Smoke Local - Part 50.3
```

Required variables:

```txt
baseUrl
adminToken
hrToken
accountsToken
managerToken
employeeToken
companyId
branchId
majorDepartmentId
departmentId
designationId
employeeId
companyBankAccountId
payrollId
salaryStructureId
attendanceId
leaveId
```

Important:

Tokens and IDs will be blank after import. This is normal.

Fill them by:

1. running login requests, or
2. manually copying values from your old Part-48.3 environment, or
3. copying valid IDs from MongoDB/Postman responses.

---

## 4. Smoke Test Order

### Stage 1 — Auth

Run:

```txt
00 Auth - Login and Token Setup
```

Test:

```txt
Admin Login
HR Login
Accounts Login
Manager Login
Employee Login
```

Expected:

```txt
200/201
token returned
token saved into environment variable
```

If token is not auto-saved, copy manually.

---

### Stage 2 — Admin Master Data Smoke

Run:

```txt
01 Admin Smoke - Master Data
```

Expected for list endpoints:

```txt
200 OK
```

Covered:

```txt
Companies
Branches
Major Departments
Departments
Designations
Company Bank Accounts
Deleted list endpoints
```

---

### Stage 3 — HR Smoke

Run:

```txt
02 HR Smoke - Employee Attendance Leave
```

Expected:

```txt
200 OK
or valid business/authorization response depending on token permission
```

Covered:

```txt
Employees
Employee Bank Info
Employee Movement
Employee Bulk Import
Attendance
Attendance Import
Attendance Finalization
Leave
Leave Balance
Holiday
```

---

### Stage 4 — Payroll / Accounts Smoke

Run:

```txt
03 Accounts Payroll Smoke
```

Expected list endpoints:

```txt
200 OK
```

Payroll generate expected:

```txt
200/201 if all business prerequisites exist
409 Conflict if locked attendance finalization is missing
400 if validation body is wrong
```

A `409 Conflict` for missing attendance finalization is not a system failure. It proves the request reached business-rule validation.

---

### Stage 5 — RBAC Forbidden Tests

Run:

```txt
04 RBAC Forbidden Tests
```

Use employee token.

Expected:

```txt
403 Forbidden
```

For:

```txt
GET /payroll
GET /audit-logs
GET /users
```

---

### Stage 6 — Audit Log Tests

Run:

```txt
05 Audit Log Tests
```

Expected:

```txt
200 OK
permission_denied log found
riskLevel: high
category: authorization
```

---

### Stage 7 — Soft Delete / Restore Templates

Run only with temporary ZZ test records.

Never run destructive tests on real master data.

Expected:

```txt
DELETE /resource/:id => 200
GET /resource/deleted => record appears
PATCH /resource/:id/restore => 200
```

---

### Stage 8 — Report and System Smoke

Run:

```txt
07 Report and System Smoke
```

Expected:

```txt
200 OK
or known business-rule response
```

Covered:

```txt
Report Center
Report Layout Standards
Month-End Process Control
RBAC Audit
```

---

## 5. How to Mark Results

Use this format:

```txt
Module:
Request:
Token/Role:
Expected:
Actual:
Status: PASS / FAIL / SKIPPED
Note:
```

Example:

```txt
Module: Payroll
Request: POST /payroll/generate
Token/Role: accounts
Expected: 409 if attendance finalization missing
Actual: 409
Status: PASS
Note: Business rule correctly blocked payroll generation
```

---

## 6. What Counts as PASS?

### PASS

```txt
200 OK for list/read
201 Created for create
400 Bad Request for intentional invalid validation
403 Forbidden for employee restricted access
404 Not Found for intentionally deleted active-record lookup
409 Conflict for expected business-rule blocker
```

### FAIL

```txt
500 Internal Server Error
Route not found when route should exist
Wrong token gets access to restricted route
Server crash
TypeScript/build failure
Unexpected validation issue
Unexpected empty result where required data exists
```

---

## 7. Completion Criteria

Part-50.4 can be considered complete when:

```txt
[ ] backend health check passed
[ ] server runs
[ ] admin login works
[ ] at least admin master list endpoints work
[ ] HR list endpoints work or expected permission responses are understood
[ ] payroll list works
[ ] payroll generate reaches business-rule layer
[ ] employee forbidden tests create permission_denied audit
[ ] audit log sensitive/high/category filters work
[ ] no 500 error appears in core smoke tests
[ ] results documented
```

---

## 8. Git Commands

This part is documentation/testing only.

After completing tests and recording results:

```bash
cd /e/Projects/CSRM-Payroll-System

git add docs/PART_50_4_BACKEND_SMOKE_TESTING.md docs/BACKEND_SMOKE_TEST_RESULTS.md

git commit -m "test: record backend smoke testing plan and results"

git push
```

---

## 9. Next Logical Part

```txt
Part-50.5 — Backend Completion Lock
```

Only move to Part-50.5 after smoke testing results are acceptable.
