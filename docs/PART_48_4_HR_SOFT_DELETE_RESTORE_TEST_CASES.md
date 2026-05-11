# Part-48.4 — HR / Employee Related Soft Delete Restore Test Cases

Created: 2026-05-11

## Scope

This part applies the soft delete / restore standard to selected HR-related modules:

1. Employee Bank Info
2. Employee Movement
3. Employee Bulk Import Batch

The main Employee module is intentionally excluded from this part because employee deletion requires a separate employment lifecycle policy covering inactive/resigned/terminated/retired/suspended status, payroll history, attendance, leave, and employeeId reuse rules.

---

## New API Endpoints

### Employee Bank Info

```http
GET    /api/v1/employee-bank-infos/deleted
DELETE /api/v1/employee-bank-infos/:id
PATCH  /api/v1/employee-bank-infos/:id/restore
```

### Employee Movement

```http
GET    /api/v1/employee-movements/deleted
DELETE /api/v1/employee-movements/:id
PATCH  /api/v1/employee-movements/:id/restore
```

### Employee Bulk Import

```http
GET    /api/v1/employee-bulk-imports/deleted
DELETE /api/v1/employee-bulk-imports/:id
PATCH  /api/v1/employee-bulk-imports/:id/restore
```

---

## Standard Request Bodies

### Soft Delete

```json
{
  "deleteReason": "Part-48.4 soft delete test"
}
```

### Restore

```json
{
  "restoreReason": "Part-48.4 restore test"
}
```

---

## Employee Bank Info Test Flow

1. Create or identify a safe test employee bank/payment info record.
2. Run `GET /employee-bank-infos` and confirm the record appears.
3. Run `DELETE /employee-bank-infos/:id` with `deleteReason`.
4. Run `GET /employee-bank-infos/:id` and expect 404.
5. Run `GET /employee-bank-infos/deleted` and confirm the record appears.
6. Run `PATCH /employee-bank-infos/:id/restore` with `restoreReason`.
7. Run `GET /employee-bank-infos/:id` and expect 200.

Important check:

- If the deleted record was primary, the system will turn it non-primary during delete.
- On restore, it becomes primary only if no other active primary payment info exists for that employee.
- Duplicate bank/mobile/cash payment information should still be blocked during restore.

---

## Employee Movement Test Flow

1. Create or identify a safe draft/pending/rejected employee movement.
2. Run `GET /employee-movements` and confirm the record appears.
3. Run `DELETE /employee-movements/:id` with `deleteReason`.
4. Run `GET /employee-movements/:id` and expect 404.
5. Run `GET /employee-movements/deleted` and confirm the record appears.
6. Run `PATCH /employee-movements/:id/restore` with `restoreReason`.
7. Run `GET /employee-movements/:id` and expect 200.

Important check:

- Applied employee movements cannot be deleted.
- If a movement is already applied, create a reverse/correction movement instead.

---

## Employee Bulk Import Batch Test Flow

1. Create or identify a safe test employee bulk import batch.
2. Run `GET /employee-bulk-imports` and confirm the batch appears.
3. Run `DELETE /employee-bulk-imports/:id` with `deleteReason`.
4. Run `GET /employee-bulk-imports/:id` and expect 404.
5. Run `GET /employee-bulk-imports/deleted` and confirm the batch appears.
6. Run `PATCH /employee-bulk-imports/:id/restore` with `restoreReason`.
7. Run `GET /employee-bulk-imports/:id` and expect 200.

Important check:

- Deleting an employee bulk import batch does not revert employees.
- Revert is a separate controlled workflow: `PATCH /employee-bulk-imports/:id/revert`.

---

## Validation Tests

### Invalid ObjectId

```http
DELETE /api/v1/employee-bank-infos/abc
PATCH /api/v1/employee-movements/abc/restore
DELETE /api/v1/employee-bulk-imports/abc
```

Expected:

```txt
400 Bad Request
```

### Empty Reason

```json
{
  "deleteReason": ""
}
```

Expected:

```txt
400 Bad Request
```

---

## Audit Log Tests

After testing, check:

```http
GET /api/v1/audit-logs?action=soft_delete
GET /api/v1/audit-logs?action=restore
```

Expected:

- employee_bank_info soft_delete / restore logs
- employee_movement soft_delete / restore logs
- employee_bulk_import soft_delete / restore logs

---

## Safety Rule

Do not test with real production-like employee/payment/movement/import data.

Use temporary test records only.
