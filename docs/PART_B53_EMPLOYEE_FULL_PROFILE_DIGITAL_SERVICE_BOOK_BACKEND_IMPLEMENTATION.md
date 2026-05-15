# Part-B53 — Employee Full Profile / Digital Service Book Backend Foundation

## Purpose

This part adds a read-only backend aggregation API for an employee's digital HR profile/service book. It does not change payroll calculation and does not mix legacy salary archive data into native payroll.

## New module

```text
server/src/modules/employeeProfile/
```

Files added:

```text
employeeProfile.interface.ts
employeeProfile.validation.ts
employeeProfile.service.ts
employeeProfile.controller.ts
employeeProfile.route.ts
```

Updated route registry:

```text
server/src/routes/index.ts
```

## API endpoints

Base path:

```text
/api/v1/employee-profiles
```

### Full profile

```http
GET /api/v1/employee-profiles/:employeeRef
```

`:employeeRef` can be one of:

```text
MongoDB employee _id
employeeId
officeId
cardNo
```

Optional query:

```text
year=2026
payrollMonth=2026-04
historyLimit=12
movementLimit=10
legacyLimit=12
```

### Lightweight summary

```http
GET /api/v1/employee-profiles/:employeeRef/summary
```

## Sections returned

```text
summary
personal
office
lifecycle
salary
payment
attendance
leave
movements
payrollHistory
legacySalaryArchive
dataGaps
timeline
```

## Important design rule

Legacy salary records are returned only under:

```text
sections.legacySalaryArchive
```

They remain archive-only and are not used by native payroll calculation.

## RBAC

Routes require:

```text
employee:read
```

This is a foundation. Later parts may split sensitive salary/payment/profile access into more granular permissions.

## Future extensions

Recommended next parts:

```text
Part-B54 — Employee Document Management Module
Part-B55 — Employee Timeline / Service Book Event Hardening
Part-F17 — Employee Full Profile Frontend Page Foundation
```
