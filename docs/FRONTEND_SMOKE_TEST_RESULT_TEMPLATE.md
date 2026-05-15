# Frontend Smoke Test Result Template

## Test info

```txt
Date:
Tester:
Branch:
Commit hash:
Backend port:
Frontend port:
Browser:
Logged-in role:
```

## Terminal result

```txt
git status:
git log --oneline -5:
zip files removed: Yes / No
frontend lint:
frontend build:
backend build:
smoke helper:
```

## Smoke helper result

Paste output from:

```bash
node scripts/frontend-smoke-check.mjs
```

```txt
Smoke helper output:
```

Optional authenticated check:

```bash
API_AUTH_TOKEN="paste_access_token_here" node scripts/frontend-smoke-check.mjs
```

```txt
Authenticated smoke helper output:
```

## Route result matrix

| Area | Route | Status | Note |
| --- | --- | --- | --- |
| Auth | /login | Pending |  |
| Auth | /dashboard | Pending |  |
| Master Data | /masters/companies | Pending |  |
| Master Data | /masters/branches | Pending |  |
| Master Data | /masters/major-departments | Pending |  |
| Master Data | /masters/departments | Pending |  |
| Master Data | /masters/designations | Pending |  |
| Master Data | /masters/company-bank-accounts | Pending |  |
| Employee | /employees | Pending |  |
| Attendance | /attendance | Pending |  |
| Leave | /leave | Pending |  |
| Payroll | /payroll | Pending |  |
| Salary | /salary/structures | Pending |  |
| Salary | /salary/sheets | Pending |  |
| Salary | /salary/statements | Pending |  |
| Salary | /salary/payment-distributions | Pending |  |
| Reports | /reports/center | Pending |  |
| Reports | /reports/salary-summary | Pending |  |
| Reports | /bank-sheets | Pending |  |
| Reports | /reports/month-end-control | Pending |  |
| Reports | /reports/layout-standards | Pending |  |
| Audit | /audit/logs | Pending |  |
| RBAC | /rbac/audit | Pending |  |

## Feature behavior checklist

| Check | Status | Note |
| --- | --- | --- |
| Login page opens | Pending |  |
| No infinite Checking session | Pending |  |
| No CORS error | Pending |  |
| Sidebar loads after login | Pending |  |
| Permission-based menu filtering works | Pending |  |
| Master Data list/create/edit basic flow works | Pending |  |
| Employee list/profile drawer works | Pending |  |
| Attendance list/form works | Pending |  |
| Leave list/form/review works | Pending |  |
| Payroll screens load | Pending |  |
| Reports screens load | Pending |  |
| Salary Summary no-data/success state clean | Pending |  |
| Audit/RBAC screens load | Pending |  |
| Error/empty/loading states look clean | Pending |  |

## Responsive result

| Width | Status | Note |
| --- | --- | --- |
| 1440px | Pending |  |
| 1024px | Pending |  |
| 768px | Pending |  |
| 390px | Pending |  |

## Issues found

```txt
1.
2.
3.
```

## Final result

```txt
Accepted / Needs Fix Pass
```
