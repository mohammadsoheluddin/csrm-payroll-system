# Part-F19 — Employee Full Profile Page / Digital Service Book UI

## Purpose

This part adds the first full-page frontend UI for the Part-B53 employee profile / digital service book backend API.

The page is intentionally read-only. Editing remains inside dedicated modules such as Employee Directory, Employee Documents, Salary Structure, Attendance, Leave, Payroll, and future Movement screens.

## Route

```text
/employees/:employeeRef/profile
```

`employeeRef` can be an employee MongoDB `_id`, `employeeId`, `officeId`, or `cardNo`, matching the backend API behavior.

## Backend API used

```text
GET /api/v1/employee-profiles/:employeeRef
GET /api/v1/employee-profiles/:employeeRef/summary
```

## Frontend features added

- Full employee profile / digital service book page.
- Employee header with employee identity, company, department, designation, status, and selected year.
- Year and payroll-month filter controls.
- Summary stat cards for salary, payment options, documents, leave, movements, and data gaps.
- Tabbed sections:
  - Overview
  - Payroll
  - Attendance & Leave
  - Documents
  - Timeline
- Data gaps section showing backend profile-readiness warnings.
- Document-vault summary and link to `/employees/documents?employee=<employeeDbId>`.
- Legacy salary archive section with a clear archive-only note.
- Employee Directory `Profile` quick action.
- Employee Profile drawer `Full Profile` quick action.
- Dynamic route metadata support for `/employees/:employeeRef/profile`.

## Important business rule

Legacy salary imported data remains archive-only. The profile page can display it for reference, but it must not be mixed into native payroll calculation.

## Files changed

```text
client/src/config/apiRoutes.ts
client/src/config/routePaths.ts
client/src/lib/query/queryKeys.ts
client/src/app/router/lazyPages.tsx
client/src/app/router/router.tsx
client/src/app/router/routeConfig.tsx
client/src/features/employees/pages/EmployeeDirectoryPage.tsx
client/src/features/employees/components/EmployeeProfileDrawer.tsx
client/src/features/employees/employee-profile/api/employeeProfile.api.ts
client/src/features/employees/employee-profile/types/employeeProfile.types.ts
client/src/features/employees/employee-profile/utils/employeeProfile.utils.ts
client/src/features/employees/employee-profile/components/ProfileInfoCard.tsx
client/src/features/employees/employee-profile/components/EmployeeProfileHeader.tsx
client/src/features/employees/employee-profile/components/EmployeeProfileStatCards.tsx
client/src/features/employees/employee-profile/components/EmployeeProfileTabs.tsx
client/src/features/employees/employee-profile/pages/EmployeeProfilePage.tsx
```

## Verification

```bash
cd client
npm run lint
npm run build
npm run dev
```

Open:

```text
http://localhost:5173/employees
```

Then click `Profile` from an employee row.

You can also directly open:

```text
http://localhost:5173/employees/<employeeId-or-mongoId>/profile
```

## Browser testing checklist

1. Open Employee Directory.
2. Click Profile on an employee row.
3. Confirm the full profile page loads.
4. Confirm header identity and status badges show correctly.
5. Change selected year and apply.
6. Select a payroll month and apply.
7. Review Overview tab.
8. Review Payroll tab.
9. Review Attendance & Leave tab.
10. Review Documents tab.
11. Click Open Document Vault.
12. Review Timeline tab.
13. Open employee drawer and click Full Profile.
14. Confirm users without `employee:read` cannot access the page.
