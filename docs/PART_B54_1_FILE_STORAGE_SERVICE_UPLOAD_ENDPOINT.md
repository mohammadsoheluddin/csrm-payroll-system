# Part-B54.1 — File Storage Service Abstraction + Actual Upload Endpoint

## Purpose

This part extends the Employee Document Management Module with real local file storage support.

Part-B54 stored document metadata only. Part-B54.1 adds a reusable file storage service abstraction and actual binary upload/download endpoints for employee documents.

## Important design rules

- Employee document metadata stays in MongoDB.
- Large binary files are stored on disk under `server/storage/` during local/on-prem development.
- `server/storage/` is ignored by Git and must not be pushed.
- This is a local storage abstraction now; later it can be replaced/extended for cloud object storage or network storage.
- Employee documents remain separate from native payroll calculation.
- Document upload/download is protected by RBAC and audit logging.

## New storage abstraction

New module:

```text
server/src/modules/fileStorage/
```

Files:

```text
fileStorage.interface.ts
fileStorage.service.ts
```

Core behavior:

```text
save raw file buffer
sanitize file name
validate allowed extension/MIME type
create year/month/employee-wise storage path
calculate SHA-256 checksum
return storage metadata for EmployeeDocument
read stored local file safely for download
```

## New employee document endpoints

Base route:

```text
/api/v1/employee-documents
```

### Upload employee document file

```http
POST /api/v1/employee-documents/upload
Authorization: Bearer {{adminToken}}
Content-Type: application/pdf
x-file-name: EMP001_NID.pdf
```

Required query params:

```text
employee={{employeeMongoId}}
company={{companyMongoId}}
category=nid
title=Employee NID Copy
```

Optional query params:

```text
documentNo=NID-1234567890
issuingAuthority=Election Commission Bangladesh
issueDate=2020-01-01
expiryDate=2030-01-01
confidentiality=highly_confidential
status=pending
remarks=Uploaded initial NID copy
tags=nid,joining,verified-copy
```

Postman setup:

```text
Body → binary → choose file
```

Example URL:

```text
{{baseUrl}}/employee-documents/upload?employee={{employeeMongoId}}&company={{companyMongoId}}&category=nid&title=Employee%20NID%20Copy&confidentiality=highly_confidential&tags=nid,joining
```

Expected response:

```json
{
  "success": true,
  "message": "Employee document file uploaded successfully",
  "data": {
    "_id": "...",
    "fileName": "EMP001_NID-...pdf",
    "originalFileName": "EMP001_NID.pdf",
    "storageProvider": "local",
    "storagePath": "employee-documents/2026/05/<employeeId>/EMP001_NID-...pdf",
    "fileUrl": "/api/v1/employee-documents/<documentId>/download",
    "checksum": "..."
  }
}
```

### Download employee document file

```http
GET /api/v1/employee-documents/{{documentId}}/download
Authorization: Bearer {{adminToken}}
```

This endpoint streams/downloads the stored local file if the document exists and is not soft-deleted.

## Allowed file extensions

```text
pdf, jpg, jpeg, png, webp, doc, docx, xls, xlsx, csv, txt, ppt, pptx
```

## Local storage path

When running backend from `server/`, files are stored under:

```text
server/storage/employee-documents/YYYY/MM/<employeeMongoId>/
```

This folder is intentionally ignored by Git.

## Security controls

- Upload requires `employee_document:manage`.
- Download requires `employee_document:read`.
- Upload creates audit log action under Employee Document module.
- Download creates audit log action under Employee Document module.
- File path resolution is restricted to the configured local storage root to prevent path traversal.

## Verification commands

```bash
cd server
npm run build
npm run route:sanity
npm run dev
```

## Postman quick test

1. Create/select employee and company.
2. Open `POST /employee-documents/upload`.
3. Add Bearer token.
4. Add required query params.
5. Add `x-file-name` header.
6. Select Body → binary → file.
7. Send request.
8. Copy returned `_id`.
9. Test `GET /employee-documents/:id/download`.
10. Test `GET /employee-documents/employee/:employeeId` and confirm metadata appears.

## Future extension

Possible next enhancements:

```text
virus scan hook
file size policy per category
cloud/object storage provider
thumbnail generation
confidential file access approval
document redaction
signed temporary download URL
frontend document upload UI
```
