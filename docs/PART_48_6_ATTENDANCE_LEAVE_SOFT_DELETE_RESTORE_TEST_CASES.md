# Part-48.6 — Attendance / Leave Related Soft Delete Standard

Status: Build Passed  
Scope: Attendance, Attendance Import, Attendance Finalization, Leave, Leave Balance, Holiday

---

## Purpose

This part applies the soft delete / restore standard to attendance and leave related modules. These modules are more sensitive than master data because they can affect payroll, attendance finalization, leave balance, and reports.

---

## Modules Covered

1. Attendance
2. Attendance Import
3. Attendance Finalization
4. Leave
5. Leave Balance
6. Holiday

---

## New Standard Fields

The following fields are now available through the shared soft delete schema fields:

- `isDeleted`
- `deletedAt`
- `deletedBy`
- `deleteReason`
- `restoredAt`
- `restoredBy`
- `restoreReason`
- `updatedBy`

---

## New APIs

### Attendance

```http
GET    /api/v1/attendance/deleted
DELETE /api/v1/attendance/:id
PATCH  /api/v1/attendance/:id/restore
```

Business rules:

- Attendance cannot be deleted/restored if the related employee/month is locked in attendance finalization.
- Restore is blocked if another active attendance exists for the same employee and date.

---

### Attendance Import

```http
GET    /api/v1/attendance-imports/deleted
DELETE /api/v1/attendance-imports/:id
PATCH  /api/v1/attendance-imports/:id/restore
```

Business rules:

- Soft delete hides the import batch only.
- It does not revert created/updated attendance records.
- Attendance rollback/revert remains a separate controlled workflow.

---

### Attendance Finalization

```http
GET    /api/v1/attendance-finalizations/deleted
DELETE /api/v1/attendance-finalizations/:id
PATCH  /api/v1/attendance-finalizations/:id/restore
```

Business rules:

- Locked attendance finalization cannot be deleted.
- Restore is blocked if another active finalization exists for the same employee and payroll month.
- Internal `auditLogs` receives `soft_deleted` and `restored` entries.

---

### Leave

```http
GET    /api/v1/leave/deleted
DELETE /api/v1/leave/:id
PATCH  /api/v1/leave/:id/restore
```

Business rules:

- Approved leave should be cancelled/rejected through approval workflow before delete.
- Restore is blocked if overlapping active leave exists.
- Restore checks limited leave balance rules.

---

### Leave Balance

```http
GET    /api/v1/leave-balances/deleted
DELETE /api/v1/leave-balances/:id
PATCH  /api/v1/leave-balances/:id/restore
```

Business rules:

- Locked leave balance cannot be deleted.
- Restore is blocked if another active leave balance exists for the same employee, year, and leave type.
- `actionHistory` receives `soft_delete` and `restore` entries.

---

### Holiday

```http
GET    /api/v1/holiday/deleted
DELETE /api/v1/holiday/:id
PATCH  /api/v1/holiday/:id/restore
```

Business rules:

- Restore is blocked if another active holiday exists with the same holiday name and date.

---

## Request Bodies

Soft delete body:

```json
{
  "deleteReason": "Part-48.6 soft delete test"
}
```

Restore body:

```json
{
  "restoreReason": "Part-48.6 restore test"
}
```

---

## Standard Test Flow

For each module:

1. Create or identify a safe test record.
2. Run active list API.
3. Soft delete the test record.
4. Normal `GET /:id` should not return the deleted record.
5. Run `/deleted` list API.
6. Restore the test record.
7. Normal `GET /:id` should return the restored record.
8. Check audit logs for `soft_delete` and `restore`.

---

## Expected Audit Log Actions

```http
GET /api/v1/audit-logs?action=soft_delete
GET /api/v1/audit-logs?action=restore
```

---

## Important Warning

Do not test using real finalized/locked payroll-period data. Use temporary data only.

For attendance, leave, attendance finalization, and leave balance records, delete/restore is not just technical database behavior. These records directly affect payroll and should always respect lock/finalization rules.
