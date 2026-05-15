# Part-B53 — Employee Full Profile / Digital Service Book Backend Foundation

Status: Planned  
Depends On: Existing Employee module, Employee Bank Info, Employee Movement, Attendance, Leave, Payroll, Legacy Salary Import Archive  
Purpose: Create a central employee profile API without breaking current employee creation/update flow.

---

## 1. Why This Part Is Needed

The current system can create employees and show employee records. But an enterprise HR/payroll system needs a complete employee profile, also known as a digital service book.

The profile should not be only the create/update form. It should be a read-focused aggregated view of the employee's HR/payroll life.

---

## 2. Key Principle

Employee Create Form and Employee Profile are separate concepts.

| Area | Meaning |
|---|---|
| Employee Create Form | Data entry to create employee master record |
| Employee Profile / Digital Service Book | Complete employee history, summaries, documents, payroll links, leave, attendance, movement, and audit timeline |

---

## 3. Recommended Backend Module

Create a new aggregation module:

```txt
server/src/modules/employeeProfile/
```

Recommended files:

```txt
employeeProfile.interface.ts
employeeProfile.service.ts
employeeProfile.controller.ts
employeeProfile.route.ts
employeeProfile.validation.ts
```

This module should aggregate existing module data. It should not duplicate employee master data unnecessarily.

---

## 4. Recommended API Endpoints

```txt
GET /api/v1/employees/:id/profile
GET /api/v1/employees/:id/profile/summary
GET /api/v1/employees/:id/profile/payroll-history
GET /api/v1/employees/:id/profile/attendance-summary
GET /api/v1/employees/:id/profile/leave-summary
GET /api/v1/employees/:id/profile/movement-history
GET /api/v1/employees/:id/profile/legacy-salary-archive
```

Alternative route style if the repo structure prefers a separate module base:

```txt
GET /api/v1/employee-profiles/:employeeId
```

Final route should be chosen after inspecting existing route conventions.

---

## 5. Profile Sections

The complete profile should eventually support:

```txt
1. Personal Information
2. Contact Information
3. Office Information
4. Company / Concern / Department / Section
5. Designation / Grade / Employment Type
6. Lifecycle Status
7. Salary Structure Snapshot
8. Bank / Cash / Mobile Payment Info
9. Attendance Summary
10. Leave Summary
11. Payroll History
12. Time Bill / OT History
13. Bonus History
14. Employee Movement History
15. Legacy Salary Archive Link
16. Documents
17. HR Letters
18. Audit Timeline
19. Notes / Warnings / Sensitive HR items later
20. Service Book Timeline
```

Part-B53 should start with safe read-only aggregation and can expand later.

---

## 6. Initial Response Shape Suggestion

```json
{
  "employee": {},
  "office": {},
  "payment": {},
  "lifecycle": {},
  "attendanceSummary": {},
  "leaveSummary": {},
  "payrollSummary": {},
  "movementHistory": [],
  "legacySalaryArchive": [],
  "auditSnapshot": {}
}
```

The final shape should follow the project's existing sendResponse/API convention.

---

## 7. Data Safety Rules

1. Do not modify native payroll calculation from this module.
2. Do not write to attendance, leave, payroll, or legacy salary archive from profile endpoints.
3. Keep profile APIs read-only in Part-B53 unless a small safe note/update endpoint is intentionally designed later.
4. Legacy salary archive is historical reference only.
5. Sensitive salary/payment fields must obey RBAC and future masking rules.
6. Employee self-service should only show own profile in future.
7. Manager access should later be limited by department/team data scope.

---

## 8. RBAC Direction

Possible permissions:

```txt
employee_profile:read
employee_profile:manage
employee_profile:sensitive_read
employee_profile:payroll_read
employee_profile:document_read
```

If the project currently uses broader permissions only, Part-B53 can start with existing employee/payroll permissions and later refine.

---

## 9. Frontend Future Direction

Future frontend route:

```txt
/employees/:id/profile
```

Possible sections/tabs:

```txt
Overview
Personal
Office
Payroll
Attendance
Leave
Movement
Documents
Legacy Archive
Timeline
Audit
```

The current EmployeeProfileDrawer can later link to this full page.

---

## 10. Postman Test Direction

When implemented, test with:

```txt
Admin token: should read all profile sections.
HR token: should read employee/HR sections.
Accounts token: should read payroll/payment sections if permitted.
Manager token: should read only allowed team/department later.
Employee token: should read own profile only later.
Unauthorized token: should receive 401/403.
Invalid employee ID: should receive validation/not-found response.
Deleted/inactive employee: should follow project policy.
```

---

## 11. Success Criteria

Part-B53 is successful when:

```txt
1. A stable employee profile API exists.
2. It aggregates key current employee data.
3. It does not break existing Employee module APIs.
4. It does not mix legacy archive into native payroll calculation.
5. It follows validation, response, route, and RBAC conventions.
6. It gives frontend a clean base for full Employee Profile page.
```
