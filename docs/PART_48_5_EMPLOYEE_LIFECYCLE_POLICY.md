# Part-48.5 — Employee Module Special Lifecycle Policy

Date: 2026-05-11

## Purpose

Employee records are more sensitive than normal master data. An employee connects attendance, leave, payroll, salary, bank payment, bonus, time bill, audit log, and compliance history.

So the Employee module should not behave like a simple master-data delete/restore module.

This part adds:

- Employee lifecycle endpoint
- Employee soft delete/restore metadata
- Deleted employee list API
- Permanent employeeId protection reminder
- Status and employmentStatus separation
- Required reason for employee soft delete/restore/lifecycle change
- Restore conflict guard for officeId/cardNo
- Audit log entries for lifecycle, soft delete, and restore

---

## Business Rule Summary

### employeeId is permanent

`employeeId` must never be reused.

Even if the employee resigns, is terminated, retires, becomes inactive, or is soft-deleted, the same employeeId must not be assigned to another employee.

### Normal lifecycle is not delete

For real HR cases, use lifecycle change:

- active
- probation
- confirmed
- resigned
- terminated
- retired
- suspended

### Soft delete is only for exceptional cases

Soft delete should be used only for accidental/wrong duplicate entry cases.

For normal employee separation, use:

`PATCH /api/v1/employees/:id/lifecycle`

not delete.

---

## New / Updated APIs

### Get active employees

```http
GET /api/v1/employees
```

Returns active/non-deleted employees only.

### Get deleted employees

```http
GET /api/v1/employees/deleted
```

Returns soft-deleted employees only.

### Change employee lifecycle

```http
PATCH /api/v1/employees/:id/lifecycle
```

Body:

```json
{
  "employmentStatus": "resigned",
  "effectiveDate": "2026-05-11",
  "reason": "Employee resigned from service"
}
```

Allowed `employmentStatus` values:

```txt
active
probation
confirmed
resigned
terminated
retired
suspended
```

System automatically calculates `status`:

| employmentStatus | status |
| ---------------- | ------ |
| active | active |
| probation | active |
| confirmed | active |
| resigned | inactive |
| terminated | inactive |
| retired | inactive |
| suspended | inactive |

### Soft delete employee

```http
DELETE /api/v1/employees/:id
```

Body:

```json
{
  "deleteReason": "Wrong duplicate employee entry created by mistake"
}
```

This will:

- set `isDeleted: true`
- set `status: inactive`
- preserve previous `status` and `employmentStatus`
- keep employeeId permanently reserved
- create audit log

### Restore employee

```http
PATCH /api/v1/employees/:id/restore
```

Body:

```json
{
  "restoreReason": "Employee entry was deleted by mistake"
}
```

Restore will:

- set `isDeleted: false`
- restore previous `status` if available
- restore previous `employmentStatus` if available
- block restore if officeId/cardNo conflicts with another active employee
- validate company/majorDepartment/department/designation/branch still exist and are active
- create audit log

---

## Important Validation Change

Generic employee update no longer accepts lifecycle fields.

These fields must not be changed through `PATCH /api/v1/employees/:id`:

- `status`
- `employmentStatus`

Use this instead:

```http
PATCH /api/v1/employees/:id/lifecycle
```

Reason: employee lifecycle changes are important HR events and must always include effective date/reason/audit trail.

---

## Postman Test Plan

Use admin/super_admin token.

### 1. Create or select a safe test employee

Do not test using real production-like employee data.

Use a temporary test employee such as:

```txt
ZZ Test Employee Lifecycle
```

### 2. Lifecycle change test

Request:

```http
PATCH {{baseUrl}}/employees/{{employeeId}}/lifecycle
```

Body:

```json
{
  "employmentStatus": "resigned",
  "effectiveDate": "2026-05-11",
  "reason": "Part-48.5 lifecycle resigned test"
}
```

Expected:

- 200 OK
- `employmentStatus: resigned`
- `status: inactive`
- `separatedAt` set
- `separationReason` set

### 3. Reactivate test

Request:

```http
PATCH {{baseUrl}}/employees/{{employeeId}}/lifecycle
```

Body:

```json
{
  "employmentStatus": "active",
  "effectiveDate": "2026-05-11",
  "reason": "Part-48.5 reactivation test"
}
```

Expected:

- 200 OK
- `employmentStatus: active`
- `status: active`
- `separatedAt: null`
- `separationReason: null`

### 4. Soft delete test

Request:

```http
DELETE {{baseUrl}}/employees/{{employeeId}}
```

Body:

```json
{
  "deleteReason": "Part-48.5 employee soft delete test"
}
```

Expected:

- 200 OK
- `isDeleted: true`
- `status: inactive`
- `deletedAt` set
- `deletedBy` set if token user id is available

### 5. Normal get after delete

Request:

```http
GET {{baseUrl}}/employees/{{employeeId}}
```

Expected:

- 404 Not Found

### 6. Deleted list

Request:

```http
GET {{baseUrl}}/employees/deleted
```

Expected:

- 200 OK
- deleted employee appears

### 7. Restore test

Request:

```http
PATCH {{baseUrl}}/employees/{{employeeId}}/restore
```

Body:

```json
{
  "restoreReason": "Part-48.5 employee restore test"
}
```

Expected:

- 200 OK
- `isDeleted: false`
- status/employmentStatus restored from before delete where possible

### 8. Audit log check

```http
GET {{baseUrl}}/audit-logs?module=employee&action=status_change
```

```http
GET {{baseUrl}}/audit-logs?module=employee&action=soft_delete
```

```http
GET {{baseUrl}}/audit-logs?module=employee&action=restore
```

Expected:

- employee lifecycle/delete/restore audit records should appear.

---

## Notes for Future Parts

Future hardening should check dependencies before employee soft delete:

- payroll generated records
- attendance finalized period
- approved leave
- bank sheet/payment distribution
- salary statement
- time bill/OT/bonus records

For now, Part-48.5 focuses on lifecycle foundation and safe employeeId policy.
