# Part-48.3 — Core Master Soft Delete / Restore API Hardening & Postman Master Test Cases

Last Updated: 2026-05-10  
Scope: Core master modules already updated in Part-48.2

---

## 1. Purpose

Part-48.3 verifies and hardens the soft delete / restore implementation added to the core master modules in Part-48.2.

This part does not introduce a broad backend rewrite. It focuses on:

1. Route behavior verification.
2. Deleted list behavior verification.
3. Restore behavior verification.
4. Duplicate restore conflict verification.
5. Dependency/usage guard verification.
6. Audit log verification.
7. A reusable Postman master test flow for core master modules.

---

## 2. Modules Covered

| Module | Base Endpoint | Read Permission | Manage Permission |
| ------ | ------------- | --------------- | ----------------- |
| Company | `/api/v1/companies` | `company:read` | `company:manage` |
| Branch | `/api/v1/branches` | `branch:read` | `branch:manage` |
| Designation | `/api/v1/designations` | `designation:read` | `designation:manage` |
| Major Department | `/api/v1/major-departments` | `major_department:read` | `major_department:manage` |
| Department | `/api/v1/departments` | `department:read` | `department:manage` |

---

## 3. APIs That Must Work

For each module:

```http
GET /resource
GET /resource/deleted
GET /resource/:id
DELETE /resource/:id
PATCH /resource/:id/restore
```

Important:

`GET /resource/deleted` must work as a deleted-list route. It must not be treated as `GET /resource/:id`.

Correct route order rule:

```ts
router.get("/deleted", ...);
router.get("/:id", ...);
```

For PATCH routes, restore must remain before normal update route:

```ts
router.patch("/:id/restore", ...);
router.patch("/:id", ...);
```

---

## 4. Standard Request Headers

Use admin/super_admin token.

```http
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

Recommended Postman variables:

| Variable | Example |
| -------- | ------- |
| `baseUrl` | `http://localhost:5000/api/v1` |
| `adminToken` | JWT token from login |
| `companyId` | MongoDB ObjectId |
| `branchId` | MongoDB ObjectId |
| `designationId` | MongoDB ObjectId |
| `majorDepartmentId` | MongoDB ObjectId |
| `departmentId` | MongoDB ObjectId |

---

## 5. Standard Success Expectations

### Active list

```http
GET {{baseUrl}}/companies
```

Expected:

- HTTP 200
- `success: true`
- data array contains only active/non-deleted records
- deleted records should not appear

### Deleted list

```http
GET {{baseUrl}}/companies/deleted
```

Expected:

- HTTP 200
- `success: true`
- data array contains deleted records only
- records should include `isDeleted: true`
- records should include `deletedAt`

### Soft delete

```http
DELETE {{baseUrl}}/companies/{{companyId}}
```

Body:

```json
{
  "deleteReason": "Part-48.3 soft delete test"
}
```

Expected:

- HTTP 200
- `success: true`
- returned record has `isDeleted: true`
- returned record has `deletedAt`
- returned record has `deleteReason`

### Normal get after delete

```http
GET {{baseUrl}}/companies/{{companyId}}
```

Expected:

- HTTP 404 or equivalent safe not-found response
- deleted record should not be returned from normal active-read API

### Restore

```http
PATCH {{baseUrl}}/companies/{{companyId}}/restore
```

Body:

```json
{
  "restoreReason": "Part-48.3 restore test"
}
```

Expected:

- HTTP 200
- `success: true`
- returned record has `isDeleted: false`
- returned record has `restoredAt`
- returned record has `restoreReason`

---

## 6. Module-wise Test Flow

Repeat this flow for each module.

### A. Company

```http
GET {{baseUrl}}/companies
GET {{baseUrl}}/companies/deleted
DELETE {{baseUrl}}/companies/{{companyId}}
GET {{baseUrl}}/companies/{{companyId}}
GET {{baseUrl}}/companies/deleted
PATCH {{baseUrl}}/companies/{{companyId}}/restore
GET {{baseUrl}}/companies/{{companyId}}
```

### B. Branch

```http
GET {{baseUrl}}/branches
GET {{baseUrl}}/branches/deleted
DELETE {{baseUrl}}/branches/{{branchId}}
GET {{baseUrl}}/branches/{{branchId}}
GET {{baseUrl}}/branches/deleted
PATCH {{baseUrl}}/branches/{{branchId}}/restore
GET {{baseUrl}}/branches/{{branchId}}
```

### C. Designation

```http
GET {{baseUrl}}/designations
GET {{baseUrl}}/designations/deleted
DELETE {{baseUrl}}/designations/{{designationId}}
GET {{baseUrl}}/designations/{{designationId}}
GET {{baseUrl}}/designations/deleted
PATCH {{baseUrl}}/designations/{{designationId}}/restore
GET {{baseUrl}}/designations/{{designationId}}
```

### D. Major Department

```http
GET {{baseUrl}}/major-departments
GET {{baseUrl}}/major-departments/deleted
DELETE {{baseUrl}}/major-departments/{{majorDepartmentId}}
GET {{baseUrl}}/major-departments/{{majorDepartmentId}}
GET {{baseUrl}}/major-departments/deleted
PATCH {{baseUrl}}/major-departments/{{majorDepartmentId}}/restore
GET {{baseUrl}}/major-departments/{{majorDepartmentId}}
```

### E. Department

```http
GET {{baseUrl}}/departments
GET {{baseUrl}}/departments/deleted
DELETE {{baseUrl}}/departments/{{departmentId}}
GET {{baseUrl}}/departments/{{departmentId}}
GET {{baseUrl}}/departments/deleted
PATCH {{baseUrl}}/departments/{{departmentId}}/restore
GET {{baseUrl}}/departments/{{departmentId}}
```

---

## 7. Validation Hardening Tests

### Invalid ObjectId

```http
DELETE {{baseUrl}}/companies/abc
```

Expected:

- HTTP 400
- validation error for invalid id

### Empty reason

```json
{
  "deleteReason": ""
}
```

Expected:

- HTTP 400
- reason cannot be empty

### Too long reason

Send a string longer than 500 characters.

Expected:

- HTTP 400
- reason length validation error

### Unknown field

```json
{
  "deleteReason": "Testing",
  "unknownField": "not allowed"
}
```

Expected:

- HTTP 400
- strict validation should reject unknown field

---

## 8. Duplicate Restore Conflict Test

Purpose:

Confirm that restore does not accidentally create duplicate active master records.

Manual flow:

1. Create a master record, for example Branch with code `TEST-BR-01`.
2. Delete that record.
3. Create another active Branch with the same code `TEST-BR-01`.
4. Try to restore the deleted Branch.

Expected:

- Restore should fail with HTTP 409.
- Message should explain duplicate/conflict.

Repeat similar conflict test for:

- Company name/code
- Branch name/code
- Designation name/code under same company
- Major Department name/code under same company
- Department name/code under same company and major department

---

## 9. Dependency Guard Test

Purpose:

Master records that are already assigned to active employees or child records should not be deleted blindly.

Expected guard behavior:

| Module | Guard Example |
| ------ | ------------- |
| Company | Cannot delete if active employees/major departments/departments/designations are linked |
| Branch | Cannot delete if active employees are linked |
| Designation | Cannot delete if active employees are linked |
| Major Department | Cannot delete if active employees/departments are linked |
| Department | Cannot delete if active employees are linked |

Expected response:

- HTTP 409
- clear conflict message
- record should remain active

---

## 10. Audit Log Verification

After a successful soft delete:

```http
GET {{baseUrl}}/audit-logs?action=soft_delete
```

After a successful restore:

```http
GET {{baseUrl}}/audit-logs?action=restore
```

Entity-specific audit trail:

```http
GET {{baseUrl}}/audit-logs/entity/{{companyId}}
```

Expected:

- soft delete action is logged
- restore action is logged
- actor information is available where auth user context exists
- previousData/newData or metadata includes relevant change context
- deleteReason/restoreReason appears in metadata when provided

---

## 11. RBAC Test

Use different role tokens if available.

| Role | Expected |
| ---- | -------- |
| super_admin/admin | Can read/manage if permissions assigned |
| HR | Depends on assigned permission matrix |
| Accounts | Should not manage master data unless permission assigned |
| Manager | Should usually read limited data only |
| Employee | Should not manage core master data |

Expected forbidden response:

- HTTP 403
- forbidden/access denied message

---

## 12. Postman Collection Included

A Postman collection is included in this part:

```txt
postman/collections/part-48.3-core-master-soft-delete-restore.postman_collection.json
```

An optional local environment is included:

```txt
postman/environments/csrm-payroll-local.postman_environment.json
```

Before running the collection:

1. Import the environment.
2. Set `baseUrl`.
3. Set `adminToken`.
4. Set IDs for records that are safe to delete/restore.
5. Do not use production records for this test.

---

## 13. Safe Testing Note

Do not test delete/restore on real important production-like master records unless you know they are not linked with employees or payroll history.

Recommended:

Create temporary test records specifically for Part-48.3, such as:

- `TEST Company 48.3`
- `TEST Branch 48.3`
- `TEST Designation 48.3`
- `TEST Major Department 48.3`
- `TEST Department 48.3`

Then use those IDs in Postman variables.

---

## 14. Part-48.3 Completion Criteria

Part-48.3 is complete when:

1. `npm run build` passes.
2. Server runs with `npm run dev`.
3. Active list APIs work.
4. Deleted list APIs work.
5. Soft delete works.
6. Normal get does not return deleted records.
7. Restore works.
8. Duplicate restore conflict test works.
9. Dependency guard test works.
10. Audit log shows `soft_delete` and `restore` actions.
11. RBAC behavior is verified.

---

## 15. Next Logical Part

After Part-48.3:

Part-48.4 — Apply Soft Delete Standard to HR / Employee Related Modules

Recommended first HR modules:

1. employeeBankInfo
2. employeeMovement
3. employeeBulkImport if applicable
4. employee module should be handled carefully because employee deletion has HR/legal/payroll implications

Do not blindly soft-delete employees like simple master data. For employees, inactive/resigned/terminated status may be more important than normal delete.
