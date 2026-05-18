# Part-B56/F21 - Attendance Finalization Live Workflow

## Purpose

Connect the existing attendance-finalization backend workflow to the attendance register UI so authorized users can generate, finalize, approve, lock, and unlock monthly attendance summaries from the live frontend.

## Changed Files

```text
client/src/config/apiRoutes.ts
client/src/lib/query/queryKeys.ts
client/src/features/attendance-leave/types/attendanceLeave.types.ts
client/src/features/attendance-leave/api/attendanceFinalization.api.ts
client/src/features/attendance-leave/hooks/useAttendanceFinalization.ts
client/src/features/attendance-leave/components/AttendanceFinalizationFoundationPanel.tsx
client/src/features/attendance-leave/pages/AttendanceRegisterPage.tsx
docs/PART_B56_F21_ATTENDANCE_FINALIZATION_LIVE_WORKFLOW.md
```

## Backend Routes Used

```text
GET   /api/v1/attendance-finalizations
GET   /api/v1/attendance-finalizations/summary
POST  /api/v1/attendance-finalizations/generate
PATCH /api/v1/attendance-finalizations/bulk/finalize
PATCH /api/v1/attendance-finalizations/bulk/approve
PATCH /api/v1/attendance-finalizations/bulk/lock
PATCH /api/v1/attendance-finalizations/bulk/unlock
```

These routes already existed before this part and are protected by:

```text
attendance_finalization:read
attendance_finalization:process
attendance_finalization:approve
attendance_finalization:lock
attendance_finalization:unlock
```

## Business Logic

1. Attendance finalization remains company-scoped, so the UI requires a selected company before loading readiness or running month actions.
2. The live panel uses backend summary data for draft/finalized/approved/locked counts, lock totals, blockers, and payroll readiness.
3. Generate creates or refreshes monthly finalization records through the existing backend rules.
4. Finalize, approve, lock, and unlock use the existing strict bulk action endpoints for the currently selected month/filter scope.
5. Payroll readiness stays explicit: native payroll and salary-sheet processing must use locked attendance finalizations, not raw attendance rows.
6. Legacy salary archive data remains separate from native payroll calculation.

## Frontend Behavior

- Shows loading, API error, missing-company, empty, and ready states.
- Shows status badges for draft, finalized, approved, and locked records.
- Shows backend-derived blockers and payroll-ready / payroll-blocked badges.
- Shows permission-aware live action buttons only when the current role can perform the action.
- Keeps the payroll warning visible even when no company is selected or finalization access is missing.

## Notes / Limitations

- This part does not redesign attendance filtering or add backend calculation rules.
- The panel currently uses the attendance register's available company, department, and employee filters as the workflow scope.
- Validation checklist items remain review guidance; the authoritative readiness result comes from the backend summary endpoint.
- Dedicated list/detail UI for individual attendance-finalization records can be expanded in a later part if needed.

## Testing Guide

```bash
cd server
npm run build
npm run route:sanity

cd ../client
npm run lint
npm run build
```

Manual browser checklist:

1. Open `/attendance`.
2. Select a company and month.
3. Confirm summary loading and payroll readiness badges render.
4. Generate monthly attendance finalization records.
5. Move the month through finalize, approve, lock, and unlock as permissions allow.
6. Confirm each action refreshes status counts and blockers.
7. Confirm users without matching permissions do not see unavailable workflow actions.

## Next Logical Part

Part-B57/F22 - Attendance finalization record drill-down, exception review, and dedicated operational list page.
