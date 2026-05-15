# Part-B52 — Legacy Salary Sheet Import & Archive Module

## Status

Implemented as a dedicated backend module.

This module stores salary sheets imported from the company’s existing/old payroll software as **external historical archive data**. It does **not** mix imported salary sheet rows into the native payroll calculation engine.

## Purpose

The company may continue using its current payroll software for a period. This module allows CSRM Payroll System to archive those generated salary sheets so the data can later be searched, filtered, summarized, compared, charted, and exported from the new system.

## Design Rule

| Data source | Meaning |
| --- | --- |
| Native Payroll | Calculated by CSRM Payroll System |
| Legacy Salary Archive | Imported from external/current/old payroll software |

Imported legacy rows are read/report/archive data only unless a future approved reconciliation module explicitly uses them for comparison.

## Backend Module Path

```txt
server/src/modules/legacySalaryImport/
```

## Files

```txt
legacySalaryImport.interface.ts
legacySalaryImport.model.ts
legacySalaryImport.validation.ts
legacySalaryImport.service.ts
legacySalaryImport.export.ts
legacySalaryImport.controller.ts
legacySalaryImport.route.ts
```

## API Base Route

```txt
/api/v1/legacy-salary-imports
```

## Routes

### Template

```txt
GET /legacy-salary-imports/template/csv
GET /legacy-salary-imports/template/excel
```

### Excel Parser

```txt
POST /legacy-salary-imports/parse-excel
```

This endpoint accepts base64 Excel content and returns normalized header/row payloads for frontend mapping.

Example body:

```json
{
  "fileName": "Salary Sheet May 2026.xlsx",
  "fileBase64": "BASE64_EXCEL_CONTENT",
  "sheetName": "Sheet1",
  "headerRow": 1,
  "dataStartRow": 2,
  "maxRows": 5000
}
```

### Preview + Commit

```txt
POST /legacy-salary-imports/preview
POST /legacy-salary-imports/commit
```

Preview validates/matches rows and returns totals without saving. Commit saves one batch and its records.

### Archive Read

```txt
GET /legacy-salary-imports
GET /legacy-salary-imports/deleted
GET /legacy-salary-imports/:id
GET /legacy-salary-imports/records
GET /legacy-salary-imports/summary
```

### Export

```txt
GET /legacy-salary-imports/records/export/csv
GET /legacy-salary-imports/records/export/excel
```

### Soft Delete / Restore

```txt
DELETE /legacy-salary-imports/:id
PATCH /legacy-salary-imports/:id/restore
```

## Preview / Commit Payload

```json
{
  "source": "current_payroll_software",
  "sheetType": "salary_and_wages",
  "payrollMonth": "2026-05",
  "company": "OPTIONAL_COMPANY_OBJECT_ID",
  "sourceFileName": "Salary Sheet May 2026.xlsx",
  "sourceSheetName": "Sheet1",
  "matchBy": "employeeId",
  "remarks": "Imported from current payroll software",
  "rows": [
    {
      "rowNo": 1,
      "employeeIdentifier": "EMP-1001",
      "employeeId": "EMP-1001",
      "officeId": "OFF-1001",
      "employeeName": "Md. Example Employee",
      "departmentName": "HR & Admin",
      "designationName": "Executive",
      "grossAmount": 50000,
      "bankAmount": 45000,
      "cashAmount": 5000,
      "netAmount": 50000,
      "payableAmount": 50000,
      "rawPayload": {
        "sourceColumnA": "source value"
      }
    }
  ]
}
```

## Match Strategies

```txt
employeeId
officeId
cardNo
name
```

The system tries to match imported rows with existing Employee records. Unmatched rows are still archived so historical salary sheet data is not lost.

## Row Status

```txt
matched
unmatched
duplicate_identifier
invalid
```

## Supported Amount Fields

```txt
grossAmount
basicAmount
houseRentAmount
medicalAmount
conveyanceAmount
tiffinAmount
overtimeHour
overtimeRate
overtimeAmount
bonusAmount
otherAllowanceAmount
bankAmount
cashAmount
mobileBankAmount
aitAmount
loanAmount
advanceAmount
pfAmount
stampAmount
foodAmount
absentDeductionAmount
leaveDeductionAmount
otherDeductionAmount
totalDeductionAmount
netAmount
payableAmount
```

## Permissions

```txt
legacy_salary_import:read
legacy_salary_import:process
legacy_salary_import:export
legacy_salary_import:delete
```

Recommended access:

| Role | Access |
| --- | --- |
| super_admin | Full |
| admin | Full |
| hr | Read / process / export / delete |
| accounts | Read / process / export / delete |
| manager | Read only |
| employee | No access |

## Report Center Integration

A report catalog entry is added:

```txt
Legacy Salary Sheet Archive
```

It is under salary/report archive flow and supports preview, CSV, and Excel export.

## Postman Test Sequence

### 1. Template Excel

```txt
GET {{baseUrl}}/legacy-salary-imports/template/excel
```

Expected content type:

```txt
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### 2. Preview

```txt
POST {{baseUrl}}/legacy-salary-imports/preview
```

Expected:

```txt
success: true
data.totalRows
data.validRows
data.matchedRows
data.unmatchedRows
data.totals
```

### 3. Commit

```txt
POST {{baseUrl}}/legacy-salary-imports/commit
```

Expected:

```txt
success: true
data.batchNo
data.payrollMonth
data.totalRows
```

### 4. List Batches

```txt
GET {{baseUrl}}/legacy-salary-imports?payrollMonth=2026-05
```

### 5. Records

```txt
GET {{baseUrl}}/legacy-salary-imports/records?payrollMonth=2026-05
```

### 6. Summary

```txt
GET {{baseUrl}}/legacy-salary-imports/summary?payrollMonth=2026-05&groupBy=department
```

Supported groupBy:

```txt
department
majorDepartment
company
sheetType
status
```

### 7. Export

```txt
GET {{baseUrl}}/legacy-salary-imports/records/export/excel?payrollMonth=2026-05
GET {{baseUrl}}/legacy-salary-imports/records/export/csv?payrollMonth=2026-05
```

## Future Frontend Route Suggestion

```txt
/reports/legacy-salary-import
/payroll/legacy-salary-sheets
```

Suggested UI flow:

```txt
Upload Excel
Parse Excel
Map Columns
Preview Rows
Confirm Commit
Archive List
Records Search
Summary/Charts
Export
```

## Future Enhancement

- Column mapping presets per old salary sheet format
- Duplicate import prevention by source file hash
- Batch rollback/revert
- Side-by-side comparison with native payroll
- Charts from imported salary history
- Employee salary history timeline from legacy archive
- PDF export
