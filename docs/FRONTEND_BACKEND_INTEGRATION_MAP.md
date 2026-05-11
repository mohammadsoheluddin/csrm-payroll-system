# CSRM Payroll System — Frontend / Backend Integration Map

Last Updated: 2026-05-11  
Created In: Part-50.2 — Backend API Documentation Pack

---

## 1. Purpose

This document maps backend modules to expected frontend screens.

It helps the frontend phase start without guessing.

---

## 2. Global Frontend Requirements

Frontend should support:

```txt
JWT login
Role-wise sidebar
Permission-wise menu/button visibility
Light/dark mode
Dashboard widget customization
Theme style variation
Server-side pagination
Search/filter/sort
PDF/Excel/CSV download buttons
Soft delete reason modal
Restore reason modal
Audit trail drawer
Approval timeline
Error toast/message display
```

---

## 3. Backend Module → Frontend Screen Map

| Backend Module | Frontend Screens |
| -------------- | ---------------- |
| auth | Login, Change Password, Session Expired |
| user | User List, Create User, Role/Permission Assign |
| company | Company Setup, Deleted Companies |
| branch | Branch Setup, Deleted Branches |
| majorDepartment | Major Department Setup |
| department | Department Setup |
| designation | Designation Setup |
| companyBankAccount | Company Bank Account Setup |
| employee | Employee Directory, Employee Profile, Employee Create/Edit, Lifecycle Change |
| employeeBankInfo | Employee Payment Info Tab |
| employeeMovement | Movement History, Create Movement |
| employeeBulkImport | Bulk Import Wizard, Template Download, Rejection Report |
| attendance | Attendance Register, Manual Entry |
| attendanceImport | Attendance Import Wizard, Import Batch History |
| attendanceFinalization | Attendance Finalization, Lock/Unlock |
| leave | Leave Application, Approval Queue |
| leaveBalance | Leave Balance, Leave Ledger, Opening Balance |
| holiday | Holiday Calendar |
| salaryStructure | Salary Structure Setup |
| payroll | Payroll Run, Payroll Approval, Payroll History |
| payrollReport | Payroll Report Viewer |
| salarySheet | Salary Sheet Preview/Export |
| salaryStatement | Salary Statement Preview/Export |
| salaryPaymentDistribution | Salary Payment Distribution |
| timeBill | Time Bill / OT Bill |
| otStatement | OT Statement |
| otPaymentDistribution | OT Payment Distribution |
| bonusSheet | Bonus Sheet |
| bonusStatement | Bonus Statement |
| bonusPaymentDistribution | Bonus Payment Distribution |
| bankSheet | Bank Sheet Preview/Export |
| bankSheetHistory | Bank Sheet History |
| reportCenter | Report Center, Saved Reports |
| reportLayoutStandard | Report Layout Settings |
| monthEndProcessControl | Month-End Control Panel |
| auditLog | Audit Log Viewer, Sensitive Activity |
| rbacAudit | RBAC Audit Dashboard |

---

## 4. Dashboard Widgets

Possible dashboard widgets:

```txt
Employee summary
Attendance today
Pending leave
Payroll status
Salary payment summary
Pending approvals
Month-end lock status
Department-wise employee count
Attendance trend
Leave balance alert
Payment distribution summary
Audit risk alerts
Export job status
System health
```

Dashboard should support:

```txt
Show/hide widgets
Role-wise presets
User-wise preference
Optional drag-and-drop layout later
```

---

## 5. Theme System

Frontend should support:

```txt
Light mode
Dark mode
Corporate Blue theme
Compact ERP theme
Modern dashboard theme
Table density: compact / comfortable
```

Theme should not change business logic or output calculation.

---

## 6. Standard UI Components

Required component library concepts:

```txt
DataTable
FilterBar
SearchInput
DateRangePicker
MonthYearPicker
StatusBadge
RoleBadge
PermissionGuard
SoftDeleteModal
RestoreModal
AuditTrailDrawer
ApprovalTimeline
ExportButtonGroup
ReportPreviewPanel
FormSectionCard
```

---

## 7. API Integration Pattern

Recommended frontend API flow:

```txt
apiClient
→ auth interceptor
→ module service
→ React Query / data fetching layer
→ page component
```

Example:

```txt
employeeApi.getEmployees()
employeeApi.createEmployee(payload)
employeeApi.changeLifecycle(id, payload)
employeeApi.softDelete(id, reason)
employeeApi.restore(id, reason)
```

---

## 8. Error Handling

Frontend should read backend error shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorSources": [
    {
      "path": "body.company",
      "message": "Invalid company ID"
    }
  ]
}
```

UI behavior:

```txt
Show main message as toast
Map field-level errors to form inputs
Show 403 as Forbidden page or permission message
Show 409 as business-rule conflict modal/message
```

---

## 9. Report / Export UI

Every report screen should support:

```txt
Filters
Preview
JSON view if needed
PDF download
Excel download
CSV download if available
Print
Audit log of export/download
```

Important output groups:

```txt
Salary Sheet
Salary Statement
Payslip
Time Bill
OT Statement
Bonus Sheet
Bonus Statement
Bank Sheet
Attendance Summary
Leave Balance Ledger
Payroll Report
```

---

## 10. Frontend Start Recommendation

Do not start random UI pages first.

Start frontend in this order:

```txt
1. Auth + Layout + Sidebar
2. API client + token handling
3. Dashboard shell
4. Master data pages
5. Employee directory/create/profile
6. Attendance/Leave
7. Payroll
8. Reports/Exports
9. Audit/RBAC
10. Theme + dashboard customization polish
```
