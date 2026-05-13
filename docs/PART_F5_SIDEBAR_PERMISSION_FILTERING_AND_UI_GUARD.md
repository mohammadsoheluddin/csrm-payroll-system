# Part-F5 — Sidebar Permission Filtering + Permission-Wise UI Guard

## Status

Completed.

This part hardens the frontend permission layer after the API client and error-handling foundation. It does not implement real business CRUD screens yet.

## What Was Added

- Role-wise sidebar filtering
- Permission-wise route blocking through `ProtectedRoute`
- Reusable UI action guards through `Can` and `PermissionGuard`
- Inline permission fallback component
- Auth store permission helper methods
- Central permission utility helpers
- Salary Summary frontend route placeholder and sidebar entry
- Salary Summary API route registry entries
- Dashboard status updated to Part-F5

## Updated Frontend Permission Strategy

Frontend permissions are still synced from backend constants. Until `/users/me` returns a backend-provided permission array, the frontend derives permissions from the authenticated user's role.

Primary files:

```txt
client/src/config/permissions.ts
client/src/lib/auth/permission.utils.ts
client/src/stores/auth.store.ts
```

## Role-Wise Sidebar Filtering

The sidebar now calls:

```ts
getVisibleSidebarGroups(userRole)
```

The sidebar no longer renders every route blindly. A menu item is visible only when:

1. It has no permission requirement; or
2. The authenticated user role has the required permission; or
3. The parent item has at least one visible child.

Primary files:

```txt
client/src/config/sidebar.config.tsx
client/src/components/layout/AppSidebar.tsx
```

## Route Guard Strategy

All protected app routes pass their route metadata permission requirements to `ProtectedRoute`.

Behavior:

```txt
checking session      -> loading state
unauthenticated       -> redirect to /login
authenticated allowed -> render route
authenticated denied  -> redirect to /forbidden
```

Primary files:

```txt
client/src/app/router/ProtectedRoute.tsx
client/src/app/router/router.tsx
client/src/app/router/routeConfig.tsx
```

## Permission-Wise Button / Action Guard Strategy

Future business screens must not only guard full pages. They must guard sensitive actions too.

Use `Can` or `PermissionGuard` for:

```txt
Create
Edit
Delete
Soft delete
Restore
Approve
Reject
Lock
Unlock
Import
Rollback
Export PDF
Export Excel
Export CSV
Audit-sensitive actions
```

Example:

```tsx
<Can permissions={[PERMISSIONS.SALARY_SUMMARY_EXPORT]}>
  <ExportActionButton />
</Can>
```

## Salary Summary UI Visibility Status

Part-B51 created the backend Salary Summary module.

Part-F5 adds only the frontend shell visibility:

```txt
Route: /reports/salary-summary
Sidebar: Reports & Control -> Report Center -> Salary Summary
Permission: salary_summary:read
Export permission foundation: salary_summary:export
```

Full preview/export UI is still pending and should be built later in a dedicated report UI part.

## Salary Summary Permissions

```txt
salary_summary:read
salary_summary:export
```

Expected role behavior:

```txt
super_admin -> read/export
admin       -> read/export
hr          -> read/export
accounts    -> read/export
manager     -> read only
employee    -> no access
```

## Important Notes

- Sidebar filtering is a UX/security layer, not a backend security replacement.
- Backend RBAC remains the final authority.
- Frontend should never show actions that the role cannot perform.
- Direct URL access is still blocked by route guards.
- API requests are still blocked by backend RBAC.

## Verification Commands

```bash
cd /e/Projects/CSRM-Payroll-System

test -f client/src/lib/auth/permission.utils.ts && echo "permission utils OK"
test -f client/src/components/feedback/PermissionDeniedInline.tsx && echo "permission fallback OK"
grep -R "salary_summary:read" client/src/config/permissions.ts && echo "salary summary read permission OK"
grep -R "salarySummary" client/src/config/routePaths.ts && echo "salary summary route path OK"
grep -R "Salary Summary" client/src/config/sidebar.config.tsx && echo "salary summary sidebar OK"
```

Frontend:

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
npm run dev
```

Expected:

```txt
Lint passed
Build passed
/dashboard shows Part-F5 status
Sidebar is filtered by logged-in user role
/reports/salary-summary opens placeholder only for roles with salary_summary:read
Export sample is visible only for roles with salary_summary:export
```

## Next Recommended Part

```txt
Part-F6 — Dashboard Widget Customization + Role-Based Dashboard Foundation
```

Alternative if Salary Summary UI is more urgent:

```txt
Part-F5.1 — Salary Summary Placeholder Hardening + Report Center Card
Part-F11.1 — Salary Summary Preview + Export UI
```
