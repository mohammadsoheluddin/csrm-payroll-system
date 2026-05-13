# Part-F7.1 — Master Data UI Test + Backend Integration Fix Pass

## Purpose

Part-F7 introduced the first backend-connected master-data screens. Part-F7.1 is the first integration hardening pass after that implementation.

This part does not create new backend modules and does not add unrelated business screens. It improves frontend behavior around the existing backend master-data routes.

## Scope Completed

- Fixed duplicate Designation category field in the frontend config.
- Added dependent Company → Major Department behavior.
- Major Department dropdown is now filtered by selected Company.
- Department quick filter now clears Major Department when Company changes.
- Department form now clears Major Department when Company changes.
- Backend validation errors now appear inside the form panel.
- Backend field-level error sources are mapped to matching form fields.
- Switching Active/Deleted mode now closes any open form and clears form errors.
- Form close/create/edit actions now clear stale server validation errors.
- The master-data screen label now marks the page as Part-F7.1 integration-fixed.

## Files Updated

```txt
client/src/features/master-data/components/MasterDataFieldRenderer.tsx
client/src/features/master-data/components/MasterDataFormPanel.tsx
client/src/features/master-data/components/MasterDataToolbar.tsx
client/src/features/master-data/config/masterData.config.ts
client/src/features/master-data/hooks/useMasterDataOptions.ts
client/src/features/master-data/pages/MasterDataFoundationPage.tsx
```

## Files Added

```txt
docs/PART_F7_1_MASTER_DATA_UI_TEST_BACKEND_INTEGRATION_FIX_PASS.md
```

## Backend Routes Checked Against UI

```txt
GET    /companies
GET    /companies/deleted
POST   /companies
PATCH  /companies/:id
PATCH  /companies/:id/restore
DELETE /companies/:id

GET    /branches
GET    /branches/deleted
POST   /branches
PATCH  /branches/:id
PATCH  /branches/:id/restore
DELETE /branches/:id

GET    /major-departments
GET    /major-departments/deleted
POST   /major-departments
PATCH  /major-departments/:id
PATCH  /major-departments/:id/restore
DELETE /major-departments/:id

GET    /departments
GET    /departments/deleted
POST   /departments
PATCH  /departments/:id
PATCH  /departments/:id/restore
DELETE /departments/:id

GET    /designations
GET    /designations/deleted
POST   /designations
PATCH  /designations/:id
PATCH  /designations/:id/restore
DELETE /designations/:id

GET    /company-bank-accounts
POST   /company-bank-accounts
PATCH  /company-bank-accounts/:id
DELETE /company-bank-accounts/:id
```

## Important Integration Notes

### Company Bank Accounts

The backend does not expose deleted/restore routes for `company-bank-accounts` yet. Therefore, the frontend keeps deleted/restore UI disabled for that module.

### Major Department Dropdown

Department setup depends on both Company and Major Department. After this pass:

- Selecting Company filters Major Department options.
- Changing Company clears an already-selected Major Department.
- Major Department quick filter is disabled until Company is selected.

### Backend Validation Display

If backend returns validation errors like:

```json
{
  "success": false,
  "message": "Validation error",
  "errorSources": [
    { "path": "body.name", "message": "Name is required" }
  ]
}
```

The frontend now maps `body.name` to the `name` form field and shows the error inside the active form.

## Local Verification Commands

```bash
cd /e/Projects/CSRM-Payroll-System/client

npm run lint
npm run build
npm run dev
```

Expected:

```txt
npm run lint  -> passes without ESLint errors
npm run build -> passes with Vite build complete
npm run dev   -> runs at http://localhost:5173/
```

## Browser Test Checklist

Backend and frontend must both be running.

Open these pages:

```txt
http://localhost:5173/masters/companies
http://localhost:5173/masters/branches
http://localhost:5173/masters/major-departments
http://localhost:5173/masters/departments
http://localhost:5173/masters/designations
http://localhost:5173/masters/company-bank-accounts
```

Check:

- Page title/header loads.
- Table loads from backend or shows a proper empty/error state.
- Create form opens for roles with manage permission.
- Edit button opens form with existing values.
- Delete action calls backend.
- Deleted records tab appears only for modules that support deleted view.
- Restore appears only in deleted mode and only where backend supports restore.
- Company Bank Accounts does not show deleted/restore tabs.
- Department form filters Major Department by selected Company.
- Backend validation errors display inside the form panel.

## Postman/API Notes

If a browser page shows a list error, test the equivalent API in Postman using the same logged-in role token:

```txt
GET {{baseUrl}}/companies
GET {{baseUrl}}/branches
GET {{baseUrl}}/major-departments
GET {{baseUrl}}/departments
GET {{baseUrl}}/designations
GET {{baseUrl}}/company-bank-accounts
```

If Postman succeeds but browser fails, check:

- `client/.env`
- `VITE_API_BASE_URL`
- access token/session
- CORS
- browser Network tab

## Git Commit Message

```bash
git commit -m "fix(frontend): harden master data backend integration"
```
