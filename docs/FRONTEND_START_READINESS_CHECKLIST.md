# CSRM Payroll System — Frontend Start Readiness Checklist

Last Updated: 2026-05-12

## Decision

```txt
Frontend Start: Approved
Backend Core: Locked
Commercial Production: Later after frontend + pilot + load/security/deployment tests
```

## First Frontend Stack

```txt
React
TypeScript
Vite
Tailwind CSS
React Router
TanStack Query
React Hook Form
Zod
Axios
Lucide Icons
Recharts
```

## First Frontend Parts

```txt
Part-F0 — Frontend Architecture Blueprint & Folder Structure
Part-F1 — Frontend Project Setup
Part-F2 — Layout + Routing + Theme Foundation
Part-F3 — Auth + Token + Protected Routes
Part-F4 — API Client + Error Handling
Part-F5 — Sidebar + Permission Guard
```

## First MVP Screens

```txt
Login
Dashboard Shell
Protected Layout
Sidebar
Company List
Branch List
Major Department List
Department List
Designation List
Employee List
Employee Profile
Attendance List
Leave List
Salary Structure List
Payroll List
Payroll Generate Screen
Audit Log List
Report Center Shell
```

## Must-Have Behaviors

```txt
role-wise sidebar
permission-wise buttons
401 logout/session expired handling
403 forbidden page/message
400 validation field mapping
409 business-rule conflict message
PDF/Excel/CSV download support
dashboard widget show/hide
light/dark mode
future multi-theme style selector
```

## Important API Note

Frontend must use corrected route notes from:

```txt
docs/BACKEND_KNOWN_ROUTE_AND_DATA_NOTES.md
```
