# Part-F16.1 — Legacy Salary Import UI Test + Backend Integration Fix Pass

## Purpose

This part hardens the Legacy Salary Import frontend and backend integration after the Part-F16 UI foundation.

The key rule remains unchanged: legacy salary/time-bill imported data is an external historical archive only. It must not be mixed into the native payroll calculation engine.

## What was improved

### Frontend

- Added permission-safe upload behavior on the Legacy Salary Import page.
- Disabled parsing, manual JSON entry, match options, remarks, and preview actions when the user does not have processing permission.
- Hid template download buttons when the user does not have export permission.
- Added Excel parse controls:
  - Sheet Name
  - Header Row
  - Data Start Row
  - Max Rows
- Kept header row blank by default so the backend can auto-detect real CSRM/TSL salary-sheet headers.
- Added parsed-result visibility:
  - sheet name
  - rows parsed
  - detected header row
  - detected data start row
  - mapped headers
  - unmapped headers
  - parse notes
  - first three mapped payload rows
- Added frontend `.xlsx` guard before parsing.
- Updated summary metric fallback so dashboard totals can use either `grandTotal` or `totals` from the backend.
- Added Suspense amount display in record table.

### Backend

- Improved real Excel header mapping for CSRM/TSL salary and time-bill sheets.
- Added support for headers such as:
  - `ID No.`
  - `Name of A/C`
  - `Bank Salary`
  - `OT (Bank Amount)`
  - `Att. Dud.` / `Att. Deduc.`
  - `Suspense` / `Suspence`
  - `Balance` / `Baleance`
  - `Deducted Amt`
  - `Total Over Time Bill`
- Added `suspenseAmount` as a dedicated archive-only amount field.
- Added backend auto header-row detection for `.xlsx` files.
- Added department/sub-department context extraction from title rows before the header.
- Added repeated-header, summary, total, net, gross, bank, cash, and footer row skipping.
- Improved payable calculation priority:
  1. explicit `payableAmount`
  2. `netAmount`
  3. bank + cash + mobile bank + suspense
- Summary response now keeps `grandTotal` and also returns `totals` for frontend compatibility.
- Template/export columns now include Suspense.

## Files changed

### Backend

- `server/src/modules/legacySalaryImport/legacySalaryImport.interface.ts`
- `server/src/modules/legacySalaryImport/legacySalaryImport.model.ts`
- `server/src/modules/legacySalaryImport/legacySalaryImport.validation.ts`
- `server/src/modules/legacySalaryImport/legacySalaryImport.service.ts`
- `server/src/modules/legacySalaryImport/legacySalaryImport.export.ts`

### Frontend

- `client/src/features/legacy-salary-import/types/legacySalaryImport.types.ts`
- `client/src/features/legacy-salary-import/utils/legacySalaryImport.utils.ts`
- `client/src/features/legacy-salary-import/components/LegacySalaryUploadPanel.tsx`
- `client/src/features/legacy-salary-import/components/LegacySalaryRecordsPanel.tsx`
- `client/src/features/legacy-salary-import/pages/LegacySalaryImportPage.tsx`

### Documentation

- `docs/PART_F16_1_LEGACY_SALARY_IMPORT_UI_TEST_BACKEND_INTEGRATION_FIX_PASS.md`

## Real file smoke-test coverage

The parser was tested against uploaded real sample formats:

- `1. Salary Sheet(1).xlsx`
- `TSL Salary(5).xlsx`
- `CSRM Time Bill-February-2025(5).xlsx`
- `TSL Time Bill-February-2025(5).xlsx`

Observed behavior:

- CSRM salary sheet header was auto-detected at row 3.
- TSL salary sheet header was auto-detected at row 2.
- CSRM/TSL time-bill sheet headers were auto-detected at row 3.
- Department/sub-department context rows were attached to mapped payload rows.
- Repeated headers and total/footer rows were skipped.
- Suspense/Suspence and Balance/Baleance columns were mapped correctly.

## Verification status

### Backend

Targeted legacy module TypeScript check passed using a temporary focused `tsconfig.legacy-check.json`.

Parser smoke tests passed for the uploaded real CSRM/TSL `.xlsx` samples.

Project-wide `npm run build` was attempted, but it timed out in the sandbox before compiler output was produced. This should be re-run locally from the server folder.

### Frontend

The following checks passed:

```bash
cd client
npm run lint
npm run build
```

Note: `npm ci --ignore-scripts` failed because the client lockfile was out of sync with optional native dependency metadata. `npm install --ignore-scripts` succeeded and then lint/build passed. No package-lock change is required for this feature patch unless the project owner wants to refresh the lockfile separately.

## Recommended local test flow

1. Start backend.
2. Start frontend.
3. Login with a user that has legacy salary import permissions.
4. Open:

```text
/salary/legacy-imports
```

5. Select company, fiscal year, month, import type, and other required filters.
6. Upload real `.xlsx` salary/time-bill files.
7. Keep Header Row blank first and click Parse Excel File.
8. Confirm:
   - detected header row is correct
   - mapped headers look correct
   - unmapped headers are expected non-payroll columns such as SL or Signature
   - mapped payload preview contains employee and amount fields
9. Click Preview Import.
10. Confirm preview totals and invalid/valid rows.
11. Commit import.
12. Check Archive, Records, Summary, Export, Delete, and Restore flows.
13. Login with a read-only/manager user and confirm processing actions are not available.

## Safety note

This part only improves the Legacy Salary Import archive flow. It does not connect imported legacy rows with the native payroll generation/calculation engine.
