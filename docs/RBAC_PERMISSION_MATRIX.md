# CSRM Payroll System — RBAC Permission Matrix

Last Updated: 2026-05-11  
Updated In: Part-49.2 — RBAC Route Enforcement Consistency Pass

---

## 1. Purpose

This document defines the current role-based permission model for the CSRM Payroll System.

The project now follows this route-level standard:

```ts
auth(),
requirePermission(PERMISSIONS.MODULE_ACTION)
```

The permission matrix should be treated as the main source of truth for protected route access.

---

## 2. Roles

Current roles:

| Role | Purpose |
| ---- | ------- |
| `super_admin` | Full system and technical administration |
| `admin` | Full operational administration |
| `hr` | HR, employee, attendance, leave, movement, and salary operations |
| `accounts` | Payroll, salary statement, bank/payment, bonus, OT, and financial processing |
| `manager` | Department/team-level review and approval visibility |
| `employee` | Self-service access only |

---

## 3. Core Rule

### Do

Use permission-based route enforcement:

```ts
auth(),
requirePermission(PERMISSIONS.EMPLOYEE_READ)
```

### Avoid

Avoid hard-coded role lists inside module routes:

```ts
auth(USER_ROLE.admin, USER_ROLE.hr)
```

Reason:

- Permissions are easier to audit.
- Permissions are easier to extend.
- Custom future roles become possible.
- Route access stays consistent across modules.

---

## 4. Permission Naming Pattern

Current general pattern:

```txt
module:read
module:manage
module:process
module:approve
module:lock
module:unlock
module:export
module:revert
module:update
module:pay
module:audit_read
```

Examples:

```txt
employee:read
employee:manage
payroll:read
payroll:process
payroll:approve
salary_sheet:lock
bank_sheet:export
```

---

## 5. Important Permissions by Area

### Core / Master Data

| Area | Read | Manage |
| ---- | ---- | ------ |
| User | `user:read` | `user:manage` |
| Company | `company:read` | `company:manage` |
| Major Department | `major_department:read` | `major_department:manage` |
| Department | `department:read` | `department:manage` |
| Designation | `designation:read` | `designation:manage` |
| Branch | `branch:read` | `branch:manage` |
| Company Bank Account | `company_bank_account:read` | `company_bank_account:manage` |

### Employee / HR

| Area | Permissions |
| ---- | ----------- |
| Employee | `employee:read`, `employee:manage` |
| Employee Bank Info | `employee_bank_info:read`, `employee_bank_info:manage` |
| Employee Bulk Import | `employee_bulk_import:read`, `employee_bulk_import:process`, `employee_bulk_import:export`, `employee_bulk_import:revert` |
| Employee Movement | `employee_movement:read`, `employee_movement:manage`, `employee_movement:approve`, `employee_movement:apply`, `employee_movement:payroll_impact_read` |

### Attendance / Leave

| Area | Permissions |
| ---- | ----------- |
| Attendance | `attendance:read`, `attendance:manage` |
| Attendance Import | `attendance_import:read`, `attendance_import:process`, `attendance_import:export`, `attendance_import:revert` |
| Attendance Finalization | `attendance_finalization:read`, `attendance_finalization:process`, `attendance_finalization:approve`, `attendance_finalization:lock`, `attendance_finalization:unlock` |
| Leave | `leave:read`, `leave:manage`, `leave:approve` |
| Leave Balance | `leave_balance:read`, `leave_balance:process`, `leave_balance:adjust`, `leave_balance:lock`, `leave_balance:unlock`, `leave_balance:export` |
| Holiday | `holiday:read`, `holiday:manage` |

### Payroll / Salary / Payment

| Area | Permissions |
| ---- | ----------- |
| Salary Structure | `salary_structure:read`, `salary_structure:manage` |
| Salary Sheet | `salary_sheet:read`, `salary_sheet:process`, `salary_sheet:approve`, `salary_sheet:lock`, `salary_sheet:unlock` |
| Salary Statement | `salary_statement:read`, `salary_statement:process`, `salary_statement:approve`, `salary_statement:lock`, `salary_statement:unlock` |
| Salary Payment Distribution | `salary_payment_distribution:read`, `salary_payment_distribution:process`, `salary_payment_distribution:approve`, `salary_payment_distribution:lock`, `salary_payment_distribution:unlock`, `salary_payment_distribution:export` |
| Payroll | `payroll:read`, `payroll:update`, `payroll:process`, `payroll:approve`, `payroll:pay`, `payroll:lock`, `payroll:unlock`, `payroll:batch_approve`, `payroll:batch_lock`, `payroll:audit_read` |
| Payroll Report | `payroll_report:read`, `payroll_report:export` |
| Payslip | `payslip:read:any`, `payslip:read:own` |

### OT / Time Bill / Bonus

| Area | Permissions |
| ---- | ----------- |
| Time Bill | `time_bill:read`, `time_bill:process`, `time_bill:approve`, `time_bill:lock`, `time_bill:unlock`, `time_bill:export` |
| OT Statement | `ot_statement:read`, `ot_statement:process`, `ot_statement:approve`, `ot_statement:lock`, `ot_statement:unlock`, `ot_statement:export` |
| OT Payment Distribution | `ot_payment_distribution:read`, `ot_payment_distribution:process`, `ot_payment_distribution:approve`, `ot_payment_distribution:lock`, `ot_payment_distribution:unlock`, `ot_payment_distribution:export` |
| Bonus Sheet | `bonus_sheet:read`, `bonus_sheet:process`, `bonus_sheet:approve`, `bonus_sheet:lock`, `bonus_sheet:unlock` |
| Bonus Statement | `bonus_statement:read`, `bonus_statement:process`, `bonus_statement:approve`, `bonus_statement:lock`, `bonus_statement:unlock` |
| Bonus Payment Distribution | `bonus_payment_distribution:read`, `bonus_payment_distribution:process`, `bonus_payment_distribution:approve`, `bonus_payment_distribution:lock`, `bonus_payment_distribution:unlock`, `bonus_payment_distribution:export` |

### Reporting / System / Audit

| Area | Permissions |
| ---- | ----------- |
| Bank Sheet | `bank_sheet:read`, `bank_sheet:manage`, `bank_sheet:export` |
| Report Center | `report_center:read`, `report_center:config_manage` |
| Report Layout Standard | `report_layout_standard:read` |
| Month-End Process Control | `month_end_process_control:read` |
| RBAC Audit | `rbac_audit:read` |
| Audit Log | `audit_log:read` |

---

## 6. Role Summary

### Super Admin

- Receives all permissions.
- Can access and manage everything.

### Admin

- Receives all permissions.
- Can access and manage all operational modules.

### HR

Typical areas:

- master data
- employee management
- attendance
- leave
- movement
- salary structure
- salary/payroll processing visibility
- reports and exports where needed

HR should not automatically receive final financial payment authority unless explicitly assigned.

### Accounts

Typical areas:

- payroll processing
- payroll approval/payment/lock workflows
- salary statement
- salary payment distribution
- bank sheet
- bonus/OT/time bill financial workflows
- salary structure management where current business flow requires it

Part-49.2 ensured accounts retains payroll/salary-structure access that older role-based routes already allowed.

### Manager

Typical areas:

- read/review visibility
- approval/lock permissions where explicitly assigned
- salary structure read visibility preserved from earlier route behavior

### Employee

Typical areas:

- basic master read visibility where safe
- own payslip
- future own attendance/leave self-service APIs

Employee should not access payroll admin, salary structure admin, or cross-employee records.

---

## 7. Part-49.2 Route Enforcement Result

Part-49.2 removed direct role-based route enforcement from the remaining business module routes found during inspection:

```txt
server/src/modules/payroll/payroll.route.ts
server/src/modules/salaryStructure/salaryStructure.route.ts
```

After the pass:

```txt
No USER_ROLE based route enforcement remains in module route files.
```

Auth routes remain special because login/register/refresh/logout are public authentication workflows.

---

## 8. Future RBAC Improvements

Future improvements may include:

1. Database-managed custom roles.
2. Permission groups/templates.
3. Temporary delegated permission.
4. Approval delegation.
5. Branch/company scoped permission.
6. Department scoped manager access.
7. Employee self-service guards for own data only.
8. Full route-permission catalog generation.
