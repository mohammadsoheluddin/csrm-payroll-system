# Part-F18.1 — Employee Document UI Polish + Employee Profile Document Tab Integration

## Purpose

This part improves the Part-F18 Employee Document Upload UI and connects employee document visibility into the existing Employee Profile drawer.

The document module remains separate from payroll calculation. Employee documents are HR/Admin digital-vault records only.

## What changed

### 1. Employee document upload polish

- Added client-side file extension validation.
- Added client-side 25 MB max size validation to match backend raw upload limit.
- Added selected-file preview with file name, MIME type, and file size.
- Added automatic document title suggestion from file name.
- Added upload form reset after successful upload.
- Improved upload copy and labels for Part-F18.1.

### 2. Document status action dialog

Replaced browser `window.prompt` flows with a controlled in-app dialog for:

- Verify
- Reject
- Soft delete
- Restore

Each dialog shows the document title, category, status, and a remarks/reason box before submitting.

### 3. Employee Profile drawer integration

The existing Employee Profile drawer now includes a **Document Vault** section.

The section shows:

- Total document count
- Verified count
- Pending + rejected count
- Document readiness badge
- Recent uploaded documents
- Status and expiry badges
- Quick button to open the full Employee Document Upload page with the selected employee preloaded

### 4. Document table polish

- Improved expiry badge display.
- Reduced action column width slightly while keeping actions in one row.
- Removed disabled “Edit later” action from normal rows.
- Shows archived status only when relevant.

## Updated files

```text
client/src/features/employees/components/EmployeeProfileDrawer.tsx
client/src/features/employees/employee-documents/components/EmployeeDocumentStatusDialog.tsx
client/src/features/employees/employee-documents/components/EmployeeDocumentTable.tsx
client/src/features/employees/employee-documents/components/EmployeeDocumentUploadPanel.tsx
client/src/features/employees/employee-documents/components/EmployeeProfileDocumentTab.tsx
client/src/features/employees/employee-documents/pages/EmployeeDocumentUploadPage.tsx
client/src/features/employees/employee-documents/utils/employeeDocument.utils.ts
```

## Verification

Run from the project root:

```bash
cd client
npm run lint
npm run build
npm run dev
```

## Browser test checklist

1. Open `/employees`.
2. Click **View** on an employee row.
3. Confirm the Employee Profile drawer now shows the **Document Vault** section.
4. Click **Open Documents** from the drawer.
5. Confirm `/employees/documents?employee=<employeeId>` opens with the employee selected.
6. Upload a valid PDF/image/doc file.
7. Confirm file preview appears before upload.
8. Confirm the form resets after successful upload.
9. Verify a document and confirm the new action dialog appears.
10. Reject a document and confirm a required reason can be added.
11. Soft delete a document.
12. Switch to Deleted mode and restore it.
13. Confirm summary cards and profile drawer document snapshot update after refresh.

## Git commands

```bash
git add \
  client/src/features/employees/components/EmployeeProfileDrawer.tsx \
  client/src/features/employees/employee-documents/components/EmployeeDocumentStatusDialog.tsx \
  client/src/features/employees/employee-documents/components/EmployeeDocumentTable.tsx \
  client/src/features/employees/employee-documents/components/EmployeeDocumentUploadPanel.tsx \
  client/src/features/employees/employee-documents/components/EmployeeProfileDocumentTab.tsx \
  client/src/features/employees/employee-documents/pages/EmployeeDocumentUploadPage.tsx \
  client/src/features/employees/employee-documents/utils/employeeDocument.utils.ts \
  docs/PART_F18_1_EMPLOYEE_DOCUMENT_UI_POLISH_PROFILE_TAB_INTEGRATION.md

git commit -m "Polish employee document UI and add profile document tab"

git push
```

## Next logical part

After this, the next logical part is:

```text
Part-F19 — Employee Full Profile Page / Digital Service Book UI
```

That part should create a full route-based employee profile page instead of only relying on the drawer.
