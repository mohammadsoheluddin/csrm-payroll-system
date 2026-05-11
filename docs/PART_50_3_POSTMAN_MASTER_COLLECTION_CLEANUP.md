# Part-50.3 — Postman Master Collection Cleanup

Last Updated: 2026-05-11  
Project: CSRM Payroll System  
Part Type: Postman / QA / Backend Smoke Test Preparation  
API Change: No  
Backend Source Code Change: No

---

## 1. Purpose

Part-50.3 creates a clean master Postman collection and local environment for backend smoke testing.

This part prepares the project for:

```txt
Part-50.4 — Backend Smoke Testing
Part-50.5 — Backend Completion Lock
```

---

## 2. Files Added

```txt
postman/collections/csrm-payroll-backend-master-smoke-part-50.3.postman_collection.json
postman/environments/csrm-payroll-backend-smoke-local-part-50.3.postman_environment.json
docs/PART_50_3_POSTMAN_MASTER_COLLECTION_CLEANUP.md
```

---

## 3. Collection Structure

The collection contains these folders:

```txt
00 Auth - Login and Token Setup
01 Admin Smoke - Master Data
02 HR Smoke - Employee Attendance Leave
03 Accounts Payroll Smoke
04 RBAC Forbidden Tests
05 Audit Log Tests
06 Soft Delete Restore Templates - Use Test Records Only
07 Report and System Smoke
```

---

## 4. Environment Variables

Required environment variables:

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

Default local base URL:

```txt
http://localhost:5000/api/v1
```

---

## 5. Import Instructions

In Postman:

```txt
Import
→ Select files
→ Import collection JSON
→ Import environment JSON
→ Select environment from top-right dropdown
```

Collection file:

```txt
postman/collections/csrm-payroll-backend-master-smoke-part-50.3.postman_collection.json
```

Environment file:

```txt
postman/environments/csrm-payroll-backend-smoke-local-part-50.3.postman_environment.json
```

---

## 6. Token Setup

Open folder:

```txt
00 Auth - Login and Token Setup
```

Update request body email/password for each role:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Then run login requests.

The test script tries to save tokens automatically into:

```txt
adminToken
hrToken
accountsToken
managerToken
employeeToken
```

If automatic token extraction fails, manually copy the access token into the environment variable.

---

## 7. Safe Testing Rule

Do not use real production-like master data for destructive tests.

For soft delete/restore tests, create temporary records with names like:

```txt
ZZ Test Company
ZZ Test Branch
ZZ Test Department
ZZ Test Designation
ZZ Test Employee
```

Then place their `_id` values into the environment variables.

---

## 8. Payroll Generate Expected Behavior

Payroll generate request:

```json
{
  "month": 5,
  "year": 2026,
  "company": "{{companyId}}"
}
```

Expected responses:

```txt
200/201 if payroll can be generated
409 Conflict if locked attendance finalization is missing
400 if validation fails
```

A `409 Conflict` for missing locked attendance finalization is expected business-rule behavior. It means auth, RBAC, validation, and employee matching already passed.

---

## 9. RBAC Forbidden Test

Use employee token to test restricted endpoints:

```txt
GET /payroll
GET /audit-logs
GET /users
```

Expected:

```txt
401 or 403
```

Then with admin token:

```txt
GET /audit-logs?action=permission_denied
```

Expected:

```txt
permission_denied audit log appears
riskLevel: high
category: authorization
```

---

## 10. Recommended Run Order

Run manually in this order:

```txt
1. Auth login requests
2. Admin master smoke list endpoints
3. HR smoke list endpoints
4. Accounts/payroll smoke list endpoints
5. Payroll generate business-rule test
6. RBAC forbidden tests
7. Audit log tests
8. Soft delete/restore templates only with ZZ test records
9. Report/system smoke
```

Do not run the full collection blindly with destructive tests until all ID variables are set to safe test records.

---

## 11. Backend Health Commands Before Postman

Run first:

```bash
cd /e/Projects/CSRM-Payroll-System

node scripts/backend-health-check.cjs
```

Then:

```bash
cd /e/Projects/CSRM-Payroll-System/server

npm run dev
```

---

## 12. Git Commands

```bash
cd /e/Projects/CSRM-Payroll-System

git add postman/collections/csrm-payroll-backend-master-smoke-part-50.3.postman_collection.json \
postman/environments/csrm-payroll-backend-smoke-local-part-50.3.postman_environment.json \
docs/PART_50_3_POSTMAN_MASTER_COLLECTION_CLEANUP.md

git commit -m "test: add backend master smoke postman collection"

git push
```

---

## 13. Next Logical Part

```txt
Part-50.4 — Backend Smoke Testing
```

In Part-50.4, run the collection manually and record results module by module.
