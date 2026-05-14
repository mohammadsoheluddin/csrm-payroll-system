# Part-F12 — Audit Log + RBAC Audit Screens

## Status

Completed as frontend foundation screens.

Backend code was not changed in this part.

## Purpose

Part-F12 connects the existing backend audit and RBAC audit routes to production-oriented frontend screens. These screens are security/control screens, not business CRUD modules.

## Screens Added

### Audit Logs

Route:

```txt
/audit/logs
```

Features:

- Backend-connected audit log list
- Backend-connected audit summary
- Backend-connected audit timeline
- Backend-connected filter options
- Search by actor/entity/request/IP/path/description
- Filters for module, action, risk level, category, actor role, device type, date range, actor email, entity ID
- Sensitive-only toggle
- Include/hide data payload toggle
- Pagination
- Audit detail drawer
- Previous data / new data / metadata preview
- Permission guard using `audit_log:read`

Backend routes used:

```txt
GET /audit-logs
GET /audit-logs/summary
GET /audit-logs/timeline
GET /audit-logs/filter-options
GET /audit-logs/:id
```

### RBAC Audit

Route:

```txt
/rbac/audit
```

Features:

- Backend-connected RBAC summary
- Backend-connected module catalog
- Backend-connected role summary
- Backend-connected route coverage
- Backend-connected coverage issues
- Backend-connected permission matrix preview
- Filters for module, role, category, risk level
- Permission guard using `rbac_audit:read`

Backend routes used:

```txt
GET /rbac-audit/summary
GET /rbac-audit/modules
GET /rbac-audit/roles
GET /rbac-audit/matrix
GET /rbac-audit/coverage
GET /rbac-audit/route-coverage
```

## Important Route Note

The frontend must not call base-only assumptions for system routes. This part uses the backend's known sub-route patterns:

```txt
/audit-logs/summary
/audit-logs/timeline
/audit-logs/filter-options
/rbac-audit/summary
/rbac-audit/coverage
/rbac-audit/route-coverage
```

## Files Added

```txt
client/src/features/audit/api/audit.api.ts
client/src/features/audit/components/AuditLogDetailDrawer.tsx
client/src/features/audit/components/AuditLogToolbar.tsx
client/src/features/audit/components/AuditMetricCards.tsx
client/src/features/audit/components/RbacAuditToolbar.tsx
client/src/features/audit/pages/AuditLogsPage.tsx
client/src/features/audit/pages/RbacAuditPage.tsx
client/src/features/audit/types/audit.types.ts
client/src/features/audit/utils/audit.utils.ts
```

## Files Updated

```txt
client/src/app/router/router.tsx
client/src/app/router/routeConfig.tsx
client/src/config/apiRoutes.ts
client/src/lib/query/queryKeys.ts
```

## Permissions

```txt
audit_log:read
rbac_audit:read
```

Only allowed roles will see/open these screens. Sidebar menu filtering was already available from Part-F5.

## Manual Test

Run backend and frontend:

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run dev
```

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run dev
```

Open:

```txt
http://localhost:5173/audit/logs
http://localhost:5173/rbac/audit
```

Expected:

- Audit Logs screen should load summary, filters, timeline, and log table.
- Audit detail drawer should open from View button.
- RBAC Audit screen should load summary, roles, coverage, issues, route coverage, and matrix preview.
- Unauthorized roles should be blocked by permission guard.

## Build Test

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
```

Result during packaging:

```txt
Lint passed
Build passed
```

Vite chunk-size warning may appear. This is not an error. Route-level lazy loading can be added later as a separate performance pass.

## Next Recommended Part

```txt
Part-F13 — Frontend Smoke Test + Backend Integration Check
```

Alternative if continuing feature screens first:

```txt
Part-F12.1 — Audit Log + RBAC Audit UI Test & Backend Integration Fix Pass
```
