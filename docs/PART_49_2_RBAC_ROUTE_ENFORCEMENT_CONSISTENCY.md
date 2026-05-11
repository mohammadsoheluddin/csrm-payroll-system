# Part-49.2 — RBAC Route Enforcement Consistency Pass

Created: 2026-05-11

## Purpose

This part standardizes route-level authorization for the CSRM Payroll System.

Before this part, most routes already used the pattern:

```ts
auth(),
requirePermission(PERMISSIONS.MODULE_ACTION)
```

But some routes still used direct role-based authorization like:

```ts
auth(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.hr)
```

The goal of this part is to make routes follow the permission matrix instead of hard-coded role lists.

---

## Modules Updated

### 1. Payroll Route

File:

```txt
server/src/modules/payroll/payroll.route.ts
```

Changed from direct role checks to permission-based checks.

| Endpoint | Permission |
| -------- | ---------- |
| `POST /payroll/generate` | `payroll:process` |
| `GET /payroll/deleted` | `payroll:read` |
| `GET /payroll` | `payroll:read` |
| `GET /payroll/:id` | `payroll:read` |
| `PATCH /payroll/:id/restore` | `payroll:update` |
| `DELETE /payroll/:id` | `payroll:update` |
| `PATCH /payroll/:id/process` | `payroll:process` |
| `PATCH /payroll/:id/approve` | `payroll:approve` |
| `PATCH /payroll/:id/lock` | `payroll:lock` |

### 2. Salary Structure Route

File:

```txt
server/src/modules/salaryStructure/salaryStructure.route.ts
```

Changed from direct role checks to permission-based checks.

| Endpoint | Permission |
| -------- | ---------- |
| `POST /salary-structure/create` | `salary_structure:manage` |
| `GET /salary-structure/history/:employeeId` | `salary_structure:read` |
| `GET /salary-structure/deleted` | `salary_structure:read` |
| `GET /salary-structure` | `salary_structure:read` |
| `GET /salary-structure/:id` | `salary_structure:read` |
| `PATCH /salary-structure/:id/restore` | `salary_structure:manage` |
| `DELETE /salary-structure/:id` | `salary_structure:manage` |
| `PATCH /salary-structure/:id` | `salary_structure:manage` |

---

## Permission Matrix Adjustments

File:

```txt
server/src/modules/user/user.constant.ts
```

Adjusted to keep current business access aligned after moving from hard-coded role checks to permission checks.

### Accounts Role

Added:

```txt
salary_structure:manage
payroll:update
payroll:process
payroll:approve
```

Reason:

- The old role-based payroll route allowed accounts for payroll generation/delete/restore/approve/lock flows.
- The old salary structure route also allowed accounts for salary structure create/update/delete.
- Without these permission additions, switching to `requirePermission()` would silently remove existing accounts access.

### Manager Role

Added:

```txt
salary_structure:read
```

Reason:

- The old salary structure route allowed managers to read salary structure/history.
- This keeps read visibility consistent with the previous route behavior.

### Cleanup

Removed a duplicate `SALARY_SHEET_LOCK` entry from the HR permission list.

---

## Current Standard

All protected business routes should follow this pattern:

```ts
auth(),
requirePermission(PERMISSIONS.SOME_PERMISSION),
```

Avoid this pattern in module routes:

```ts
auth(USER_ROLE.admin, USER_ROLE.hr)
```

Reason:

- Role lists are hard to maintain.
- Permission matrix becomes the single source of truth.
- Future custom roles or delegated permissions become easier.

---

## Route Audit Result

After this part, route scan result:

```txt
No USER_ROLE based route enforcement remains in module route files.
```

Important exception:

- `auth.route.ts` contains public auth routes like login/register/refresh/logout.
- Those routes do not use `requirePermission()` because they are part of the authentication flow.

---

## Manual Test Checklist

Use Postman with different role tokens.

### Admin / Super Admin

Expected:

- All payroll and salary structure routes should work.

### HR

Expected:

- Can read/manage salary structure.
- Can process payroll.
- Cannot approve/pay/lock payroll unless given those permissions.

### Accounts

Expected:

- Can read/manage salary structure.
- Can process/approve/update/pay/lock payroll according to assigned permissions.

### Manager

Expected:

- Can read payroll.
- Can read salary structure.
- Can approve/lock payroll only if permission is present in the matrix.

### Employee

Expected:

- Should not access payroll or salary structure admin routes.

---

## Recommended Commands

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run typecheck
npm run build:clean
npm run dev
```

---

## Next Part

Part-49.3 — Audit Log Hardening

Recommended focus:

- route-level sensitive action audit consistency
- soft delete / restore audit consistency review
- approve / reject / lock / unlock audit consistency
- export / download audit consistency
