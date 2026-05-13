# Part-F7 — Master Data Foundation Screens

## Status

Completed as a frontend foundation part.

Backend code was not changed in this part. The frontend master-data screens are connected to existing backend routes and permission rules.

## Goal

Part-F7 creates the first real backend-connected frontend screens for master setup modules. These screens replace the previous generic placeholder for the master-data routes.

## Covered Screens

| Frontend Route | Backend API | Permission |
|---|---|---|
| `/masters/companies` | `/companies` | `company:read`, `company:manage` |
| `/masters/branches` | `/branches` | `branch:read`, `branch:manage` |
| `/masters/major-departments` | `/major-departments` | `major_department:read`, `major_department:manage` |
| `/masters/departments` | `/departments` | `department:read`, `department:manage` |
| `/masters/designations` | `/designations` | `designation:read`, `designation:manage` |
| `/masters/company-bank-accounts` | `/company-bank-accounts` | `company_bank_account:read`, `company_bank_account:manage` |

## Implemented Features

- Backend-connected list pages
- Search box with local search over key fields
- Backend query filters where supported
- Create form foundation
- Edit form foundation
- Soft delete action where backend supports delete
- Deleted records view where backend supports `/deleted`
- Restore action where backend supports `/:id/restore`
- Company and major department lookup dropdowns
- Permission-wise create/edit/delete/restore visibility
- Read-only UI fallback for users without manage permission
- Route status marked as `ready` for master-data routes
- Design follows Part-F4.1 UI reference lock

## Important Notes

### Company Bank Account Restore

`company-bank-accounts` backend currently supports soft delete but does not expose a deleted-list or restore endpoint. Therefore the frontend foundation does not show deleted/restore controls for that screen.

### Local Search vs Backend Search

The backend master-data routes mostly support structured filters such as `status`, `company`, `type`, `category`, or `accountType`. Free-text search is handled locally in the frontend for this foundation part.

### Future Improvements

Later frontend parts may add:

- server-side search and pagination if backend supports it
- row detail drawer
- audit trail drawer
- stronger form-level Zod validation
- dependent major department filtering by selected company
- import/export for master data
- bulk inactive/delete flows
- richer empty states and table column customization

## Smoke Test Routes

Run frontend and backend, then login with a role that has read/manage permissions and open:

```txt
http://localhost:5173/masters/companies
http://localhost:5173/masters/branches
http://localhost:5173/masters/major-departments
http://localhost:5173/masters/departments
http://localhost:5173/masters/designations
http://localhost:5173/masters/company-bank-accounts
```

## Expected Behavior

- Pages should not show the previous generic placeholder.
- Each route should show a Part-F7 master-data page.
- Data should load from backend APIs after login.
- Read-only roles should not see New/Edit/Delete/Restore buttons.
- Manage roles should see create/edit/delete/restore actions based on backend support.

## Verification Commands

```bash
cd /e/Projects/CSRM-Payroll-System

test -f client/src/features/master-data/pages/MasterDataFoundationPage.tsx && echo "Master data page OK"
test -f client/src/features/master-data/config/masterData.config.ts && echo "Master data config OK"
test -f client/src/features/master-data/api/masterData.api.ts && echo "Master data API OK"
test -f client/src/components/data-table/SimpleDataTable.tsx && echo "Reusable table OK"
test -f docs/PART_F7_MASTER_DATA_FOUNDATION_SCREENS.md && echo "F7 doc OK"
```

Then:

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
npm run dev
```

## Git Commit

```bash
cd /e/Projects/CSRM-Payroll-System

git add client/src/app/router/router.tsx \
client/src/app/router/routeConfig.tsx \
client/src/components/data-table/SimpleDataTable.tsx \
client/src/config/apiRoutes.ts \
client/src/features/master-data \
client/src/lib/format/record.utils.ts \
client/src/lib/query/queryKeys.ts \
docs/PART_F7_MASTER_DATA_FOUNDATION_SCREENS.md

git commit -m "feat(frontend): add master data foundation screens"

git push
```
