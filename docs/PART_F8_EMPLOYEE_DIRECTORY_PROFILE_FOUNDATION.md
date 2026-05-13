# Part-F8 — Employee Directory + Profile Foundation

## Status

Completed as a frontend foundation part.

No backend code was changed in this part.

## Goal

Part-F8 connects the frontend employee directory to the already completed backend Employee module. This is the first HR lifecycle screen beyond master data and prepares the system for employee profile, employee bank info, movement, attendance, leave, and payroll integration in later parts.

## Completed Scope

- Employee Directory route connected to real page: `/employees`
- Backend-connected employee list API
- Active employee list
- Deleted employee list
- Search by employee ID, name, office ID, card no, phone, email, company, department, designation, and branch
- Filters:
  - Company
  - Major Department
  - Department / Section
  - Designation
  - Branch
  - System Status
  - Employment Status
  - Service Type
  - Pay Type
- Dependent dropdown filtering:
  - Company filters Major Department
  - Company + Major Department filter Department
  - Company filters Designation
- Employee create form foundation
- Employee edit form foundation
- Soft delete action
- Restore action
- Lifecycle change action using dedicated backend lifecycle route
- Employee profile drawer foundation
- Permission-wise action visibility
- API error handling with toast and inline form errors
- Dashboard/sidebar permission flow remains unchanged

## Backend APIs Used

```txt
GET    /employees
GET    /employees/deleted
GET    /employees/:id
POST   /employees/create-employee
PATCH  /employees/:id
PATCH  /employees/:id/lifecycle
PATCH  /employees/:id/restore
DELETE /employees/:id
```

## Frontend Route

```txt
/employees
```

## Permissions

Read access:

```txt
employee:read
```

Create, edit, delete, restore, and lifecycle actions:

```txt
employee:manage
```

## Important Implementation Files

```txt
client/src/features/employees/pages/EmployeeDirectoryPage.tsx
client/src/features/employees/api/employee.api.ts
client/src/features/employees/components/EmployeeDirectoryToolbar.tsx
client/src/features/employees/components/EmployeeFormPanel.tsx
client/src/features/employees/components/EmployeeLifecycleDialog.tsx
client/src/features/employees/components/EmployeeProfileDrawer.tsx
client/src/features/employees/components/EmployeeStatCards.tsx
client/src/features/employees/config/employee.constants.ts
client/src/features/employees/hooks/useEmployeeLookups.ts
client/src/features/employees/types/employee.types.ts
client/src/features/employees/utils/employee.utils.ts
```

Updated shared files:

```txt
client/src/app/router/router.tsx
client/src/app/router/routeConfig.tsx
client/src/config/apiRoutes.ts
client/src/lib/query/queryKeys.ts
```

## What This Part Does Not Yet Cover

The following are intentionally planned for later dedicated parts:

- Pixel-perfect advanced employee form wizard
- Employee bank/payment info tabs
- Employee movement tab
- Employee attendance summary tab
- Employee leave ledger tab
- Employee salary structure tab
- Employee audit trail drawer
- Employee document/HR letter attachment section
- Employee bulk import UI

## Local Test Commands

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
npm run dev
```

Open:

```txt
http://localhost:5173/employees
```

Expected:

- Employee Directory page opens
- Filter toolbar appears
- Active/Deleted toggle appears
- Employee table appears
- New Employee button appears for roles with `employee:manage`
- View drawer opens from View button
- Edit form opens for roles with `employee:manage`
- Lifecycle dialog opens for roles with `employee:manage`
- Delete/Restore actions appear according to list mode and permission

## Backend Runtime Note

Both server and client must be running for live testing:

Terminal 1:

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run dev
```

Terminal 2:

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run dev
```

## Known Follow-up

After Part-F8, a small browser/API integration pass is recommended:

```txt
Part-F8.1 — Employee Directory UI Test + Backend Integration Fix Pass
```

This should verify real create/edit/delete/restore/lifecycle behavior against your actual seeded database and backend validation responses.
