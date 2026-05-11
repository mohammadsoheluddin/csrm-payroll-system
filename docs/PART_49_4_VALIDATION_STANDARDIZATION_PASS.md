# Part-49.4 — Validation Standardization Pass

Last Updated: 2026-05-11

## Purpose

This part standardizes important validation patterns so future backend work does not repeat different ObjectId, month/year, date, pagination, and text validation logic in every module.

This is a foundation pass, not a full rewrite of every validation file.

## Files Changed

- `server/src/common/validation.ts`
- `server/src/common/softDelete.ts`
- `server/src/modules/payroll/payroll.generate.validation.ts`
- `server/src/modules/companyBankAccount/companyBankAccount.validation.ts`
- `server/src/modules/companyBankAccount/companyBankAccount.route.ts`

## What Was Standardized

### 1. Common Validation Utility

A new reusable validation utility was added:

`server/src/common/validation.ts`

It provides reusable schemas/helpers for:

- MongoDB ObjectId
- ID params
- trimmed required/optional strings
- active/inactive status
- month number
- year number
- payroll month format
- date string format
- time string format
- boolean query string
- pagination query fields
- sort order
- date range validation

## 2. Soft Delete Validation Aligned

`server/src/common/softDelete.ts` now uses the shared ObjectId validation helper from `common/validation.ts`.

This keeps delete/restore route param validation consistent with the rest of the project.

## 3. Payroll Generate Validation Hardened

`server/src/modules/payroll/payroll.generate.validation.ts` was updated to validate:

- `month`: coerced number, 1–12
- `year`: coerced number, 2000–2100
- `company`: required valid ObjectId
- `branch`: optional valid ObjectId
- `majorDepartment`: optional valid ObjectId
- `department`: optional valid ObjectId
- `employee`: optional valid ObjectId
- `overwrite`: optional boolean
- `remarks`: optional trimmed text, max 500 chars

This prevents accidental invalid company IDs and supports more controlled payroll filtering.

## 4. Company Bank Account Validation Hardened

`server/src/modules/companyBankAccount/companyBankAccount.validation.ts` was upgraded from very loose string validation to strict validation.

Now it validates:

- `company`: valid ObjectId
- required bank/account fields with length limits
- `accountType` enum
- `currency` as 3-letter uppercase code
- `status` enum
- update body must contain at least one field
- query filters are strict
- ID params are validated before service execution

Routes now validate:

- `GET /company-bank-accounts`
- `GET /company-bank-accounts/:id`
- `PATCH /company-bank-accounts/:id`
- `DELETE /company-bank-accounts/:id`

## Why This Matters

Without standardized validation:

- invalid ObjectId can reach service/database layer
- invalid query fields can silently pass
- inconsistent error messages confuse frontend developers
- payroll/business calculations may receive invalid inputs
- route-level validation becomes unpredictable

This pass reduces those risks.

## Validation Standard Going Forward

New or refactored modules should import from:

```ts
import {
  objectIdSchema,
  idParamValidationSchema,
  monthNumberSchema,
  yearNumberSchema,
  dateStringSchema,
  paginationQueryFields,
} from "../../common/validation";
```

Avoid creating new duplicate ObjectId/date/month helpers inside module validation files unless there is a special reason.

## Manual Test Checklist

### Payroll Generate Validation

Request:

```http
POST /api/v1/payroll/generate
```

Valid body:

```json
{
  "month": 5,
  "year": 2026,
  "company": "<valid_company_object_id>"
}
```

Expected:

- If attendance finalization is missing, `409 Conflict` is acceptable and means validation passed.
- If company is invalid, response should be `400 Bad Request`.

Invalid body:

```json
{
  "month": 13,
  "year": 2026,
  "company": "abc"
}
```

Expected:

- `400 Bad Request`
- Month/ObjectId validation errors

### Company Bank Account Validation

Create:

```http
POST /api/v1/company-bank-accounts
```

Valid body:

```json
{
  "company": "<valid_company_object_id>",
  "accountName": "CSRM Salary Account",
  "bankName": "Islami Bank Bangladesh PLC",
  "branchName": "Agrabad Branch",
  "branchCode": "AGB001",
  "routingNo": "125678901",
  "accountNo": "205012345678901",
  "processBankBranchNo": "PBB001",
  "accountType": "salary",
  "currency": "BDT",
  "isPrimary": true,
  "status": "active"
}
```

Invalid ID test:

```http
GET /api/v1/company-bank-accounts/abc
```

Expected:

- `400 Bad Request`

Invalid update test:

```http
PATCH /api/v1/company-bank-accounts/<id>
```

Body:

```json
{}
```

Expected:

- `400 Bad Request`
- At least one field required

## Build Verification

Run:

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run typecheck
npm run build:clean
```

Expected:

- Both commands should pass.

## Next Recommended Part

Part-49.5 — API Response + Error Standardization

Focus:

- response shape consistency
- error message consistency
- `sendResponse` usage check
- pagination meta shape
- Zod error formatting consistency
