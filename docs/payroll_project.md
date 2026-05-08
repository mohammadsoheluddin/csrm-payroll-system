# CSRM Payroll System

## Repository Architecture Audit — Pass-1

## Part-30.9 Preparation

Project: CSRM Payroll System
Owner: Sohel
Stage: Early Enterprise HR/Payroll Platform
Audit Phase: Stabilization + Banking Engine Preparation
Date: 2026-05-08

---

# Repo Inspection Status

Repository ZIP successfully inspected.

Confirmed:

- Backend modular architecture exists
- Module separation is consistent
- Route-level modular structure exists
- Validation layer exists
- Audit log foundation exists
- Payroll + PayrollReport modules exist
- EmployeeBankInfo module exists
- CompanyBankAccount architecture direction confirmed

The project has clearly moved beyond a tutorial backend.

---

# Current Backend Structure (Observed)

```txt
server/src/modules/

attendance/
auditLog/
auth/
branch/
company/
department/
designation/
employee/
employeeBankInfo/
holiday/
leave/
majorDepartment/
payroll/
payrollReport/
salaryStructure/
user/
```

Observed module pattern consistency:

```txt
module.controller.ts
module.interface.ts
module.model.ts
module.route.ts
module.service.ts
module.validation.ts
```

This is GOOD.

Very scalable for current stage.

---

# Initial Architecture Evaluation

## Overall Direction

Current architecture direction is GOOD.

You are already implementing:

- modular backend separation
- layered services
- RBAC
- validation middleware
- reusable utilities
- payroll reporting
- PDF/Excel direction
- audit foundations

This is already approaching:

# Enterprise Internal Business Software Architecture

not beginner MERN CRUD anymore.

---

# Repository Audit — Pass-1 Findings

# 1. Module Architecture

## Status: GOOD

Current module pattern is clean enough.

Recommended improvement later:

```txt
module.utils.ts
module.constants.ts
module.helpers.ts
```

for larger modules.

Especially:

- payroll
- payrollReport
- bankSheet
- attendance

---

# 2. Naming Consistency Audit

## Status: MOSTLY GOOD

Observed:

- controller/service/model/validation naming consistent
- route naming consistent
- module folder naming consistent

Recommended future enforcement:

### Always use:

```txt
middlewares/
utils/
errors/
config/
interfaces/
constants/
```

Avoid future mixed patterns like:

- middleware vs middlewares
- helper vs utils
- dto vs validation

---

# 3. RBAC Architecture

## Status: GOOD FOUNDATION

Observed:

- user.constant.ts exists
- route-level auth exists
- permission-driven architecture direction exists

This is VERY important.

Current project is correctly avoiding:

- hardcoded admin-only systems
- role spaghetti

Recommended future improvement:

## Introduce Permission Registry Grouping

Example:

```ts
PAYROLL_PERMISSIONS;
BANKING_PERMISSIONS;
ATTENDANCE_PERMISSIONS;
```

instead of very long flat permission list later.

---

# 4. Validation Architecture

## Status: GOOD

Observed:

- Zod validation pattern exists
- validation middleware exists
- modular validation separation exists

Recommended next stabilization:

## Create shared reusable validators

Example:

```ts
objectIdSchema;
trimmedStringSchema;
nullableStringSchema;
phoneSchema;
employeeIdSchema;
```

Reason:
Validation duplication will grow rapidly.

---

# 5. Payroll Architecture

## Status: EARLY ENTERPRISE STAGE

Observed:

- payroll module exists
- payrollReport exists
- PDF/Excel direction exists

VERY IMPORTANT observation:

You are approaching the stage where:

# Snapshot-based payroll storage becomes mandatory.

Meaning:
Historical payroll must NEVER mutate.

Future recommendation:

```txt
Payroll Calculation
    ↓
Approval
    ↓
Lock
    ↓
Snapshot Freeze
    ↓
Bank Sheet
    ↓
Payslip
    ↓
Reports
```

---

# 6. EmployeeBankInfo Architecture

## Status: VERY GOOD DIRECTION

Your architecture separation is correct.

## Layer-1

EmployeeBankInfo
= Employee payment destination

## Layer-2

CompanyBankAccount
= Company payment source

This is enterprise-grade thinking.

Most tutorial payroll systems never separate this properly.

---

# 7. Audit Log Readiness

## Status: GOOD FOUNDATION

Observed:

- auditLog module exists
- utilities exist

Recommended future expansion:

Track:

- IP
- device
- browser
- requestId
- payroll approval chain
- bank sheet generation event
- salary lock event
- export event

Especially important for:

- HR
- Accounts
- Compliance
- Internal audit

---

# 8. CommonJS / ESM Safety

## Status: NEEDS CAREFUL CONTROL

Because project already uses:

- TypeScript
- PDFKit
- ExcelJS
- Express
- ts-node-dev

You must keep consistency.

Recommended:

## Avoid mixed import patterns.

Keep:

- CommonJS-safe TypeScript configuration
- stable import style
- no random ESM-only package introduction

This is VERY important.

---

# 9. Future Technical Debt Risks

## Current Risk Level: MEDIUM

Main future risks:

### A. Validation duplication

### B. Duplicate business logic across services

### C. Payroll recalculation mutation risk

### D. Excel/PDF generation scattered everywhere

### E. Large service files

### F. Permission sprawl

### G. Report generation inconsistency

---

# Immediate Stabilization Recommendations

# Recommendation-1

Create:

```txt
server/src/shared/
```

Later store:

```txt
validators/
constants/
helpers/
interfaces/
permissions/
```

DO NOT do huge refactor now.

Gradual migration only.

---

# Recommendation-2

Create architecture docs:

```txt
PROJECT_CONTINUITY.md
MODULE_STATUS_TRACKER.md
ARCHITECTURE_AUDIT.md
MODULE_DEPENDENCY_MAP.md
BANKING_ENGINE_PLAN.md
```

VERY IMPORTANT for long-term AI-assisted development continuity.

---

# Recommendation-3

Before frontend scaling:

Stabilize:

- response shape
- pagination shape
- filtering pattern
- export pattern
- audit pattern
- permission naming

This will save massive pain later.

---

# Part-30.9 — Bank Sheet Engine Plan

# Objective

Generate:

- Salary Bank Sheet
- OT Bank Sheet
- Bonus Bank Sheet
- TA/DA Sheet
- Allowance Sheet

Outputs:

- JSON
- Excel
- PDF
- printable forwarding copy

---

# Recommended Module

```txt
server/src/modules/bankSheet/

bankSheet.interface.ts
bankSheet.validation.ts
bankSheet.service.ts
bankSheet.controller.ts
bankSheet.route.ts

bankSheet.utils.ts
bankSheet.constants.ts
bankSheet.excel.ts
bankSheet.pdf.ts
```

---

# Recommended Core Types

```ts
salary;
ot;
bonus;
tada;
allowance;
held_salary;
final_settlement;
```

---

# Recommended First Implementation Scope

DO NOT start with PDF first.

Recommended order:

## Phase-1

JSON Preview API

## Phase-2

Excel Export

## Phase-3

Bank-wise grouping

## Phase-4

Forwarding Letter PDF

## Phase-5

Official print layout

---

# Recommended Bank Sheet Flow

```txt
Payroll Approved
    ↓
Payroll Locked
    ↓
Generate Bank Sheet Snapshot
    ↓
Export Excel
    ↓
Forwarding Letter
    ↓
Bank Submission
```

---

# Important Enterprise Rule

Bank Sheet should NEVER generate from mutable live employee salary.

Always generate from:

# Locked Payroll Snapshot

This will become CRITICAL later.

---

# Recommended Future Reports

## Banking

- Bank-wise payment summary
- Branch-wise payment summary
- Concern-wise payment summary
- Failed payment tracking
- Held salary tracking

## Payroll

- Department salary summary
- OT summary
- Attendance deduction summary
- Bonus summary

## HR

- Leave summary
- Employee joining summary
- Promotion history
- Transfer history

---

# Recommended Immediate Execution Order

## Step-1

Repository Stabilization Pass-1

## Step-2

Shared utility extraction

## Step-3

BankSheet module foundation

## Step-4

Salary JSON preview engine

## Step-5

Excel export engine

## Step-6

Forwarding PDF engine

---

# Final Technical Evaluation

Current project maturity level:

```txt
Beginner Tutorial Stage        → COMPLETED
Intermediate CRUD Stage       → COMPLETED
Business Workflow Stage       → COMPLETED
Early Enterprise Backend      → CURRENT STAGE
Scalable ERP Foundation       → FUTURE DIRECTION
```

This is now a real operational architecture project.

Especially because:

- real HR workflow exists
- real payroll formulas exist
- real bank processing exists
- real reporting complexity exists
- real approval flow exists
- real business rules exist

That gives your project much deeper practical engineering value than generic MERN CRUD systems.
