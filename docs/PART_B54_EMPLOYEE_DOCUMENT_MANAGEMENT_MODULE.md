# Part-B54 — Employee Document Management Module

## Purpose

This part adds a dedicated backend module for employee document records. The module is designed as the first controlled foundation for an employee digital vault / digital service book.

Important design rule:

- This module stores document metadata and lifecycle status.
- It does not mix documents into payroll calculation.
- It does not store large binary files in MongoDB.
- File binary upload/storage can be added later through a separate file storage service abstraction.

## Added API Base Path

```text
/api/v1/employee-documents
```

## Main Capabilities

- Register employee document metadata
- List/search/filter documents
- View employee-wise document list
- View employee-wise document summary
- Verify document
- Reject document
- Soft delete document
- Restore deleted document
- Expiring document alert list
- Employee profile API integration under `sections.documents`

## Supported Categories

```text
nid
birth_certificate
passport
photo
cv
educational_certificate
experience_certificate
appointment_letter
joining_letter
confirmation_letter
increment_letter
promotion_letter
transfer_letter
warning_letter
show_cause_letter
termination_letter
resignation_letter
clearance
salary_certificate
training_certificate
medical_certificate
bank_document
nominee_document
other
```

## Permissions Added

```text
employee_document:read
employee_document:manage
employee_document:verify
employee_document:delete
```

Default role coverage:

- super_admin: all
- admin: all
- hr: read/manage/verify/delete
- accounts: read
- manager: read

## API Endpoints

```text
POST   /api/v1/employee-documents
GET    /api/v1/employee-documents
GET    /api/v1/employee-documents/deleted
GET    /api/v1/employee-documents/expiring
GET    /api/v1/employee-documents/:id
GET    /api/v1/employee-documents/employee/:employeeId
GET    /api/v1/employee-documents/employee/:employeeId/summary
PATCH  /api/v1/employee-documents/:id
PATCH  /api/v1/employee-documents/:id/verify
PATCH  /api/v1/employee-documents/:id/reject
DELETE /api/v1/employee-documents/:id
PATCH  /api/v1/employee-documents/:id/restore
```

## Sample Create Body

```json
{
  "employee": "EMPLOYEE_MONGO_ID",
  "company": "COMPANY_MONGO_ID",
  "category": "nid",
  "title": "Employee NID Copy",
  "documentNo": "NID-1234567890",
  "issuingAuthority": "Election Commission Bangladesh",
  "issueDate": "2020-01-01",
  "expiryDate": "2030-01-01",
  "fileName": "EMP001_NID.pdf",
  "originalFileName": "nid-copy.pdf",
  "fileExtension": "pdf",
  "mimeType": "application/pdf",
  "fileSize": 204800,
  "fileUrl": "/storage/employees/EMP001/EMP001_NID.pdf",
  "storageProvider": "local",
  "confidentiality": "highly_confidential",
  "status": "pending",
  "remarks": "Initial employee NID record",
  "tags": ["nid", "joining"]
}
```

## Employee Profile Integration

Part-B53 employee profile API now includes:

```text
sections.documents.count
sections.documents.pendingCount
sections.documents.verifiedCount
sections.documents.rejectedCount
sections.documents.expiredCount
sections.documents.records
```

The employee profile summary now also includes:

```text
counters.documentCount
counters.pendingDocumentCount
```

## Future Extension

Recommended next document-related future parts:

```text
Part-B54.1 — File Storage Service Abstraction + Actual Upload Endpoint
Part-B54.2 — Employee Document Frontend Vault UI
Part-B54.3 — Document Expiry Notification + Dashboard Widget
Part-B54.4 — Document Template / HR Letter Generator Foundation
```
