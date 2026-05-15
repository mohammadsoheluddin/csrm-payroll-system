# CSRM Payroll System — Enterprise Roadmap After Module Discovery

Last Updated: 2026-05-15  
Current Decision Point: Stop open-ended module discovery and return to disciplined implementation.

---

## 1. Purpose of This Document

This document locks the discussion where the project explored a very large number of possible modules/features across payroll, HR, admin, factory operations, compliance, facilities, workforce management, enterprise HCM, analytics, AI, and corporate governance.

The purpose is not to build everything now. The purpose is to preserve the vision, classify the ideas, and protect the current CSRM Payroll System from uncontrolled scope creep.

---

## 2. Final Decision

Open-ended discovery of new modules should stop for now.

The project already has enough ideas for many years of product growth. From this point, every future idea must be placed into one of these buckets before it is considered for development:

| Bucket | Meaning | Development Rule |
|---|---|---|
| A. Current Payroll MVP | Required to make the current payroll system reliable and usable | Can be prioritized now |
| B. Payroll Enterprise Upgrade | Improves payroll control, audit, reporting, safety, and scalability | Can be scheduled after MVP stability |
| C. HR/Admin Extension | Useful HR/Admin modules connected to employees but not core payroll | Separate parts after payroll core |
| D. Future Separate ERP/App | Belongs to Accounts, Store, Sales, Delivery, Transport, or Facilities software | Do not mix into payroll core |
| E. Research Archive Only | Global enterprise ideas, long-term inspiration, AI/governance/future HCM | Keep in docs, do not code now |

---

## 3. Core Principle

Vision can be large, but implementation must stay small, controlled, and serial.

Do not randomly add modules into the codebase just because the idea is useful. Each new module must have:

- clear business purpose
- exact relation with payroll/HR
- permission/RBAC design
- audit log requirement
- data ownership rule
- report/export requirement
- safe migration path
- frontend impact
- Postman/browser testing guide

---

## 4. Five-Layer Product Direction

### Layer 1 — Current Payroll Core Completion

These are the most important for a production-capable payroll system:

1. Employee Full Profile / Digital Service Book
2. Employee Document Management
3. Attendance Finalization / Monthly Lock
4. Leave Ledger + Opening Balance
5. Payroll Rule / Formula Versioning
6. Payroll Sandbox / Draft Run
7. Payroll Batch Processing
8. Payroll Eligibility Checker
9. Salary Deduction Explanation
10. Bank / Payment Verification

### Layer 2 — Payroll Safety & Audit

These features reduce payroll errors, fraud risk, and audit weakness:

1. Payroll Error Rule Engine
2. Payroll Compare / Month-to-Month Variance
3. Payroll Reversal / Correction
4. Calculation Traceability
5. Data Lineage
6. Audit Diff
7. Maker-Checker Control
8. Sensitive Field Masking
9. Salary Fraud Detection
10. Payment Reconciliation

### Layer 3 — HR Operations

These convert the payroll system into a practical HR operations system:

1. Probation / Confirmation
2. Increment / Salary Revision
3. Promotion / Transfer
4. Separation / Final Settlement
5. HR Letter Generator
6. Employee Timeline
7. Document Vault
8. Policy Acknowledgement
9. Employee Service Book
10. Employee Lifecycle Status

### Layer 4 — Admin / Factory / Workforce

These reflect CSRM/TSL-style factory and field workforce realities:

1. Shift / Roster
2. OT Approval
3. Biometric Integration
4. Factory Section Attendance
5. Daily Manpower Deployment
6. Gate Pass
7. Asset / SIM Assignment
8. Workforce Tracking Integration
9. Vehicle / Transport Request
10. Safety Incident

### Layer 5 — Future Enterprise Expansion

These should stay in future archive unless the business formally decides to create a broader HR/Admin/ERP platform:

1. LMS / Training
2. Recruitment
3. Performance Appraisal
4. OKR / Goal Management
5. AI HR Assistant
6. Workforce Planning
7. Facilities Management
8. Compliance
9. Legal Case Management
10. Enterprise Command Center

---

## 5. Top 50 Practical Roadmap for CSRM Payroll/HR

These 50 are the most realistic and valuable for the current CSRM Payroll/HR direction.

| No. | Module / Feature | Bucket | Priority |
|---:|---|---|---|
| 1 | Employee Full Profile / Digital Service Book | Current Payroll MVP | P1 |
| 2 | Employee Document Management | Current Payroll MVP | P1 |
| 3 | Employee Timeline / Activity Feed | HR/Admin Extension | P2 |
| 4 | Employee Lifecycle Status Engine | HR/Admin Extension | P2 |
| 5 | Employee Grouping / Payroll Group | Current Payroll MVP | P1 |
| 6 | Attendance Finalization / Monthly Lock | Current Payroll MVP | P1 |
| 7 | Attendance Source Priority Engine | Payroll Enterprise Upgrade | P2 |
| 8 | Manual Attendance Entry Reason | Payroll Enterprise Upgrade | P2 |
| 9 | Monthly Attendance Exception Report | Current Payroll MVP | P1 |
| 10 | Employee Attendance Calendar Snapshot | Payroll Enterprise Upgrade | P2 |
| 11 | Leave Ledger + Opening Balance | Current Payroll MVP | P1 |
| 12 | Holiday Replacement Leave Ledger | HR/Admin Extension | P3 |
| 13 | Attendance Regularization Request | Payroll Enterprise Upgrade | P2 |
| 14 | Late Attendance Penalty Rule Tracker | Current Payroll MVP | P1 |
| 15 | Absent Reason Classification | Current Payroll MVP | P1 |
| 16 | Shift / Roster / Duty Schedule | Payroll Enterprise Upgrade | P2 |
| 17 | Overtime Approval Workflow | Current Payroll MVP | P1 |
| 18 | Overtime Rate Rule | Current Payroll MVP | P1 |
| 19 | Tiffin / Meal Allowance Rule | Current Payroll MVP | P1 |
| 20 | Department-Wise OT Budget Control | Payroll Enterprise Upgrade | P3 |
| 21 | Payroll Rule / Formula Versioning | Current Payroll MVP | P1 |
| 22 | Payroll Calendar | Current Payroll MVP | P1 |
| 23 | Cutoff Rule Management | Current Payroll MVP | P1 |
| 24 | Payroll Eligibility Checker | Current Payroll MVP | P1 |
| 25 | New Joiner Payroll Proration | Current Payroll MVP | P1 |
| 26 | Separated Employee Payroll Proration | Current Payroll MVP | P1 |
| 27 | Payroll Sandbox / Draft Run | Current Payroll MVP | P1 |
| 28 | Payroll Batch Processing | Current Payroll MVP | P1 |
| 29 | Payroll Batch Merge / Consolidation | Payroll Enterprise Upgrade | P2 |
| 30 | Payroll Governance Dashboard | Payroll Enterprise Upgrade | P2 |
| 31 | Payroll Error Rule Engine | Payroll Enterprise Upgrade | P1 |
| 32 | Payroll Compare / Month-to-Month Variance | Payroll Enterprise Upgrade | P1 |
| 33 | Salary Variance Justification | Payroll Enterprise Upgrade | P2 |
| 34 | Payroll Reversal / Correction | Payroll Enterprise Upgrade | P2 |
| 35 | Calculation Traceability | Payroll Enterprise Upgrade | P1 |
| 36 | Bank Account Verification Workflow | Current Payroll MVP | P1 |
| 37 | Salary Fraud / Duplicate Payment Detection | Payroll Enterprise Upgrade | P2 |
| 38 | Payment Reconciliation | Payroll Enterprise Upgrade | P2 |
| 39 | Cash Payment Acknowledgement | Payroll Enterprise Upgrade | P3 |
| 40 | Bank Disbursement / Salary Payment Export | Current Payroll MVP | P1 |
| 41 | Loan / Advance / Bike Installment Deduction | HR/Admin Extension | P2 |
| 42 | Salary Hold / Release | Current Payroll MVP | P1 |
| 43 | Arrear Salary Management | Current Payroll MVP | P1 |
| 44 | Bonus / Festival Allowance | Payroll Enterprise Upgrade | P2 |
| 45 | Payroll Exception / Manual Adjustment | Current Payroll MVP | P1 |
| 46 | Legacy vs Native Payroll Reconciliation | Payroll Enterprise Upgrade | P2 |
| 47 | Legacy Salary Import Archive Enhancement | Payroll Enterprise Upgrade | P2 |
| 48 | Employee Movement & Effective Date Payroll Impact | Current Payroll MVP | P1 |
| 49 | HR Letter / Document Generator | HR/Admin Extension | P2 |
| 50 | Employee Digital Vault | HR/Admin Extension | P2 |

---

## 6. Recommended Next 20 Implementation Plan

This is the disciplined sequence after Part-F16.1.

| Part | Title | Main Goal |
|---|---|---|
| Part-B53 | Employee Full Profile / Digital Service Book Backend Foundation | Build central employee profile data API |
| Part-B54 | Employee Document Management Module | Upload/archive employee documents |
| Part-B55 | Employee Timeline / Service Book API | Store key employee events in one timeline |
| Part-B56 | Attendance Finalization + Monthly Lock Hardening | Make payroll-ready attendance formal |
| Part-B57 | Leave Ledger + Opening Balance | Make leave balances auditable |
| Part-B58 | Payroll Eligibility Checker + Payroll Safety Rules | Block unsafe payroll runs |
| Part-B59 | Payroll Sandbox / Draft Run | Preview payroll before final lock |
| Part-B60 | Payroll Batch Processing | Process salary/time bill/bonus by batch |
| Part-B61 | Payroll Compare / Variance Engine | Compare current vs previous payroll |
| Part-B62 | Calculation Traceability | Explain salary calculation line-by-line |
| Part-B63 | Bank Account Verification Workflow | Verify employee payment info before disbursement |
| Part-B64 | Payment Reconciliation Foundation | Compare payable vs actually paid |
| Part-B65 | Salary Hold / Release Module | Controlled hold/release workflow |
| Part-B66 | Arrear Salary Management | Controlled prior-month correction payments |
| Part-B67 | Loan / Advance / Installment Deduction | Salary-linked recovery ledger |
| Part-B68 | HR Letter / Document Generator Foundation | Template-based HR document generation |
| Part-B69 | Employee Digital Vault | Central employee document vault |
| Part-B70 | Legacy vs Native Payroll Reconciliation | Compare old imported Excel with native payroll |
| Part-B71 | Workforce Tracking Integration Foundation | GP/report/app-based tracking integration placeholder |
| Part-B72 | Payroll Governance Dashboard | Management view for payroll readiness and risks |

---

## 7. Immediate Next Part Lock

The next recommended backend part is:

```txt
Part-B53 — Employee Full Profile / Digital Service Book Backend Foundation
```

Reason:

Employee profile is the central base for future modules. Documents, timeline, salary history, attendance summary, leave ledger, payroll history, movement history, bank/payment info, and legacy salary archive links all need a central employee profile API.

---

## 8. Part-B53 Target Scope

Part-B53 should not rewrite the existing Employee module randomly. It should create a safe profile aggregation layer on top of existing modules.

Expected API direction:

```txt
GET /api/v1/employees/:id/profile
GET /api/v1/employees/:id/profile/summary
GET /api/v1/employees/:id/profile/payroll-history
GET /api/v1/employees/:id/profile/attendance-summary
GET /api/v1/employees/:id/profile/leave-summary
GET /api/v1/employees/:id/profile/movement-history
GET /api/v1/employees/:id/profile/legacy-salary-archive
```

Possible folder direction:

```txt
server/src/modules/employeeProfile/
```

Possible files:

```txt
employeeProfile.interface.ts
employeeProfile.service.ts
employeeProfile.controller.ts
employeeProfile.route.ts
employeeProfile.validation.ts
```

---

## 9. Data Separation Rules

1. Legacy imported salary data must remain archive/history only.
2. Legacy salary data must not update native payroll calculation.
3. Employee profile may show legacy salary history as reference only.
4. Payroll calculation must come from native payroll modules and approved rules.
5. Attendance finalization should be the payroll-ready attendance source.
6. Raw tracking, raw punch, and raw import data must not directly affect payroll without approval/finalization.

---

## 10. What Not To Do Now

Do not start these immediately:

- AI HR Assistant
- LMS
- Recruitment system
- Performance appraisal
- Facilities management
- Legal case management
- Full ERP modules
- Admin inventory
- Global HCM modules
- Complex mobile app gateway

They are useful future ideas, but they should stay in research/archive until the payroll/HR core is stronger.

---

## 11. Development Rule Going Forward

For every new part:

1. Inspect current repo first.
2. Do not guess folder/file structure.
3. Give full updated files only.
4. Keep old working APIs compatible.
5. Add routes carefully.
6. Add RBAC permissions where required.
7. Add audit log where business-sensitive.
8. Add validation.
9. Add Postman/browser test guide.
10. Add exact Git commands.

---

## 12. Summary

The roadmap is now locked:

```txt
Stop open-ended module discovery.
Preserve big vision in docs.
Prioritize Top 50 practical roadmap.
Start next development with Part-B53 Employee Full Profile / Digital Service Book Backend Foundation.
```
