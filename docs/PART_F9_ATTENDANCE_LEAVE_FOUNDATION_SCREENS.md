# Part-F9 — Attendance + Leave Foundation Screens

## Status

Completed as frontend foundation screens. Backend code was not changed.

## Scope

Part-F9 connects the first Attendance & Leave operational UI screens to the existing backend APIs:

- `/attendance`
- `/leave`

The following planned routes remain placeholders for later dedicated parts:

- `/attendance/imports`
- `/attendance/finalizations`
- `/leave/balances`
- `/leave/holidays`

## Implemented Screens

### Attendance Register

Route:

```txt
/attendance
```

Backend APIs used:

```txt
GET    /attendance
GET    /attendance/deleted
POST   /attendance/create-attendance
PATCH  /attendance/:id
DELETE /attendance/:id
PATCH  /attendance/:id/restore
```

Features:

- Active/deleted attendance list
- Employee/status/source/date filters
- Exact date and from/to date range support
- Manual attendance create form
- Attendance edit form
- Soft delete with confirmation
- Restore from deleted records
- Backend validation/error display
- Permission-wise create/edit/delete/restore visibility

### Leave Applications

Route:

```txt
/leave
```

Backend APIs used:

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

Features:

- Active/deleted leave list
- Employee/type/status/date/management-concern filters
- Leave create form
- Leave edit form
- Leave approval/rejection/cancellation dialog
- Leave balance snapshot for selected employee
- Management concern fields for paid/unpaid/others leave
- Replacement leave field support
- Soft delete with confirmation
- Restore from deleted records
- Backend validation/error display
- Permission-wise create/edit/approve/delete/restore visibility

## Permission Rules

Attendance screen:

```txt
attendance:read   -> view screen/list
attendance:manage -> create/edit/delete/restore
```

Leave screen:

```txt
leave:read    -> view screen/list/balance snapshot
leave:manage  -> create/edit/delete/restore
leave:approve -> approval dialog/action
```

## Backend Notes

Part-F9 intentionally uses only backend-supported query fields:

Attendance:

```txt
employee
status
source
attendanceDate
fromDate
toDate
```

Leave:

```txt
employee
leaveType
status
fromDate
toDate
managementConcern
```

The UI does not assume unsupported company/department filters for these APIs. Those can be added later via backend report/list extension if needed.

## Important Limitations

This is a foundation pass, not final full attendance/leave suite.

Not included yet:

- Biometric/punch import UI
- Attendance import rejection report UI
- Attendance finalization workflow UI
- Dedicated leave balance ledger screen
- Holiday calendar CRUD screen
- Bulk attendance editing
- Advanced department/company attendance summary charts

Recommended next fix pass:

```txt
Part-F9.1 — Attendance + Leave UI Test & Backend Integration Fix Pass
```

Recommended next feature part after F9.1:

```txt
Part-F10 — Payroll + Salary Foundation Screens
```
