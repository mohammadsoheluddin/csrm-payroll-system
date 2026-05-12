# CSRM Payroll System — Frontend Folder Structure and Route Map

Last Updated: 2026-05-12  
Related Part: Part-F0 — Frontend Architecture Blueprint & Folder Structure

---

## 1. Purpose

This document defines the frontend folder structure, route map, and sidebar grouping for the CSRM Payroll System frontend phase.

The frontend should start from the existing `client/` folder, but the default Vite starter screen should be replaced in Part-F1/F2.

---

## 2. Folder Structure Standard

```txt
client/src/
├── app/
│   ├── App.tsx
│   ├── providers/
│   └── router/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── data-table/
│   ├── forms/
│   ├── feedback/
│   ├── modals/
│   ├── reports/
│   ├── audit/
│   └── guards/
├── config/
│   ├── env.ts
│   ├── permissions.ts
│   ├── roles.ts
│   ├── routePaths.ts
│   └── sidebar.config.tsx
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── users/
│   ├── master-data/
│   ├── employees/
│   ├── attendance/
│   ├── leave/
│   ├── payroll/
│   ├── salary/
│   ├── time-bill/
│   ├── bonus/
│   ├── bank-sheets/
│   ├── reports/
│   ├── audit/
│   ├── rbac/
│   └── settings/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── query/
│   └── utils/
├── stores/
├── styles/
├── types/
└── main.tsx
```

---

## 3. Feature Folder Standard

Each business feature should use this pattern:

```txt
feature-name/
├── api/
│   └── feature.api.ts
├── components/
├── hooks/
├── pages/
├── schemas/
│   └── feature.schema.ts
├── types/
│   └── feature.types.ts
└── utils/
```

Example:

```txt
features/employees/employee-directory/
├── api/employee.api.ts
├── components/EmployeeTable.tsx
├── hooks/useEmployees.ts
├── pages/EmployeeListPage.tsx
├── schemas/employee.schema.ts
├── types/employee.types.ts
└── utils/employee.mapper.ts
```

---

## 4. Route Map

### Public

| Route | Screen |
| --- | --- |
| `/login` | Login |
| `/session-expired` | Session Expired |
| `/forbidden` | Forbidden |
| `*` | Not Found |

### Protected / Dashboard

| Route | Screen | Permission |
| --- | --- | --- |
| `/dashboard` | Dashboard | logged in |
| `/users` | Users | `user:read` |
| `/settings/profile` | Profile | logged in |
| `/settings/theme` | Theme Settings | logged in |

### Master Setup

| Route | Screen | Permission |
| --- | --- | --- |
| `/masters/companies` | Companies / Concerns | `company:read` |
| `/masters/branches` | Branches | `branch:read` |
| `/masters/major-departments` | Major Departments | `major_department:read` |
| `/masters/departments` | Departments | `department:read` |
| `/masters/designations` | Designations | `designation:read` |
| `/masters/company-bank-accounts` | Company Bank Accounts | `company_bank_account:read` |

### HR & Employee

| Route | Screen | Permission |
| --- | --- | --- |
| `/employees` | Employee Directory | `employee:read` |
| `/employees/create` | Create Employee | `employee:manage` |
| `/employees/:id` | Employee Profile | `employee:read` |
| `/employees/:id/edit` | Edit Employee | `employee:manage` |
| `/employee-bank-infos` | Employee Payment Info | `employee_bank_info:read` |
| `/employee-movements` | Employee Movement | `employee_movement:read` |
| `/employee-bulk-imports` | Employee Bulk Import | `employee_bulk_import:read` |

### Attendance & Leave

| Route | Screen | Permission |
| --- | --- | --- |
| `/attendance/register` | Attendance Register | `attendance:read` |
| `/attendance/manual-entry` | Manual Attendance Entry | `attendance:manage` |
| `/attendance/imports` | Attendance Import | `attendance_import:read` |
| `/attendance/finalizations` | Attendance Finalization | `attendance_finalization:read` |
| `/leave/applications` | Leave Applications | `leave:read` |
| `/leave/approval` | Leave Approval | `leave:approve` |
| `/leave/balances` | Leave Balances | `leave_balance:read` |
| `/leave/holidays` | Holidays | `holiday:read` |

### Payroll & Salary

| Route | Screen | Permission |
| --- | --- | --- |
| `/payroll/run` | Payroll Run | `payroll:process` |
| `/payroll/history` | Payroll History | `payroll:read` |
| `/payroll/approval` | Payroll Approval | `payroll:approve` |
| `/salary/structures` | Salary Structures | `salary_structure:read` |
| `/salary/sheets` | Salary Sheets | `salary_sheet:read` |
| `/salary/statements` | Salary Statements | `salary_statement:read` |
| `/salary/payment-distributions` | Salary Payment Distributions | `salary_payment_distribution:read` |

### Time Bill / OT / Bonus

| Route | Screen | Permission |
| --- | --- | --- |
| `/time-bill/time-bills` | Time Bills | `time_bill:read` |
| `/time-bill/ot-statements` | OT Statements | `ot_statement:read` |
| `/time-bill/ot-payment-distributions` | OT Payment Distributions | `ot_payment_distribution:read` |
| `/bonus/sheets` | Bonus Sheets | `bonus_sheet:read` |
| `/bonus/statements` | Bonus Statements | `bonus_statement:read` |
| `/bonus/payment-distributions` | Bonus Payment Distributions | `bonus_payment_distribution:read` |

### Reports / System

| Route | Screen | Permission |
| --- | --- | --- |
| `/reports/report-center` | Report Center | `report_center:read` |
| `/reports/payroll-monthly` | Payroll Monthly Report | `payroll_report:read` |
| `/reports/bank-sheets` | Bank Sheets | `bank_sheet:read` |
| `/reports/report-layouts` | Report Layout Standards | `report_layout_standard:read` |
| `/system/month-end` | Month-End Control | `month_end_process_control:read` |
| `/system/audit-logs` | Audit Logs | `audit_log:read` |
| `/system/rbac-audit` | RBAC Audit | `rbac_audit:read` |

---

## 5. Sidebar Groups

```txt
Dashboard
Master Setup
HR & Employee
Attendance & Leave
Payroll & Salary
Time Bill / OT
Bonus
Reports & Exports
System & Audit
Settings
```

Sidebar rule:

```txt
Hide menu item if permission is missing.
Hide group if all children are hidden.
Do not use sidebar hiding as backend security.
```
