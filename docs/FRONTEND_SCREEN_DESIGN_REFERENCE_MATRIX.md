# Frontend Screen Design Reference Matrix

Project: CSRM Payroll System  
Purpose: Map approved UI references to future frontend screens and modules.

---

## 1. Dashboard

Reference direction:

```txt
Large ERP dashboard with KPI cards, charts, recent approvals, audit activity, system status, and quick actions.
```

Future route:

```txt
/dashboard
```

Implementation notes:

- role-wise dashboard widgets
- company/month filter
- customizable widgets later
- charts through Recharts
- cards from reusable KPI component

---

## 2. Master Data Management

Reference direction:

```txt
Tabbed master data page with company/branch/major department/department/designation records, table list, filters, action buttons, and right-side edit drawer.
```

Future routes:

```txt
/masters/companies
/masters/branches
/masters/major-departments
/masters/departments
/masters/designations
/masters/company-bank-accounts
```

Implementation notes:

- shared master-data table component
- right-side detail/edit drawer
- audit trail tab
- soft delete/restore actions
- permission-wise buttons

---

## 3. Employee Directory

Reference direction:

```txt
Employee list with KPI cards, filters, employee table, profile summary side panel, payment info, salary snapshot, movement history, and audit events.
```

Future routes:

```txt
/employees
/employees/:id
```

Implementation notes:

- employee search/filter
- row action menu
- profile side panel/drawer
- soft delete/restore
- view profile / edit / documents

---

## 4. Employee Create/Edit Form

Reference direction:

```txt
Multi-step employee form with personal information, office information, salary/charges, bank/payment info, documents, validation checklist, preview card, and quick links.
```

Future routes:

```txt
/employees/create
/employees/:id/edit
```

Implementation notes:

- React Hook Form + Zod
- section-based validation
- save as draft optional later
- sticky action header
- backend error mapping from Part-F4

---

## 5. Attendance & Leave Operations

Reference direction:

```txt
Unified attendance/leave operations screen with attendance register, import status, finalization card, leave approval queue, leave balance summary, and holiday calendar.
```

Future routes:

```txt
/attendance
/attendance/import
/attendance/finalization
/leave
/leave/balance
/holidays
```

Implementation notes:

- date/month filter
- attendance grid
- import history
- finalization/lock status
- leave approval queue
- holiday calendar/list

---

## 6. Payroll Processing & Approval

Reference direction:

```txt
Payroll workflow page with period selection, validation, payroll generation, salary review, approval, lock period, distribution, KPI cards, approval timeline, run history, and integrity status.
```

Future routes:

```txt
/payroll
/payroll/runs
/payroll/approvals
/payroll/lock-status
```

Implementation notes:

- workflow stepper
- payroll run overview
- approval timeline
- lock/unlock controls
- all actions permission-guarded
- destructive actions require confirmation

---

## 7. Report Center

Reference direction:

```txt
Report filter panel, report type selector cards, preview section, saved report configurations, recent downloads/export jobs, and export options.
```

Future routes:

```txt
/reports/center
/reports/salary-sheet
/reports/payslip
/reports/bank-sheet
/reports/time-bill
/reports/ot-statement
/reports/bonus-sheet
/reports/salary-summary
```

Implementation notes:

- must respect backend route notes
- no blind base-route calls
- use backend preview/export APIs
- support PDF/Excel/CSV where backend supports

---

## 8. Payroll Export Preview

Reference direction:

```txt
Three-column export preview card layout for Bank Sheet, Time Bill/OT Statement, Bonus Statement with format badges and download buttons.
```

Future route:

```txt
/reports/exports
```

Implementation notes:

- can be a report center sub-view
- live backend export endpoint status
- disable unavailable export types
- audit-ready export labels

---

## 9. Salary Sheet Preview

Reference direction:

```txt
Document-style salary sheet preview with toolbar, company header, period info, department groups, totals, grand total, and signature blocks.
```

Future route:

```txt
/reports/salary-sheet/preview
```

Implementation notes:

- print-friendly white document surface
- landscape/fit-to-page view controls later
- backend data only
- PDF/Excel buttons use file download helper

---

## 10. Payslip Preview

Reference direction:

```txt
Formal payslip document with employee profile, payment info, attendance summary, earnings, deductions, net pay, amount in words, prepared/received signature areas.
```

Future route:

```txt
/reports/payslip/:employeeId
```

Implementation notes:

- confidential view
- employee-specific permission handling
- backend payslip API
- printable layout

---

## Final Note

These references are the approved UI direction. Future implementation should convert them into reusable React components, not isolated screenshot-specific pages.
