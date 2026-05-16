# Part-F20 - Attendance Register + Attendance Finalization UI Foundation

## Purpose

This part extends the existing attendance register frontend and adds the first monthly attendance finalization UI foundation without introducing risky backend payroll calculations.

## Scope

- Keeps the existing attendance register route at `/attendance`.
- Adds company and department UI filters using existing employee/master-data lookup APIs.
- Keeps backend attendance filtering unchanged; company and department narrow the already-loaded result set on the client.
- Adds summary cards for:
  - present
  - absent
  - leave
  - late
  - manual entries
- Preserves loading, error, empty, create, edit, delete, and restore states already present in the register.
- Adds a monthly finalization preparation panel with:
  - selected month
  - validation checklist placeholder
  - finalize / lock status placeholders
  - permission-aware placeholder buttons
  - payroll safety warning

## Changed Files

```text
client/src/features/attendance-leave/types/attendanceLeave.types.ts
client/src/features/attendance-leave/config/attendanceLeave.constants.ts
client/src/features/attendance-leave/components/AttendanceToolbar.tsx
client/src/features/attendance-leave/components/AttendanceLeaveStatCards.tsx
client/src/features/attendance-leave/components/AttendanceFinalizationFoundationPanel.tsx
client/src/features/attendance-leave/pages/AttendanceRegisterPage.tsx
docs/PART_F20_ATTENDANCE_REGISTER_FINALIZATION_UI_FOUNDATION.md
```

## Routes

```text
/attendance
```

The attendance register route, sidebar entry, and lazy-route wiring already existed before Part-F20, so this part keeps those paths intact rather than duplicating them.

## APIs Used

```text
GET /api/v1/attendance
GET /api/v1/attendance/deleted
GET /api/v1/employees
GET /api/v1/companies
GET /api/v1/departments
```

## Business Rules

1. Payroll should use finalized attendance summaries, not raw attendance rows.
2. Part-F20 does not calculate, finalize, approve, or lock attendance on the backend.
3. Existing payroll and legacy salary separation remains unchanged.
4. Existing attendance create/edit/delete/restore permission checks remain enforced.
5. Finalization action buttons are permission-aware UI placeholders only until the later backend finalization workflow part is implemented.

## Notes / Limitations

- Backend attendance list filtering still supports only employee, status, source, exact date, and date range.
- Company and department filters are intentionally client-side in this part because no backend route/type change is required for the requested UI foundation.
- Monthly validation, finalization, approval, lock, and unlock actions remain placeholders and are not wired to backend calculations yet.

## Testing Guide

```bash
cd client
npm run lint
npm run build
```

Manual browser checklist:

1. Open `/attendance`.
2. Verify present, absent, leave, late, and manual-entry summary cards render.
3. Filter by date range, employee, status, company, and department.
4. Confirm create/edit/delete/restore controls remain permission-aware.
5. Confirm loading, API error, and empty table states still render cleanly.
6. Review the monthly finalization foundation panel.
7. Confirm the payroll warning states that finalized summaries should be used instead of raw attendance.

## Next Logical Part

Part-B56 / Part-F21 - Attendance Finalization backend hardening and live finalization workflow UI.
