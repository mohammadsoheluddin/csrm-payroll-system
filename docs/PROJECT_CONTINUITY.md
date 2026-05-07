# CSRM Payroll System — Project Continuity Documentation

## 1. Project Identity

Project Name: CSRM Payroll System

Primary Organization Context:

- Chakda Steel & Re-Rolling Mills (Pvt.) Ltd. / CSRM
- Technosum Steel Limited / TSL
- Other related concerns or payroll reporting groups may be handled centrally by CSRM HR/Accounts.

Primary Goal:
Build a production-oriented HR, Attendance, Leave, Payroll, Reporting, Bank Payment, Audit Log, and RBAC system based on real CSRM/TSL payroll workflows.

Technology Stack:

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Zod
- JWT
- Postman
- PDFKit
- ExcelJS

Development Rule:
This project must continue with the current backend/frontend flow. Do not randomly change the database or deployment approach unless a separate migration/variant is intentionally planned.

---

## 2. Current Backend Status

Completed / Mostly Completed:

1. Auth Module
2. User Module
3. Branch Module
4. Company / Concern Module
5. Major Department Module
6. Department Module refactored with Company + Major Department
7. Designation Module
8. Employee Office Info Refactor
9. Attendance Module
10. Leave Module
11. Holiday Module
12. Salary Structure basic version
13. Payroll Module basic version
14. Payroll Report Module basic version
15. Payslip JSON API
16. Monthly Payroll Report JSON API
17. Payslip PDF Export API
18. Payroll Report CSV/Excel Export API
19. Payroll Approval + Lock System
20. RBAC Permission Matrix + Route-Level Authorization
21. Audit Log + Status History + Edit Restriction base
22. Validation Middleware + Global Zod Error Handling

Latest Completed Part:

- Part-30.6: Employee Office Info Refactor
- Test status: Mostly tested in Postman; some negative/edge tests skipped by user.

Next Planned Part:

- Part-30.7: Employee Bank & Payment Info Module

---

## 3. Current Organization Hierarchy Decision

Final hierarchy for now:

Company / Concern
→ Major Department / Payroll Reporting Group
→ Department
→ Designation
→ Employee

Important Mapping:

- Old salary sheet "Department" should map to new system "Major Department / Payroll Reporting Group".
- Old salary sheet "Sub-Department" should map to new system "Department".
- Section/Sub-Section Module is postponed for now.
- If needed later, Section/Sub-Section can be added as an optional deeper layer.

Primary company/legal payroll control:

- CSRM / Chakda Steel & Re-Rolling Mills (Pvt.) Ltd.

Major Department / Payroll Reporting Group examples:

1. Office
2. Accounts & Finance / A&F
3. Sales & Marketing
4. Procurement
5. Scrap Yard
6. SMS
7. ARRM
8. 4B Ship
9. CSRM Green Bricks
10. Chakda Dredging
11. CSRM Real Estate

Important clarification:
Some groups like 4B Ship, CSRM Green Bricks, Chakda Dredging, and CSRM Real Estate may be real sister concerns, but for current payroll reporting they may be treated as Major Department / Payroll Reporting Group because CSRM central HR/Accounts manually processes their payroll for now.

---

## 4. Employee Identity Policy

Official employeeId is permanent.

Rule:

- Once an employeeId is assigned to an employee, it must never be reused.
- Even if the employee resigns, retires, is terminated, or is soft-deleted, the same employeeId must not be assigned to a new employee.

Reason:
Employee ID connects:

- Payroll history
- Attendance history
- Leave history
- Salary history
- Payslip
- Bank payment
- TA/DA claim
- Festival bonus
- Audit log
- Legal/compliance records

Correct approach:

- Old employee resigned: status = resigned/inactive, isDeleted = true if needed.
- New employee joined: assign a new employeeId.

Different note:

- officeId/cardNo/device card may later need reassignment in rare cases.
- If cardNo/device ID is ever reassigned, a separate card assignment history module should be created.

---

## 5. Employee Office Info Refactor Result

Employee module now should align with:

Required identity and personal fields:

- employeeId
- name
- email
- phone
- gender

Office hierarchy:

- company
- majorDepartment
- department
- designation
- branch

Office information:

- officeId
- cardNo
- joiningDate
- confirmationDate
- serviceType
- payType
- dutyHourPerDay
- leaveDay
- employmentStatus
- status

Salary note:

- basicSalary is currently kept as optional support field.
- Future salary calculation should come from Salary Structure module, not directly from Employee master data.

---

## 6. Reference Payroll Form Requirements

Old Employee Form / Office Info references should inform future UI/API design.

Important fields from old employee form:

- Office / Company
- Designation
- Department
- Sub Department
- Joining Date
- Confirm Date
- Salary Gross
- Duty Hour / Day
- Leave Day
- Status

Important salary charge fields from old payroll reference:

- Gross
- Basic
- House Rent
- Medical
- Conveyance
- Tiffin calculation
- OT calculation
- OT Rate
- Bank Pay Amount
- Effective Date
- Tax
- Shift

---

## 7. Salary, OT, and Tiffin Formula Requirements

Salary sheet formula references:

Deducted Amount:
Gross Salary / 30 × Absence, rounded.

Days:
30 - Absence

Net Salary:
Gross Salary - Deducted Amount

OT Per Hour:
Gross Salary / 30 / Duty Hour

OT Amount:
Total OT Hour × OT Per Hour

Tiffin Amount:
Tiffin × Duty Day / OT Day

Total Time Bill Amount:
OT Amount + Tiffin Amount

Future modules must respect these formulas unless CSRM policy changes.

---

## 8. Required Payroll Reports

Eventually the software should generate:

1. Monthly Salary Sheet / Salary Summary
2. Department-wise Salary Summary
3. Employee-wise Payslip
4. Time Bill / OT Bill Detail
5. Time Bill Summary
6. Tiffin Bill Summary
7. Bank Payment Statement
8. Cash Payment Statement
9. Salary Disbursement Statement
10. Leave Balance Report
11. Leave History Report
12. Replacement Leave Report
13. Attendance Summary Report
14. Absent / Deduction Report
15. Joining Record / New Employee Report
16. Increment / Salary Revision Report
17. Mobile Bill / Allowance Report
18. Department / Major Department Employee List
19. Bank Account List
20. Payroll Approval / Lock Status Report
21. Festival Bonus Sheet
22. TA/DA Claim Sheet
23. Sales Visit Expense Summary
24. Bank Sheet for Salary, OT, TA/DA, Festival Bonus, and Allowance

---

## 9. Bank Sheet Requirement

Bank sheet should be generated by software, not manually.

Reference output structure:

1. Bank forwarding letter
2. Bank account-wise payment sheet

Common bank sheet columns:

- SL No
- Name of A/C
- A/C Bank Branch Code
- A/C No
- Process Bank Branch No
- Branch
- Amount in Tk

Bank forwarding letter should include:

- Company letterhead
- Date
- To: The Manager, Bank Name, Branch
- Subject
- Company debit account
- Cheque number
- Cheque date
- Total amount in number
- Total amount in words
- Request to process payment
- Authorized signature

Bank sheet source should come from approved/locked payment data, not directly from employee master data.

Supported future payment sources:

- Monthly salary
- Worker time bill / OT bill
- Festival bonus
- TA/DA
- Allowance
- Other approved employee payment

---

## 10. Employee Bank & Payment Info Requirement

Part-30.7 should introduce Employee Bank & Payment Info.

Suggested fields:

- employee
- company
- accountName
- bankName
- bankBranchName
- bankBranchCode
- accountNo
- processBankBranchNo
- routingNo
- paymentMode
- mobileBankingProvider
- mobileBankingNo
- cashPayReason
- effectiveFrom
- effectiveTo
- isPrimary
- status
- isDeleted

Payment modes:

- bank
- cash
- mobile_banking

Business rules:

- Active employee required.
- Bank payment requires accountName, bankName, branch info, accountNo.
- Cash payment should require reason.
- Mobile banking requires provider and number.
- One active primary payment info per employee should exist.
- Old payment info should be retained for history if changed.

---

## 11. Company Bank Account Requirement

After Employee Bank & Payment Info, add Company Bank Account module.

Suggested fields:

- company
- bankName
- bankBranchName
- accountName
- accountNo
- accountType
- branchCode
- routingNo
- swiftCode
- isDefaultSalaryAccount
- isDefaultTimeBillAccount
- isDefaultBonusAccount
- status
- isDeleted

This will be used for bank forwarding letters and payment sheet generation.

---

## 12. TA/DA and Sales Visit Expense Requirement

Future module:
Employee Expense Claim / Sales Visit & TA/DA Claim Module.

Main idea:
Sales & Marketing employees should submit daily market visit and daily expense information through the system instead of manual PDF/Excel.

Daily visit fields:

- employee
- visitDate
- marketArea
- partyName / dealer / customer
- purpose
- fromLocation
- toLocation
- transportType
- remarks

Daily expense line categories:

- transport
- fuel
- hotel
- courier
- toll
- parking
- mobile / communication
- others

Daily calculation:

- transport/fuel total
- other expense total
- fixed food allowance
- daily grand total

Food allowance:

- Employee-wise fixed daily food allowance should be configurable.
- Food allowance applies only when market visit/duty is submitted/approved for that date.
- Food allowance should apply once per day, not once per expense line.

Approval flow:
draft
→ submitted
→ checked_by_admin_or_hr
→ verified_by_accounts
→ approved_by_director
→ locked
→ bank_sheet_generated
→ paid

---

## 13. Festival Bonus Requirement

Festival bonus should be a separate module, not hard-coded inside monthly payroll.

Suggested structure:

1. Festival Bonus Policy
2. Festival Bonus Run
3. Festival Bonus Employee Item

Possible calculation methods:

- Percentage of gross salary
- Percentage of basic salary
- Fixed amount
- Manual amount

Typical flow:
draft
→ generated
→ reviewed
→ approved
→ locked
→ paid

Festival bonus should reuse:

- Employee master data
- Salary Structure
- Approval/Lock flow
- Bank Sheet Engine
- PDF/Excel Export

---

## 14. Audit Log Requirement

Important actions should create audit logs:

- create
- update
- soft_delete
- approve
- reject
- lock
- unlock
- pay
- export
- permission_denied
- status_change

Important future financial modules must log:

- who created
- who updated
- who approved
- who locked
- who exported
- who marked paid

This applies to:

- payroll
- bank sheet
- employee bank info
- TA/DA
- festival bonus
- salary structure
- attendance/leave where applicable

---

## 15. RBAC Direction

Current roles:

- super_admin
- admin
- hr
- accounts
- manager
- employee

Future permissions should follow existing pattern:

- module:read
- module:manage
- module:approve
- module:lock
- module:export
- module:pay

Recommended future permissions:

- employee_bank_info:read
- employee_bank_info:manage
- company_bank_account:read
- company_bank_account:manage
- bank_sheet:read
- bank_sheet:generate
- bank_sheet:approve
- bank_sheet:lock
- bank_sheet:export
- expense_claim:read
- expense_claim:manage
- expense_claim:approve
- expense_claim:lock
- festival_bonus:read
- festival_bonus:manage
- festival_bonus:approve
- festival_bonus:lock
- festival_bonus:export

---

## 16. Development Style Rules

Every future coding response should follow:

1. Check current GitHub repo before giving code.
2. Give full updated files, not snippets.
3. Mention exact file paths.
4. Maintain existing project structure.
5. Do not randomly change database/deployment approach.
6. Keep code production-ready and clean.
7. Follow existing naming conventions.
8. Explain business logic clearly.
9. Give organized Postman test cases after each part.
10. End every code-change response with Git commands.
11. Git commands must stage only changed/added files.
12. Use Bangla + English mixed explanation where helpful.
13. Avoid breaking existing working APIs.

---

## 17. Immediate Roadmap

Recommended next sequence:

1. Part-30.7: Employee Bank & Payment Info Module
2. Part-30.8: Company Bank Account Module
3. Part-30.9: Bank Sheet Engine
4. Part-30.10: Bank Sheet PDF + Excel Export
5. Part-31: Salary Structure Refactor
6. Part-32: Payroll Calculation Improvement
7. Part-33: TA/DA & Sales Visit Expense Module
8. Part-34: Festival Bonus Module

Reason:
Employee Bank Info and Company Bank Account should come before Bank Sheet Engine.
Bank Sheet Engine should come before TA/DA and Festival Bonus payment export.
