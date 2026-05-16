# Part-F18 — Employee Document Upload UI Foundation

## Purpose

This part adds the frontend foundation for Employee Document Management and actual file upload/download using the backend modules completed in Part-B54 and Part-B54.1.

The UI is designed as an HR digital document vault for employee files such as NID, CV, appointment letter, joining letter, confirmation letter, salary certificate, bank document, nominee document, and other HR records.

## Scope completed

- Added route: `/employees/documents`
- Added sidebar child item under HR Operations > Employees > Documents
- Added route config and lazy-loaded page
- Added employee document API client
- Added employee document types and utility helpers
- Added employee selector with search support
- Added document filters by category/status/confidentiality/search term
- Added document summary cards
- Added actual binary upload form
- Added document list table
- Added secured download action
- Added verify/reject actions
- Added soft delete/restore actions
- Added Documents quick action from Employee Directory
- Added client permission constants aligned with backend document permissions
- Moved dashboard-prefixed redirect component out of router file to satisfy React refresh lint rule

## New frontend route

```text
/employees/documents
```

Employee Directory can open this page with a selected employee:

```text
/employees/documents?employee=<employeeMongoId>
```

## Backend APIs used

```text
POST   /api/v1/employee-documents/upload
GET    /api/v1/employee-documents
GET    /api/v1/employee-documents/deleted
GET    /api/v1/employee-documents/employee/:employeeId/summary
GET    /api/v1/employee-documents/:id/download
PATCH  /api/v1/employee-documents/:id/verify
PATCH  /api/v1/employee-documents/:id/reject
DELETE /api/v1/employee-documents/:id
PATCH  /api/v1/employee-documents/:id/restore
```

## Permissions used

```text
employee_document:read
employee_document:manage
employee_document:verify
employee_document:delete
```

## Important implementation rule

Employee documents are HR/archive records. They are connected to employee profile/service-book workflows, but they do not affect native payroll calculation.

## Frontend verification

Run from `client` folder:

```bash
npm run lint
npm run build
npm run dev
```

Then test:

```text
http://localhost:5173/employees/documents
```

## Manual browser test checklist

1. Login as admin or HR.
2. Open `/employees/documents`.
3. Search and select an employee.
4. Upload a small PDF/image document.
5. Confirm summary cards refresh.
6. Confirm document list shows the new file.
7. Download the uploaded file.
8. Verify the document.
9. Reject another document with reason.
10. Soft delete and restore a test document.
11. Open Employee Directory and click `Docs` action.
12. Confirm it opens `/employees/documents?employee=<id>`.

## Next logical part

After this UI foundation, the next logical frontend/backend improvement can be:

```text
Part-F18.1 — Employee Document UI Polish + Employee Profile Document Tab Integration
```

or broader profile work:

```text
Part-F19 — Employee Full Profile Page / Digital Service Book UI
```
