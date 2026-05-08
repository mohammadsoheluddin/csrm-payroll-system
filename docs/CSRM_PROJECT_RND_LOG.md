# CSRM Payroll System — R&D and Engineering Log

This document records the R&D, learning, architecture decisions, and implementation track of the CSRM Payroll System project up to the current stage.

---

## 1. Project Purpose

The CSRM Payroll System is being built to automate:

```txt
HR
Employee management
Attendance
Leave
Salary structure
Payroll
Payslip
Payroll reports
Bank payment sheet
OT / Time bill
Festival bonus
TA/DA
Audit log
RBAC
```

The system is based on real CSRM/TSL payroll practices, old running payroll software screenshots, Excel files, PDF files, salary sheet formats, time bill formats, and bank sheet formats.

---

## 2. Technology Track Chosen

Current stack:

```txt
Node.js
Express.js
TypeScript
MongoDB
Mongoose
Zod
JWT
Postman
PDFKit
ExcelJS
```

Reason:

```txt
1. Flexible backend development
2. Fast module-wise implementation
3. Good for API-based payroll software
4. MongoDB allows evolving schemas during R&D
5. TypeScript improves safety
6. Postman helps role-wise API testing
7. PDF/Excel support is needed for payroll reports
```

---

## 3. Backend Foundation

The project was structured with:

```txt
server/src/modules
server/src/routes
server/src/middlewares
server/src/utils
server/src/errors
server/src/app/config
```

Core utilities added:

```txt
AppError
catchAsync
sendResponse
globalErrorHandler
validateRequest
auth middleware
requirePermission middleware
```

This created a consistent enterprise-style backend pattern.

---

## 4. Auth and User R&D

Initial important modules:

```txt
Auth Module
User Module
```

Main concepts:

```txt
login
JWT token
role-based user
password hashing
protected routes
current user context
```

Roles used:

```txt
super_admin
admin
hr
accounts
manager
employee
```

---

## 5. RBAC R&D

A permission matrix was introduced.

Permission pattern:

```txt
module:read
module:manage
module:approve
module:lock
module:export
module:pay
```

Example permissions:

```txt
employee:read
employee:manage
payroll:read
payroll:process
payroll:approve
payroll:lock
payroll_report:export
```

Purpose:

- Avoid hard-coded role checks.
- Move toward permission-based authorization.
- Support enterprise-level access control.

---

## 6. Audit Log R&D

Audit log was added because payroll is financial and compliance-sensitive.

Audit log should track:

```txt
who did the action
what module was affected
what action was performed
previous data
new data
IP/device/request info
timestamp
```

Important actions:

```txt
create
update
soft_delete
approve
reject
lock
unlock
pay
export
permission_denied
status_change
```

---

## 7. Organization Hierarchy R&D

A major decision was made around company structure.

Current hierarchy:

```txt
Company / Concern
→ Major Department / Payroll Reporting Group
→ Department
→ Designation
→ Employee
```

Important old-to-new mapping:

```txt
Old Salary Sheet Department
= New Major Department / Payroll Reporting Group

Old Salary Sheet Sub-Department
= New Department
```

Section/Sub-section is postponed for now.

Reason:

```txt
The old payroll format can be represented cleanly with Major Department and Department.
Adding Section too early may overcomplicate the current system.
```

---

## 8. Company / Concern Module

Company module was added to support:

```txt
CSRM
TSL
sister concerns
future multi-company filtering
```

This gives the payroll system a company-level foundation.

---

## 9. Major Department Module

Major Department represents payroll reporting groups.

Examples:

```txt
Office
Accounts & Finance
Sales & Marketing
Procurement
Scrap Yard
SMS
ARRM
4B Ship
CSRM Green Bricks
Chakda Dredging
CSRM Real Estate
```

Some of these may be real sister concerns, but for payroll reporting they can be treated as Major Department / Payroll Reporting Group under CSRM central processing.

---

## 10. Department Module Refactor

Department module was refactored to connect with:

```txt
company
majorDepartment
```

This ensures that a Department belongs to a specific Company and Major Department.

This prevents wrong reporting structure.

---

## 11. Designation Module

Designation module was added after Department refactor.

Purpose:

```txt
standardize employee designation
avoid free-text designation
support employee filtering/reporting
support salary sheet and bank sheet output
```

Examples:

```txt
Manager
Executive
Assistant Manager
Officer
Office Boy
Driver
Security Guard
Electrician
Helper
PLC Operator
Mold Operator
Store Keeper
Sales Executive
```

---

## 12. Employee Office Info Refactor

Employee module was refactored to align with the new hierarchy.

Employee now supports:

```txt
employeeId
officeId
cardNo
company
majorDepartment
department
designation
branch
joiningDate
confirmationDate
serviceType
payType
dutyHourPerDay
leaveDay
employmentStatus
```

Important policy:

```txt
employeeId is permanent
employeeId must never be reused
employeeId should not be updateable after creation
```

Reason:

```txt
Employee ID connects payroll, attendance, leave, bank payment, TA/DA, festival bonus, audit log, and historical records.
Reusing employee ID can create serious reporting and legal confusion.
```

---

## 13. Attendance Module R&D

Attendance module is part of payroll calculation foundation.

Future direction:

```txt
manual attendance
biometric/punch device integration
attendance summary
absent calculation
late/early rules
manual correction with audit log
```

Attendance will feed:

```txt
salary deduction
OT calculation
attendance summary report
absent report
```

---

## 14. Leave Module R&D

Leave module includes:

```txt
leave request
leave validation
overlap prevention
auto totalDays
casual/sick leave limit
management approved leave
replacement leave concept
```

Future reports:

```txt
leave balance
leave history
replacement leave
department-wise leave summary
```

---

## 15. Holiday Module R&D

Holiday module supports payroll and leave calculation.

Future direction:

```txt
holiday calendar
replacement leave
holiday duty
attendance exception
```

---

## 16. Salary Structure R&D

Salary Structure is currently basic.

Future refactor should support:

```txt
gross salary
basic
house rent
medical
conveyance
tiffin
OT calculation setting
tax
bank pay amount
effective date
shift
```

Important rule:

```txt
Salary should not permanently depend on employee.basicSalary.
Salary should come from active Salary Structure.
```

---

## 17. Payroll Module R&D

Payroll module currently exists in basic form.

Future calculation should include:

```txt
gross salary
absence deduction
net salary
OT
tiffin
leave impact
cash/bank split
approval
lock
payment status
```

Important formulas from reference:

```txt
Deducted Amount = ROUND(Gross Salary / 30 * Absence, 0)
Days = 30 - Absence
Net Salary = Gross Salary - Deducted Amount
OT Per Hour = Gross Salary / 30 / Duty Hour
OT Amount = Total OT Hour * OT Per Hour
Tiffin Amount = Tiffin * Duty Day / OT Day
Total Amount = OT Amount + Tiffin Amount
```

---

## 18. Payroll Report R&D

Reports already started:

```txt
Payslip JSON
Monthly Payroll Report JSON
Payslip PDF
Payroll Report CSV/Excel
```

Future reports:

```txt
salary sheet
department-wise salary summary
time bill detail
time bill summary
tiffin bill summary
bank payment statement
cash payment statement
salary disbursement statement
approval/lock status report
```

---

## 19. Bank Sheet R&D

A real bank sheet PDF reference was provided.

Required output:

```txt
Bank forwarding letter
Account-wise bank payment sheet
```

Common bank sheet columns:

```txt
SL No
Name of A/C
A/C Bank Branch Code
A/C No
Process Bank Branch No
Branch
Amount in Tk
```

Future bank sheet should support:

```txt
salary
OT/time bill
festival bonus
TA/DA
allowance
other employee payment
```

---

## 20. Employee Bank & Payment Info R&D

This is the current implementation stage.

Purpose:

```txt
store employee bank/cash/mobile payment information
connect payroll payment to bank sheet
avoid manual bank sheet creation
```

Suggested fields:

```txt
employee
company
accountName
bankName
bankBranchName
bankBranchCode
accountNo
processBankBranchNo
routingNo
paymentMode
mobileBankingProvider
mobileBankingNo
cashPayReason
effectiveFrom
effectiveTo
isPrimary
status
isDeleted
```

Business rules:

```txt
active employee required
employee must belong to selected company
bank payment requires bank/account details
cash payment requires reason
mobile banking requires provider and number
one active primary payment info per employee
old info should be preserved as history
```

---

## 21. Company Bank Account R&D

Next after Employee Bank Info.

Purpose:

```txt
store company debit bank account
use in bank forwarding letter
support salary/time bill/bonus/TA-DA payment
```

Suggested fields:

```txt
company
bankName
bankBranchName
accountName
accountNo
accountType
branchCode
routingNo
swiftCode
isDefaultSalaryAccount
isDefaultTimeBillAccount
isDefaultBonusAccount
status
isDeleted
```

---

## 22. TA/DA and Sales Visit R&D

Future module for Sales & Marketing officers.

Business need:

```txt
Sales officers submit daily visit details
They enter daily vehicle/fuel/transport expense
They enter hotel/courier/other expenses
Fixed food allowance is added per visit day
Monthly TA/DA bill is generated
Admin/accounts/director approval may be required
Approved amount goes to bank sheet
```

Daily visit fields:

```txt
visitDate
marketArea
dealer/customer/party
purpose
fromLocation
toLocation
transportType
remarks
```

Expense categories:

```txt
transport
fuel
hotel
courier
toll
parking
mobile
others
```

---

## 23. Festival Bonus R&D

Festival bonus should be separate from monthly payroll.

Possible bonus types:

```txt
Eid-ul-Fitr
Eid-ul-Adha
Special bonus
Other festival bonus
```

Calculation methods:

```txt
percentage of gross
percentage of basic
fixed amount
manual amount
```

Flow:

```txt
policy
bonus run
employee-wise generated item
review
approval
lock
bank sheet
payment
```

---

## 24. Documentation R&D

A continuity documentation pack was added.

Files:

```txt
docs/PROJECT_CONTINUITY.md
docs/NEXT_CHAT_PROMPT.md
```

Purpose:

```txt
project should continue even if chat history is deleted
new chat should read repo docs and continue safely
business decisions should not remain only in memory
```

---

## 25. Current Position

Current stage:

```txt
Part-30.7: Employee Bank & Payment Info Module
```

Immediate roadmap:

```txt
Part-30.7  Employee Bank & Payment Info Module
Part-30.8  Company Bank Account Module
Part-30.9  Bank Sheet Engine
Part-30.10 Bank Sheet PDF + Excel Export
Part-31    Salary Structure Refactor
Part-32    Payroll Calculation Improvement
Part-33    Salary Sheet / Time Bill Report Enhancement
Part-34    TA/DA & Sales Visit Expense Module
Part-35    Festival Bonus Module
Part-36    Final Payroll Reports + Approval/Lock Polish
Part-37    Dashboard/API Summary Endpoints
```

---

## 26. Main Learning From This Project

Important engineering lessons:

```txt
1. Do not start from coding only.
2. Business flow must be understood first.
3. Organization hierarchy is critical.
4. Employee ID policy must be decided early.
5. Payroll systems need audit logs.
6. Payment systems need approval and lock.
7. Reports should be planned from the beginning.
8. Bank sheet generation requires clean employee bank data.
9. Real company Excel/PDF formats are valuable requirements.
10. Documentation is necessary to protect project continuity.
```

---

## 27. Reusable Learning for Future Projects

For any future enterprise project:

```txt
1. First create business requirement docs.
2. Then design module roadmap.
3. Then design user roles and permissions.
4. Then create backend foundation.
5. Then create master data modules.
6. Then create transaction modules.
7. Then create approval/lock flow.
8. Then create reports and exports.
9. Then create dashboard.
10. Keep documentation updated.
```

---

## 28. Golden Rule

This project should be treated as both:

```txt
1. A real payroll software project
2. A reusable engineering learning base
```

The repo should contain enough documentation so that the project can continue without depending only on old chat history.
