# Part-F9.1 — Attendance + Leave UI Test & Backend Integration Fix Pass

## Status

Completed as a frontend integration hardening pass.

No backend code was changed in this part.

## Purpose

Part-F9 introduced backend-connected Attendance Register and Leave Applications screens. Part-F9.1 hardens those screens against real backend validation behavior, permission behavior, payload shape issues, and form/date edge cases.

## Fixes Completed

### Attendance

- Normalized record dates before placing values into HTML date inputs.
- Cleaned attendance payload before API submission.
- Trimmed string values before sending to backend.
- Improved form-level error summary to include both client and backend field errors.
- Prevented attendance list/employee lookup queries from firing when the user does not have `attendance:read` permission.

### Leave

- Fixed critical backend validation mismatch for non-management leave types.
  - Frontend no longer sends `managementConcern: false` for normal leave types.
  - This avoids backend errors like “Management concern is allowed only for paid, unpaid or others leave”.
- Frontend only sends `managementConcern` and `managementConcernNote` for management-controlled leave types:
  - `paid`
  - `unpaid`
  - `others`
- Frontend only sends `replacementForDate` for replacement leave.
- Added client-side validation that replacement leave date must be after the worked holiday date.
- Normalized leave record dates before placing values into HTML date inputs.
- Improved form-level error summary to include both client and backend field errors.
- Prevented leave list/employee lookup queries from firing when the user does not have `leave:read` permission.

### Backend Error Mapping

- Hardened backend field-error normalization.
- `body.employee`, `query.employee`, and `params.id` style paths now map to form-friendly field keys.
- Nested paths now map to the most relevant form field where possible.

## Backend Routes Used

Attendance:

```txt
GET    /attendance
GET    /attendance/deleted
POST   /attendance/create-attendance
PATCH  /attendance/:id
DELETE /attendance/:id
PATCH  /attendance/:id/restore
```

Leave:

```txt
GET    /leave
GET    /leave/deleted
GET    /leave/balance/:employeeId?year=YYYY
POST   /leave/create-leave
PATCH  /leave/:id
PATCH  /leave/:id/approve
DELETE /leave/:id
PATCH  /leave/:id/restore
```

## Manual Test Checklist

### Attendance

1. Open `/attendance`.
2. Confirm active records load.
3. Filter by employee/status/source/date range.
4. Create a manual attendance record.
5. Try duplicate employee/date attendance and confirm backend `409` error appears clearly.
6. Try check-out time before check-in time and confirm client-side validation blocks submit.
7. Edit an attendance record.
8. Soft delete a record.
9. Switch to deleted mode and restore the record.

### Leave

1. Open `/leave`.
2. Confirm active records load.
3. Filter by employee/leave type/status/date range/management concern.
4. Create normal casual/sick/earned leave and confirm frontend does not send management concern fields.
5. Create paid/unpaid/others leave and confirm management concern + note are required.
6. Create replacement leave and confirm `replacementForDate` is required.
7. Try replacement leave where start date is before/on worked holiday date and confirm client-side validation blocks submit.
8. Try overlapping leave and confirm backend `409` error appears clearly.
9. Approve/reject/cancel pending leave if user has `leave:approve` permission.
10. Soft delete non-approved leave.
11. Switch to deleted mode and restore leave.

## Notes

- Approved leave delete behavior is intentionally controlled by backend: approved leave should be rejected/cancelled before delete.
- Attendance delete/restore can be blocked by backend if the attendance finalization/payroll month is locked.
- Route-based lazy loading is still planned for a later frontend optimization pass because Vite may show chunk-size warnings.

## Next Recommended Part

```txt
Part-F10 — Payroll + Salary Foundation Screens
```

Potential backend reserved parts:

```txt
Part-B52 — Legacy Salary Sheet Import & Archive Module
Part-B53 — Management Remuneration & Executive Compensation Module
Part-B54 — Ancillary Bill & Voucher Engine Foundation
```
