# Frontend Permission Guard Implementation Guide

## Purpose

This guide standardizes how CSRM Payroll frontend screens should enforce role/permission visibility.

Frontend permission guards improve user experience and reduce accidental action exposure. Backend RBAC remains the final security authority.

## Permission Sources

Current frontend permission source:

```txt
client/src/config/permissions.ts
```

The frontend derives permissions from `user.role` until the backend returns a permission array from `/users/me`.

## Page-Level Guard

Use route metadata in:

```txt
client/src/app/router/routeConfig.tsx
```

Example:

```ts
requiredPermissions: [PERMISSIONS.EMPLOYEE_READ]
```

`ProtectedRoute` reads this and blocks direct URL access.

## Action-Level Guard

Use `Can` when hiding or showing individual actions.

```tsx
<Can permissions={[PERMISSIONS.EMPLOYEE_MANAGE]}>
  <Button>Edit Employee</Button>
</Can>
```

Use fallback when the user should understand why an action is not available.

```tsx
<Can
  permissions={[PERMISSIONS.PAYROLL_LOCK]}
  fallback={<PermissionDeniedInline message="Only authorized roles can lock payroll." />}
>
  <Button>Lock Period</Button>
</Can>
```

## Any vs All Permission Mode

Default mode is `all`.

```tsx
<Can permissions={[PERMISSIONS.PAYROLL_APPROVE, PERMISSIONS.PAYROLL_LOCK]}>
  <Button>Approve and Lock</Button>
</Can>
```

For one-of-many permission checks:

```tsx
<Can mode="any" permissions={[PERMISSIONS.SALARY_SHEET_READ, PERMISSIONS.PAYROLL_REPORT_READ]}>
  <Button>Open Report</Button>
</Can>
```

## Recommended Screen Pattern

Each future feature screen should define local action permissions:

```ts
const permissions = {
  canCreate: [PERMISSIONS.EMPLOYEE_MANAGE],
  canEdit: [PERMISSIONS.EMPLOYEE_MANAGE],
  canDelete: [PERMISSIONS.EMPLOYEE_MANAGE],
  canRestore: [PERMISSIONS.EMPLOYEE_MANAGE],
  canExport: [PERMISSIONS.PAYROLL_REPORT_EXPORT],
}
```

Then use `Can` around buttons and menu actions.

## Module Rules

### Master Data

```txt
Read screen       -> *_READ
Create/update    -> *_MANAGE
Delete/restore   -> *_MANAGE
Audit drawer     -> AUDIT_LOG_READ if global audit is used
```

### Employee

```txt
Directory         -> employee:read
Create/update    -> employee:manage
Bulk import       -> employee_bulk_import:process
Rollback import   -> employee_bulk_import:revert
Bank info         -> employee_bank_info:read/manage
```

### Attendance / Leave

```txt
Attendance view   -> attendance:read
Manual correction -> attendance:manage
Import            -> attendance_import:process
Finalize/lock     -> attendance_finalization:process/lock
Leave approve     -> leave:approve
```

### Payroll / Reports

```txt
Payroll read      -> payroll:read
Process payroll   -> payroll:process
Approve payroll   -> payroll:approve
Lock period       -> payroll:lock
Report view       -> *_READ
Report export     -> *_EXPORT
Salary Summary    -> salary_summary:read/export
```

## Non-Negotiable Rule

Never rely on hidden frontend buttons alone. Every sensitive API must also be protected by backend RBAC.
