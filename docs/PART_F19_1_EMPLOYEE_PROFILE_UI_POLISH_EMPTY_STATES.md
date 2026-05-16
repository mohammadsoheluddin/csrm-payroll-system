# Part-F19.1 — Employee Profile UI Polish + Missing Section Empty States

## Purpose

This part polishes the Part-F19 Employee Full Profile / Digital Service Book UI without changing backend APIs.

The goal is to make the profile page easier to read when some sections have no records yet, and to make profile readiness gaps more actionable for HR/Admin users.

## Scope

- Adds reusable profile empty-state component.
- Adds profile readiness panel with critical/warning/info grouping.
- Adds tab-level counters for payroll, attendance, documents, timeline, and profile gaps.
- Adds print action in the employee profile header.
- Shows selected payroll month in the profile header.
- Improves missing-section UX for salary, payment, payroll, legacy archive, attendance, leave, documents, timeline, and movement sections.
- Changes the data-gap stat into a readiness score.

## Files Changed

```text
client/src/features/employees/employee-profile/components/EmployeeProfileEmptyState.tsx
client/src/features/employees/employee-profile/components/EmployeeProfileReadinessPanel.tsx
client/src/features/employees/employee-profile/components/EmployeeProfileHeader.tsx
client/src/features/employees/employee-profile/components/EmployeeProfileStatCards.tsx
client/src/features/employees/employee-profile/components/EmployeeProfileTabs.tsx
client/src/features/employees/employee-profile/utils/employeeProfile.utils.ts
```

## Verification

```bash
cd client
npm run lint
npm run build
```

Both commands passed during patch preparation.

## Browser Test

Open:

```text
http://localhost:5173/employees
```

Then:

1. Open any employee profile.
2. Check the header shows generated time and selected month.
3. Check Print button is visible.
4. Check stat cards show profile readiness percentage.
5. Open each profile tab.
6. Confirm empty sections show polished empty-state cards instead of plain text.
7. Confirm profile readiness gaps are grouped with critical/warning/info counters.
8. Confirm tab counters appear for sections with data.
9. Confirm Document Vault and Timeline sections still work.

## Notes

This part is UI-only. It does not change employee profile API, document upload API, or payroll calculation rules.
