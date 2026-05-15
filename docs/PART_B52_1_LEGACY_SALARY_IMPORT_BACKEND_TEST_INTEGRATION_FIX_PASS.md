# Part-B52.1 — Legacy Salary Import Backend Test + Integration Fix Pass

## Status

Completed as a backend integration hardening pass for **Part-B52 — Legacy Salary Sheet Import & Archive Module**.

No frontend UI was implemented in this part.

## Main fixes

- Hardened legacy salary Excel parsing.
- Added automatic header-to-field mapping support for common salary sheet column names.
- Added `mappedPayload`, `mappedHeaders`, `unmappedHeaders`, and `notes` to the parse response.
- Added `.xls` guard with a clear message to convert old Excel files to `.xlsx`.
- Improved number normalization for comma amounts, Tk/BDT text, bracketed negative values, and Bangla digits.
- Added soft-delete metadata to legacy salary archive records.
- Soft deleting a legacy salary import batch now also soft deletes its records.
- Restoring a legacy salary import batch now also restores its records.
- Active record list, summary, and export now exclude soft-deleted records.
- Export filter now safely casts valid ObjectId filters.
- Added documentation for test and integration expectations.

## Important design rule

Legacy imported salary data remains separate from the native payroll calculation engine.

This module is for:

- old/current payroll software salary sheet archive
- search/filter/reporting
- employee/month/department summary
- future comparison with native payroll

It must not directly overwrite native payroll results.

## Updated files

```txt
server/src/modules/legacySalaryImport/legacySalaryImport.interface.ts
server/src/modules/legacySalaryImport/legacySalaryImport.model.ts
server/src/modules/legacySalaryImport/legacySalaryImport.service.ts
server/src/modules/legacySalaryImport/legacySalaryImport.export.ts
docs/PART_B52_1_LEGACY_SALARY_IMPORT_BACKEND_TEST_INTEGRATION_FIX_PASS.md
```

## Suggested backend checks

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run build
npm run dev
```

## Suggested Postman checks

### Template Excel

```txt
GET {{baseUrl}}/legacy-salary-imports/template/excel
```

### Template CSV

```txt
GET {{baseUrl}}/legacy-salary-imports/template/csv
```

### Parse Excel

```txt
POST {{baseUrl}}/legacy-salary-imports/parse-excel
```

Body:

```json
{
  "fileName": "Legacy Salary Sheet May 2026.xlsx",
  "fileBase64": "PASTE_BASE64_XLSX_HERE",
  "headerRow": 1,
  "dataStartRow": 2,
  "maxRows": 1000
}
```

Expected response includes:

```txt
headers
mappedHeaders
unmappedHeaders
rows[].rawPayload
rows[].mappedPayload
rows[].unmappedHeaders
notes
```

### Preview using mapped rows

Use parsed `rows[].mappedPayload` values as the reviewed `rows` input.

```txt
POST {{baseUrl}}/legacy-salary-imports/preview
```

### Commit reviewed archive

```txt
POST {{baseUrl}}/legacy-salary-imports/commit
```

### Records

```txt
GET {{baseUrl}}/legacy-salary-imports/records?payrollMonth=2026-05
```

### Summary

```txt
GET {{baseUrl}}/legacy-salary-imports/summary?payrollMonth=2026-05&groupBy=department
```

### Export

```txt
GET {{baseUrl}}/legacy-salary-imports/records/export/excel?payrollMonth=2026-05
GET {{baseUrl}}/legacy-salary-imports/records/export/csv?payrollMonth=2026-05
```

## Soft delete / restore expectation

When a batch is deleted:

- batch becomes soft-deleted
- related records become soft-deleted
- records/summary/export no longer include that batch's records

When a batch is restored:

- batch is restored
- related records are restored
- records/summary/export can include those records again

## Notes for real company format

When real salary sheet files are reviewed, keep these rules:

- Prefer `.xlsx` over `.xls`.
- For `.xls`, open in Excel and save as `.xlsx` first.
- Use parse endpoint first.
- Review `mappedPayload` and `unmappedHeaders` before commit.
- If a column is not mapped automatically, add mapping in service or map it from frontend before preview/commit.
