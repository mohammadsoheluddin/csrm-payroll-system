# Part-F12.1 — Audit Log + RBAC Audit UI Test & Backend Integration Fix Pass

## Scope

This pass hardens the frontend Audit Log and RBAC Audit screens against backend route/query/data-shape mismatches. Backend code is not changed.

## Completed

- Audit Log list query now sends only backend-supported query params.
- Dedicated sensitive audit route is used safely only when the active filter set is compatible with `/audit-logs/sensitive`.
- Audit summary/timeline queries now use summary-safe filters only.
- Audit detail drawer no longer calls `/audit-logs/:id` when a row has no valid Mongo ObjectId.
- Audit detail drawer now falls back to list-row payload when detail lookup is not possible.
- Audit detail drawer now shows request original URL/query/user-agent fields when available.
- RBAC Audit requests now send endpoint-safe filter params.
- RBAC module/route coverage queries now avoid unsupported role/risk filters.
- RBAC summary query is treated as system-wide, matching the backend controller.
- RBAC route coverage Required/Available display order fixed.
- API array responses are normalized defensively to avoid UI crashes on unexpected empty/invalid payloads.

## Files Updated

- `client/src/features/audit/api/audit.api.ts`
- `client/src/features/audit/components/AuditLogDetailDrawer.tsx`
- `client/src/features/audit/components/AuditLogToolbar.tsx`
- `client/src/features/audit/components/RbacAuditToolbar.tsx`
- `client/src/features/audit/pages/AuditLogsPage.tsx`
- `client/src/features/audit/pages/RbacAuditPage.tsx`
- `client/src/features/audit/types/audit.types.ts`
- `client/src/features/audit/utils/audit.utils.ts`

## Test Checklist

1. Run frontend lint and build.
2. Open `/audit/logs` as a role with `audit_log:read`.
3. Test normal audit filters.
4. Test sensitive-only mode.
5. Open a row detail drawer.
6. Toggle include data payload and verify previous/new/metadata/request query sections.
7. Open `/rbac/audit` as a role with `rbac_audit:read`.
8. Test module/category/role/risk filters.
9. Confirm route coverage and matrix tables load without backend route errors.

## Expected Commands

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
npm run dev
```

## Notes

The frontend still does not modify backend RBAC or audit data. It only previews and analyzes backend-generated audit/RBAC information.
