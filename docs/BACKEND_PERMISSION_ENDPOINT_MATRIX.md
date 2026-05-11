# CSRM Payroll System — Backend Permission / Endpoint Matrix

Last Updated: 2026-05-11  
Created In: Part-50.2 — Backend API Documentation Pack

---

## 1. Purpose

This document maps major backend endpoint groups to likely permission requirements.

The actual source of truth remains:

```txt
server/src/modules/user/user.constant.ts
server/src/modules/**/*.route.ts
docs/RBAC_PERMISSION_MATRIX.md
```

This document is for frontend route guards, Postman test planning, and developer onboarding.

---

## 2. Permission Pattern

Common permission pattern:

```txt
module:read
module:manage
module:update
module:approve
module:process
module:restore
module:delete
```

Current project still contains some broader permissions such as:

```txt
user:read
user:manage
employee:read
employee:manage
attendance:read
attendance:manage
leave:read
leave:manage
leave:approve
payroll:read
payroll:update
payroll:process
payroll:approve
```

---

## 3. Role Groups

Main roles:

```txt
super_admin
admin
hr
accounts
manager
employee
```

General access expectation:

| Role | Access Summary |
| ---- | -------------- |
| super_admin | Full system control |
| admin | Broad admin control |
| hr | HR, employee, attendance, leave, salary/payroll read/prepare |
| accounts | Payroll, salary, payment, bank/export related work |
| manager | Department/team read and approvals where allowed |
| employee | Self-service only |

---

## 4. Endpoint Group Matrix

| Endpoint Group | Read Permission | Manage/Process Permission | Notes |
| -------------- | --------------- | ------------------------- | ----- |
| `/users` | `user:read` | `user:manage` | Admin/system area |
| `/companies` | master read/manage | master manage | Company/concern |
| `/branches` | master read/manage | master manage | Branch setup |
| `/major-departments` | master read/manage | master manage | Payroll reporting group |
| `/departments` | master read/manage | master manage | Department setup |
| `/designations` | master read/manage | master manage | Designation setup |
| `/company-bank-accounts` | company bank read/manage | company bank manage | Accounts-sensitive |
| `/employees` | `employee:read` | `employee:manage` | Employee master and lifecycle |
| `/employee-bank-infos` | employee/payment read | employee/payment manage | HR/accounts sensitive |
| `/employee-movements` | employee movement read | employee movement manage | Transfer/promotion/increment |
| `/employee-bulk-imports` | employee import read | employee import manage | HR bulk operation |
| `/attendance` | `attendance:read` | `attendance:manage` | Payroll-sensitive |
| `/attendance-imports` | attendance import read | attendance import manage | Bulk attendance |
| `/attendance-finalizations` | attendance finalization read | attendance finalization manage | Payroll gate |
| `/leave` | `leave:read` | `leave:manage`, `leave:approve` | Approval-sensitive |
| `/leave-balances` | leave balance read | leave balance manage | HR sensitive |
| `/holiday` | holiday read | holiday manage | Master data |
| `/salary-structure` | `salary_structure:read` | `salary_structure:manage` | Payroll setup |
| `/payroll` | `payroll:read` | `payroll:update`, `payroll:process`, `payroll:approve` | Core payroll |
| `/payroll-reports` | payroll/report read | payroll/report export | Report/export |
| `/salary-sheets` | salary sheet read | salary sheet process/manage | Payroll report |
| `/salary-statements` | salary statement read | salary statement process/manage | Payroll report |
| `/salary-payment-distributions` | salary payment read | salary payment process/manage | Accounts-sensitive |
| `/time-bills` | time bill read | time bill process/manage | OT/time bill |
| `/ot-statements` | OT statement read | OT statement process/manage | OT report |
| `/ot-payment-distributions` | OT payment read | OT payment process/manage | Accounts-sensitive |
| `/bonus-sheets` | bonus sheet read | bonus sheet process/manage | Bonus |
| `/bonus-statements` | bonus statement read | bonus statement process/manage | Bonus report |
| `/bonus-payment-distributions` | bonus payment read | bonus payment process/manage | Accounts-sensitive |
| `/bank-sheets` | bank sheet read/export | bank sheet process/export | Accounts-sensitive |
| `/bank-sheet-history` | bank sheet history read | bank sheet history manage | Audit/history |
| `/report-center` | report read | report manage/export | Saved report configs |
| `/report-layout-standards` | layout read | layout manage | Report design config |
| `/month-end-process-control` | month-end read | month-end manage/lock/unlock | Governance |
| `/audit-logs` | audit read | audit admin | Sensitive |
| `/rbac-audit` | RBAC audit read | RBAC admin | Sensitive |

---

## 5. Frontend Route Guard Strategy

Frontend route should check:

```txt
logged-in user
role
permissions array
route required permission
menu visibility
button visibility
```

Examples:

```txt
Payroll menu visible if user has payroll:read
Generate Payroll button visible if user has payroll:process
Approve Payroll button visible if user has payroll:approve
Employee create button visible if user has employee:manage
Audit Log visible only for admin/super_admin or audit permission
```

---

## 6. Important RBAC Testing

### Admin Token

Should access:

```txt
GET /payroll
GET /salary-structure
GET /audit-logs
```

### Employee Token

Should fail with `403 Forbidden`:

```txt
GET /payroll
GET /audit-logs
GET /users
```

After forbidden test, admin should verify:

```http
GET /api/v1/audit-logs?action=permission_denied
```

Expected:

```txt
permission_denied audit log exists
riskLevel: high
category: authorization
```

---

## 7. Remaining RBAC Work

Before production:

```txt
Cross-check all route files
Update RBAC_PERMISSION_MATRIX.md
Confirm accounts role permissions
Confirm manager role permissions
Confirm employee self-service permissions
Add frontend menu/button guards
Add Postman role-wise tests
```
