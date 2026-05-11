# CSRM Payroll System — Backend Module Summary

Last Updated: 2026-05-11  
Created In: Part-50.2 — Backend API Documentation Pack

---

## 1. Project Maturity

The backend has moved from a basic payroll CRUD project to an early enterprise HRIS/payroll backend platform.

Current backend coverage includes:

```txt
Authentication
User and RBAC
Organization master data
Employee management
Employee lifecycle
Employee bank/payment info
Employee movement
Employee bulk import
Attendance
Attendance import
Attendance finalization
Leave
Leave balance
Holiday
Salary structure
Payroll
Salary sheet
Salary statement
Salary payment distribution
Time bill
OT statement
OT payment distribution
Bonus sheet
Bonus statement
Bonus payment distribution
Bank sheet
Bank sheet history
Report center
Report layout standard
Month-end process control
Audit log
RBAC audit
Soft delete / restore
Validation standard
Response/error standard
Route sanity checker
Backend health checker
```

---

## 2. Core Backend Flow

Most modules follow this structure:

```txt
route
→ validation
→ controller
→ service
→ model
→ MongoDB
```

Example:

```txt
POST /employees
→ employee.route.ts
→ employee.validation.ts
→ employee.controller.ts
→ employee.service.ts
→ employee.model.ts
→ employees collection
```

---

## 3. Module Groups

### Core / Master

| Module | Purpose |
| ------ | ------- |
| auth | Login/session/authentication |
| user | Users, role assignment, account management |
| company | Company/concern setup |
| branch | Branch setup |
| majorDepartment | Payroll reporting group / major department |
| department | Department setup |
| designation | Designation setup |
| companyBankAccount | Company bank account setup |

### HR / Employee

| Module | Purpose |
| ------ | ------- |
| employee | Employee master and lifecycle |
| employeeBankInfo | Employee bank/cash/mobile payment setup |
| employeeMovement | Transfer/promotion/increment/movement tracking |
| employeeBulkImport | Bulk employee import and validation batch |

### Attendance / Leave

| Module | Purpose |
| ------ | ------- |
| attendance | Manual/processed attendance records |
| attendanceImport | Attendance import batch |
| attendanceFinalization | Payroll month attendance lock/finalization |
| leave | Leave application/approval/cancellation |
| leaveBalance | Leave opening balance, balance, adjustment |
| holiday | Holiday calendar |

### Payroll / Salary / Payment

| Module | Purpose |
| ------ | ------- |
| salaryStructure | Salary setup and structure |
| payroll | Payroll generation and payroll records |
| payrollReport | Payroll reports/exports |
| salarySheet | Salary sheet generation/history |
| salaryStatement | Salary statement generation/history |
| salaryPaymentDistribution | Bank/cash/mobile salary payment split |
| timeBill | Time bill / duty hour / tiffin / OT-related bill |
| otStatement | OT statement |
| otPaymentDistribution | OT payment split |
| bonusSheet | Bonus sheet |
| bonusStatement | Bonus statement |
| bonusPaymentDistribution | Bonus payment split |
| bankSheet | Bank sheet preview/export layer |
| bankSheetHistory | Persistent bank sheet history |

### System / Governance

| Module | Purpose |
| ------ | ------- |
| reportCenter | Saved report config and report routing |
| reportLayoutStandard | PDF/Excel layout standard |
| monthEndProcessControl | Month-end lock/process control |
| auditLog | Audit logs, sensitive log tracking |
| rbacAudit | RBAC/permission coverage audit |

---

## 4. Important Backend Standards Already Added

### Soft Delete / Restore

Standard fields:

```txt
isDeleted
deletedAt
deletedBy
deleteReason
restoredAt
restoredBy
restoreReason
updatedBy
```

Standard APIs:

```txt
GET /resource/deleted
DELETE /resource/:id
PATCH /resource/:id/restore
```

### Validation

Common validation foundation:

```txt
server/src/common/validation.ts
```

Covers:

```txt
ObjectId
ID params
month/year
pagination
status
trimmed string
date range
boolean query
```

### API Response / Error

Success response:

```json
{
  "success": true,
  "message": "Message",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Error message",
  "errorSources": []
}
```

### Route Sanity

Route sanity checker:

```txt
scripts/route-sanity-check.cjs
```

Run:

```bash
cd server
npm run route:sanity
```

### Backend Health

Backend health checker:

```txt
scripts/backend-health-check.cjs
```

Run:

```bash
node scripts/backend-health-check.cjs
```

---

## 5. Business-Critical Rules

### Employee ID

```txt
Employee ID must never be reused.
```

Even if an employee is resigned, terminated, inactive, retired, suspended, or soft-deleted, the previous employee ID must not be assigned to a new employee.

### Employee Lifecycle

Lifecycle change should use:

```http
PATCH /api/v1/employees/:id/lifecycle
```

Example statuses:

```txt
active
probation
confirmed
inactive
resigned
terminated
retired
suspended
```

### Payroll Generation

Payroll generation requires:

```txt
active employee
salary structure
attendance finalization
locked/finalized attendance period
valid company/month/year
```

If attendance finalization is missing, payroll can return:

```txt
409 Conflict
```

This is expected business behavior.

### Financial Record Delete/Restore

Payroll, salary, payment, bank, time bill, OT, and bonus records should not be freely deleted/restored if:

```txt
locked
finalized
paid
approved
```

Correct business operation may be:

```txt
unlock
void
reverse
regenerate
correction
supersede
```

---

## 6. Frontend Mapping

Backend supports these frontend sections:

```txt
Dashboard
Master Data
Employee Management
Employee Lifecycle
Employee Bank/Payment Info
Employee Movement
Bulk Import
Attendance
Attendance Import
Attendance Finalization
Leave
Leave Balance
Holiday
Salary Structure
Payroll Processing
Salary Sheet
Salary Statement
Payment Distribution
Time Bill / OT
Bonus
Bank Sheet
Report Center
Audit Log
RBAC Audit
Month-End Control
Settings / Theme / Dashboard Preferences
```

---

## 7. Current Backend Completion Status

The backend is close to a code-freeze candidate but still needs:

```txt
Part-50.3 — Postman Master Collection Cleanup
Part-50.4 — Backend Smoke Testing
Part-50.5 — Backend Completion Lock
```

Important:

Several recent parts were applied quickly and some tests were skipped. Final backend completion should not be declared until smoke testing is done.

---

## 8. Recommended Final Backend Quality Gate

Run:

```bash
cd /e/Projects/CSRM-Payroll-System

node scripts/backend-health-check.cjs
```

Then:

```bash
cd /e/Projects/CSRM-Payroll-System/server

npm run dev
```

Then run the smoke test plan from:

```txt
docs/BACKEND_TESTING_MASTER_GUIDE.md
```
