# Part-F20.1 - Attendance Register UI Polish + Browser Test Fix Pass

## Purpose

This part polishes the Part-F20 attendance register frontend without changing backend attendance or payroll calculation behavior.

## Scope

- Improves the attendance page header and filter layout across desktop/tablet widths.
- Keeps summary cards compact and stable across more breakpoints.
- Adds a clearer empty state when filters return no attendance rows.
- Shows a lookup warning if company/department filter options cannot load while attendance data remains usable.
- Hides the table action column for users without attendance management permission.
- Improves the finalization foundation panel with clearer permission and placeholder states.
- Preserves the rule that payroll should use finalized attendance summaries, not raw attendance rows.

## Changed Files

```text
client/src/features/attendance-leave/pages/AttendanceRegisterPage.tsx
client/src/features/attendance-leave/components/AttendanceToolbar.tsx
client/src/features/attendance-leave/components/AttendanceLeaveStatCards.tsx
client/src/features/attendance-leave/components/AttendanceFinalizationFoundationPanel.tsx
docs/PART_F20_1_ATTENDANCE_REGISTER_UI_POLISH_FIX_PASS.md
```

## Routes / APIs

No new routes or APIs were added in this part.

Existing UI route:

```text
/attendance
```

## Business Rules

1. This part is frontend polish only.
2. No backend finalization calculation is introduced.
3. Payroll calculation remains untouched.
4. Legacy salary archive data remains separate from native payroll flow.
5. Finalization remains a UI foundation until later live backend workflow work.

## Verification

```bash
cd client
npm.cmd run lint
npm.cmd run build
```

## Browser Test Checklist

1. Open `/attendance` on desktop and tablet widths.
2. Confirm filters remain readable and aligned.
3. Confirm the summary cards keep stable spacing without awkward overflow.
4. Apply filters that return no rows and confirm the new empty state appears.
5. Confirm read-only users do not see a blank table action column.
6. Review finalization placeholder messaging and permission states.
7. Confirm the payroll warning still states that finalized summaries should be used instead of raw attendance.

## Next Logical Part

Part-B56 / Part-F21 - Attendance Finalization backend hardening and live workflow UI.
