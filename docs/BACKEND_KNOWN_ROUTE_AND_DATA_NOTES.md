# CSRM Payroll System — Known Route and Data Notes

Last Updated: 2026-05-12

## Purpose

During smoke testing, a few requests returned 404 or 400 because of base-route usage, missing query, blank environment IDs, or missing generated payable data.

## Report Center

Do not use only:

```http
GET /api/v1/report-center
```

Use:

```http
GET /api/v1/report-center/catalog
GET /api/v1/report-center/dashboard?company={companyId}&month=5&year=2026
GET /api/v1/report-center/readiness?company={companyId}&month=5&year=2026
GET /api/v1/report-center/quick-links?company={companyId}&month=5&year=2026
GET /api/v1/report-center/export-route?company={companyId}&reportType=salary_sheet
GET /api/v1/report-center/saved-configs
```

## Month-End Process Control

Do not use only:

```http
GET /api/v1/month-end-process-control
```

Use:

```http
GET /api/v1/month-end-process-control/status?company={companyId}&month=5&year=2026
GET /api/v1/month-end-process-control/checklist?company={companyId}&month=5&year=2026
```

## RBAC Audit

Do not use only:

```http
GET /api/v1/rbac-audit
```

Use:

```http
GET /api/v1/rbac-audit/summary
GET /api/v1/rbac-audit/modules
GET /api/v1/rbac-audit/permissions
GET /api/v1/rbac-audit/roles
GET /api/v1/rbac-audit/matrix
GET /api/v1/rbac-audit/coverage
GET /api/v1/rbac-audit/route-coverage
```

## Payroll Reports

Do not use only:

```http
GET /api/v1/payroll-reports
```

Use:

```http
GET /api/v1/payroll-reports/monthly-report?month=5&year=2026&company={companyId}
GET /api/v1/payroll-reports/monthly-report/export/csv?month=5&year=2026&company={companyId}
GET /api/v1/payroll-reports/monthly-report/export/excel?month=5&year=2026&company={companyId}
GET /api/v1/payroll-reports/payslip/{employeeId}
GET /api/v1/payroll-reports/payslip/{employeeId}/pdf
```

## Bank Sheet

Do not use only:

```http
GET /api/v1/bank-sheets
```

Use:

```http
GET /api/v1/bank-sheets/salary/preview?month=5&year=2026&company={companyId}
GET /api/v1/bank-sheets/salary/export/excel?month=5&year=2026&company={companyId}
GET /api/v1/bank-sheets/salary/export/pdf?month=5&year=2026&company={companyId}
```

If it says no payable bank rows found, the route is reachable but data is not ready for the selected filters.

## Query-Required Endpoints

```http
GET /api/v1/salary-payment-distributions?month=5&year=2026
GET /api/v1/ot-payment-distributions?month=5&year=2026
GET /api/v1/bonus-statements?bonusMonth=2026-05
GET /api/v1/bonus-payment-distributions?bonusMonth=2026-05
```

A missing-query 400 is expected validation behavior.
