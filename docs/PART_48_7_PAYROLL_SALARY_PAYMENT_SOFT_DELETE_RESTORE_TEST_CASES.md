# Part-48.7 — Payroll / Salary / Payment Soft Delete Restore Standard

Created: 2026-05-11

## Scope

This part applies the common soft delete / restore foundation to payroll, salary, time bill, OT, bonus, payment-distribution, and bank-sheet-history records.

## Modules Covered

Implemented soft delete / restore APIs for:

1. `salaryStructure`
2. `payroll`
3. `salarySheet`
4. `salaryStatement`
5. `salaryPaymentDistribution`
6. `timeBill`
7. `otStatement`
8. `otPaymentDistribution`
9. `bonusSheet`
10. `bonusStatement`
11. `bonusPaymentDistribution`
12. `bankSheetHistory`

Not directly applicable in this part:

- `payrollReport` — report/read/export layer only, no persistent model-level record to restore.
- `bankSheet` — preview/export layer only. Persistent export history is handled through `bankSheetHistory`.

## Standard Metadata Fields

The covered persistent models now support the standard soft delete metadata:

```ts
isDeleted
removedAt/deletedAt through common soft delete fields
removedBy/deletedBy through common soft delete fields
deleteReason
restoredAt
restoredBy
restoreReason
updatedBy
```

Actual persisted common fields are defined in:

```txt
server/src/common/softDelete.ts
server/src/common/financialRecordSoftDelete.ts
```

## Business Safety Rules

For financial/payroll records, delete and restore are controlled operations.

Delete/restore is blocked if the record is locked/finalized/paid:

- `isLocked: true`
- `status: locked`
- `status: paid`
- `status: finalized`

For locked or finalized records, use the proper business workflow first:

- unlock
- void
- reversal
- correction
- regeneration
- audit-approved adjustment

Do not hard-delete payroll/accounting-grade data.

## New API Pattern

Each covered module follows the same API convention.

### Deleted List

```http
GET /api/v1/<resource>/deleted
```

### Soft Delete

```http
DELETE /api/v1/<resource>/:id
```

Body:

```json
{
  "deleteReason": "Part-48.7 soft delete test"
}
```

### Restore

```http
PATCH /api/v1/<resource>/:id/restore
```

Body:

```json
{
  "restoreReason": "Part-48.7 restore test"
}
```

## Resource Routes

| Module | Deleted List | Restore | Delete |
| --- | --- | --- | --- |
| Salary Structure | `GET /salary-structure/deleted` | `PATCH /salary-structure/:id/restore` | `DELETE /salary-structure/:id` |
| Payroll | `GET /payroll/deleted` | `PATCH /payroll/:id/restore` | `DELETE /payroll/:id` |
| Salary Sheet | `GET /salary-sheets/deleted` | `PATCH /salary-sheets/:id/restore` | `DELETE /salary-sheets/:id` |
| Salary Statement | `GET /salary-statements/deleted` | `PATCH /salary-statements/:id/restore` | `DELETE /salary-statements/:id` |
| Salary Payment Distribution | `GET /salary-payment-distributions/deleted` | `PATCH /salary-payment-distributions/:id/restore` | `DELETE /salary-payment-distributions/:id` |
| Time Bill | `GET /time-bills/deleted` | `PATCH /time-bills/:id/restore` | `DELETE /time-bills/:id` |
| OT Statement | `GET /ot-statements/deleted` | `PATCH /ot-statements/:id/restore` | `DELETE /ot-statements/:id` |
| OT Payment Distribution | `GET /ot-payment-distributions/deleted` | `PATCH /ot-payment-distributions/:id/restore` | `DELETE /ot-payment-distributions/:id` |
| Bonus Sheet | `GET /bonus-sheets/deleted` | `PATCH /bonus-sheets/:id/restore` | `DELETE /bonus-sheets/:id` |
| Bonus Statement | `GET /bonus-statements/deleted` | `PATCH /bonus-statements/:id/restore` | `DELETE /bonus-statements/:id` |
| Bonus Payment Distribution | `GET /bonus-payment-distributions/deleted` | `PATCH /bonus-payment-distributions/:id/restore` | `DELETE /bonus-payment-distributions/:id` |
| Bank Sheet History | `GET /bank-sheet-history/deleted` | `PATCH /bank-sheet-history/:id/restore` | `DELETE /bank-sheet-history/:id` |

## Basic Postman Test Flow

Use a safe temporary or draft/unlocked record only.

1. Run active list or single get to confirm the record exists.
2. Run `DELETE /:id` with a delete reason.
3. Confirm the record no longer appears in normal active list.
4. Run `GET /deleted`.
5. Confirm the deleted record appears.
6. Run `PATCH /:id/restore` with a restore reason.
7. Confirm the record appears again in normal active API.

## Important Testing Warning

Do not use locked, approved, paid, real production-like payroll/payment records for delete/restore test.

Safe testing should use:

- temporary generated draft record
- unlocked record
- non-production test employee
- non-production test month

## Expected Errors

### Locked Record Delete

If a record is locked/finalized/paid, delete should return an error similar to:

```txt
Record is locked/finalized and cannot be deleted. Use unlock/void/reversal workflow first.
```

### Duplicate Restore

If an active duplicate already exists, restore should be blocked with a conflict message.

## Build Verification

Run:

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run build
```

Expected: build passed.
