# CSRM Payroll System

# Master Project Continuity & Architecture Document

Project Owner:
Sohel
(HR/Admin Professional)

Project Type:
Enterprise HRIS + Payroll + Industrial Payment Processing Platform

Main Context:
This is NOT a generic tutorial payroll project.
This system is being designed based on REAL industrial payroll workflow used in:

- CSRM
- TSL
- steel mills
- manufacturing industries
- worker/staff mixed payroll environments in Bangladesh.

The system architecture, business logic, Excel formats, PDF statements, OT sheets, bank sheets, leave rules, and reporting structures are inspired by REAL company workflow.

---

# CORE PURPOSE OF THE SYSTEM

Main goal:

Manage:

- employee salary
- worker wage
- overtime
- tiffin bill
- festival bonus
- bank payment
- cash payment
- payroll statements
- attendance
- leave
- salary deduction
- loan/advance deduction
- payroll audit
- approval workflow
- HR reporting

in a scalable enterprise architecture.

---

# IMPORTANT BUSINESS REALIZATION

The system is NOT a single merged payroll engine.

Real architecture:

1. Salary Sheet
2. Time Bill / OT Sheet
3. Salary Statement
4. Cash Statement
5. Bank Sheet
6. Bonus Sheet
7. Leave Summary
8. Attendance Summary
9. Increment / Salary Revision
10. Payment Distribution

These are connected but separate processing systems.

---

# REAL MONTH-END WORKFLOW

At month end:

## Step-1

Attendance finalization

Includes:

- present
- absent
- leave
- holiday
- late
- replacement leave
- unpaid leave

---

## Step-2

Salary Sheet generation

Contains:

- employee list
- attendance
- leave
- absence
- holiday
- gross salary
- deducted amount
- net salary

Formula:

Deducted Amount =
ROUND(Gross Salary / 30 \* Absence, 0)

Days =
30 - Absence

Net Salary =
Gross Salary - Deducted Amount

---

## Step-3

Time Bill / OT Sheet generation

Separate from salary sheet.

Contains:

- OT hour
- OT rate
- OT amount
- tiffin
- duty day
- total amount

Formula:

OT Per Hour =
Gross Salary / 30 / Duty Hour

OT Amount =
OT Hour \* OT Rate

Tiffin Amount =
Tiffin \* Duty Day

Total Amount =
OT Amount + Tiffin Amount

---

## Step-4

Salary Statement generation

Salary sheet distribution logic.

Here:

- suspense deduction
- AIT
- other deduction
- bank amount
- cash amount
- net payable

are distributed.

Purpose:
split salary into:

- bank payment
- cash payment

---

## Step-5

Cash Statement generation

Cashier-specific printable statement.

Bank columns hidden.

Cashier only sees:

- employee
- total payable
- cash payable

---

## Step-6

Bank Sheet generation

Generated from salary statement.

Purpose:
bank upload / branch processing.

Common columns:

- SL No
- Name of A/C
- Bank Branch Code
- Account No
- Process Bank Branch No
- Branch
- Amount

---

# ORGANIZATION STRUCTURE

Current hierarchy:

Company / Concern
→ Major Department / Payroll Reporting Group
→ Department
→ Designation
→ Employee

Old payroll mapping:

# Old Department

New Major Department

# Old Sub Department

New Department

Section/Sub-section:
postponed for now.

---

# MAJOR DEPARTMENT EXAMPLES

- Office
- Accounts & Finance
- Sales & Marketing
- Procurement
- Scrap Yard
- SMS
- ARRM
- 4B Ship
- CSRM Green Bricks
- Chakda Dredging
- CSRM Real Estate

---

# CURRENT STACK

Backend:

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

Validation:

- Zod

Authentication:

- JWT

Exports:

- PDFKit
- ExcelJS

Testing:

- Postman

Frontend (planned):

- React
- Vite
- TypeScript
- Tailwind

---

# BACKEND ARCHITECTURE

Module structure:

server/src/modules/<moduleName>/

Each module:

- interface
- model
- validation
- service
- controller
- route

Shared patterns:

- AppError
- catchAsync
- sendResponse
- validateRequest
- auth middleware
- RBAC middleware
- audit log utilities

---

# COMPLETED / MOSTLY COMPLETED MODULES

## Core

- Auth
- User
- RBAC
- Audit Log

## Organization

- Company
- Major Department
- Department
- Designation
- Branch

## HR

- Employee
- Attendance
- Leave
- Holiday
- Employee Movement

## Payroll

- Salary Structure
- Payroll
- Payroll Approval
- Payroll Lock
- Payroll Reports
- Payslip JSON/PDF
- CSV Export
- Excel Export

## Banking

- Employee Bank Info
- Company Bank Account (planned)
- Bank Sheet Engine (planned)

---

# IMPORTANT HR RULES

## Employee ID

- permanent
- never reusable
- never editable

---

## Leave Rules

Supported:

- casual
- sick
- earned
- paid
- unpaid
- maternity
- paternity
- official
- replacement
- others

Important:
replacement leave:

- must reference worked holiday
- cannot be applied before holiday
- must validate attendance on holiday

---

# PAYROLL ARCHITECTURE DECISION

IMPORTANT:

Salary Sheet and Time Bill remain separate systems.

Do NOT tightly merge OT into salary core logic.

Reason:
real business workflow uses:

- separate OT processing
- separate OT statement
- separate OT bank distribution

---

# REPORTING REQUIREMENTS

System must support:

## Attendance Summary

- employee-wise
- department-wise
- company-wise
- date-range based
- monthly

## Leave Summary

- employee
- department
- company

## Salary Sheet Overview

- department
- company
- month-wise

## OT Summary

- detail
- summary
- department
- company

## Bank Payment Reports

## Cash Payment Reports

## Increment History

## Employee Joining Reports

## Mobile Bill Reports

---

# APPROVAL PHILOSOPHY

High management usually does NOT manually process leave/payroll directly.

Workflow:

- management concern exists
- HR/Admin executes process
- approval authority delegated operationally

---

# FUTURE MODULES

## High Priority

- Attendance Summary Engine
- Salary Sheet Engine
- Time Bill Engine
- Statement Engine
- Bank Sheet Engine
- Festival Bonus Engine
- Salary Hold/Release
- TA/DA
- Increment System

## Medium Priority

- Dashboard Analytics
- HR Analytics
- Employee Service Book
- Mobile Bill Engine

## Long-Term

- ERP Integration
- Finance Integration
- Store/Warehouse
- Production
- Transport

---

# IMPORTANT ENGINE SEPARATION

Future architecture should separate:

| Engine              | Responsibility         |
| ------------------- | ---------------------- |
| Attendance Engine   | attendance calculation |
| Leave Engine        | leave logic            |
| Salary Sheet Engine | salary processing      |
| Time Bill Engine    | OT processing          |
| Statement Engine    | accounting split       |
| Bank Sheet Engine   | bank export            |
| Bonus Engine        | bonus processing       |

---

# CURRENT DEVELOPMENT STYLE

IMPORTANT:

- Always give full updated files
- Mention exact paths
- Preserve existing APIs
- Avoid random architectural breakage
- Maintain TypeScript safety
- Maintain modular structure
- Give Postman tests
- Give Git commands
- Use Bangla + English mixed explanation

---

# CURRENT PROJECT STAGE

Current maturity:

Enterprise HRIS + Payroll + Industrial Payment Platform

NOT tutorial-level project anymore.

---

# IMPORTANT DEVELOPMENT STRATEGY

Before implementing new modules:

1. understand real business workflow
2. analyze Excel/PDF samples
3. preserve accounting flow
4. preserve payroll audit integrity
5. preserve statement logic
6. preserve payment distribution architecture

Architecture stability is now more important than rapid feature expansion.

---

# CURRENT MOST IMPORTANT PRIORITY

Stabilize architecture before aggressive module expansion.

Especially:

- salary sheet engine
- OT/time bill engine
- statement engine
- bank sheet engine

must be designed carefully.

---

# POSTMAN TESTING RULE

Postman testing comes FIRST before frontend.

Reason:
backend business logic correctness is critical for payroll systems.

---

# LONG-TERM VISION

Target:

Complete Enterprise Ecosystem:

- HRIS
- Payroll
- Banking
- Attendance
- Leave
- Bonus
- TA/DA
- Reports
- Analytics
- ERP Integration

# CSRM Payroll System

# Master Project Continuity & Architecture Document

Project Owner:
Sohel
(HR/Admin Professional)

Project Type:
Enterprise HRIS + Payroll + Industrial Payment Processing Platform

Main Context:
This is NOT a generic tutorial payroll project.
This system is being designed based on REAL industrial payroll workflow used in:

- CSRM
- TSL
- steel mills
- manufacturing industries
- worker/staff mixed payroll environments in Bangladesh.

The system architecture, business logic, Excel formats, PDF statements, OT sheets, bank sheets, leave rules, and reporting structures are inspired by REAL company workflow.

---

# CORE PURPOSE OF THE SYSTEM

Main goal:

Manage:

- employee salary
- worker wage
- overtime
- tiffin bill
- festival bonus
- bank payment
- cash payment
- payroll statements
- attendance
- leave
- salary deduction
- loan/advance deduction
- payroll audit
- approval workflow
- HR reporting

in a scalable enterprise architecture.

---

# IMPORTANT BUSINESS REALIZATION

The system is NOT a single merged payroll engine.

Real architecture:

1. Salary Sheet
2. Time Bill / OT Sheet
3. Salary Statement
4. Cash Statement
5. Bank Sheet
6. Bonus Sheet
7. Leave Summary
8. Attendance Summary
9. Increment / Salary Revision
10. Payment Distribution

These are connected but separate processing systems.

---

# CURRENT STACK

Backend:

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

Validation:

- Zod

Authentication:

- JWT

Exports:

- PDFKit
- ExcelJS

Frontend (planned):

- React
- Vite
- TypeScript
- Tailwind

---

# CURRENT BACKEND STRUCTURE

server/src/modules/<moduleName>/

Each module:

- interface
- model
- validation
- service
- controller
- route

Shared utilities:

- AppError
- catchAsync
- sendResponse
- validateRequest
- auth middleware
- audit log utilities

---

# COMPLETED / MOSTLY COMPLETED MODULES

## Core

- Auth
- User
- RBAC
- Audit Log

## Organization

- Company
- Major Department
- Department
- Designation
- Branch

## HR

- Employee
- Attendance
- Leave
- Holiday
- Employee Movement

## Payroll

- Salary Structure
- Payroll
- Payroll Approval
- Payroll Lock
- Payroll Reports
- Payslip JSON/PDF
- CSV Export
- Excel Export
- Salary History Engine

## Banking

- Employee Bank Info
- Company Bank Account (planned)
- Bank Sheet Engine (planned)

---

# IMPORTANT PAYROLL ARCHITECTURE RULE

Salary Sheet and Time Bill remain separate systems.

DO NOT tightly merge OT into core salary calculation.

Reason:
real industrial workflow uses:

- separate OT processing
- separate OT statement
- separate OT bank distribution

---

# CURRENT DEVELOPMENT STRATEGY

IMPORTANT:

- Always give full updated files
- Mention exact file paths
- Preserve APIs
- Avoid unnecessary architectural breakage
- Maintain TypeScript safety
- Maintain modular structure
- Give Postman tests
- Give Git commands
- Use Bangla + English mixed explanation

---

# CURRENT PROJECT STAGE

Enterprise HRIS + Payroll + Industrial Payment Platform

NOT tutorial-level project anymore.
