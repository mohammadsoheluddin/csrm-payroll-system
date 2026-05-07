# Next Chat Resume Prompt — CSRM Payroll System

Use this prompt at the beginning of a new ChatGPT conversation to continue the project safely.

---

We are continuing my project: "CSRM Payroll System" backend development.

GitHub repo:
https://github.com/mohammadsoheluddin/csrm-payroll-system

Before giving any code:

1. Check my current GitHub repo.
2. Read `docs/PROJECT_CONTINUITY.md` if available.
3. Confirm the latest implemented module/part.
4. Do not start coding until you understand the existing structure.

Project stack:

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Zod
- JWT
- PDFKit
- ExcelJS
- Postman for testing

Development style — very important:

- Give full updated files only, not snippets.
- Mention exact file paths.
- Maintain compatibility with existing project structure.
- Do not randomly change database/deployment approach.
- Keep code production-ready and clean.
- Follow consistent naming conventions.
- Clearly explain business logic.
- Give organized Postman test cases after each part.
- End every code-change response with Git add/commit/push commands.
- Git commands must include only changed/added files.
- Use Bangla + English mixed explanation where helpful.
- Avoid breaking existing working APIs.

Current important completed parts:

- Auth Module
- User Module
- Branch Module
- Company / Concern Module
- Major Department Module
- Department Module refactored with Company + Major Department
- Designation Module
- Employee Office Info Refactor
- Attendance Module
- Leave Module
- Holiday Module
- Salary Structure basic version
- Payroll Module basic version
- Payroll Report Module basic version
- Payslip JSON/PDF export
- Payroll Report CSV/Excel export
- Payroll Approval + Lock
- RBAC Permission Matrix
- Audit Log foundation
- Validation middleware + Zod error handling

Latest completed part:
Part-30.6: Employee Office Info Refactor

Part-30.6 summary:
Employee now aligns with:

- company
- majorDepartment
- department
- designation
- branch
- employeeId
- officeId
- cardNo
- joiningDate
- confirmationDate
- serviceType
- payType
- dutyHourPerDay
- leaveDay
- employmentStatus

Important employeeId rule:

- employeeId is permanent.
- employeeId must never be reused, even after resignation/termination/soft delete.
- employeeId should not be updateable after employee creation.

Organization hierarchy:
Company / Concern
→ Major Department / Payroll Reporting Group
→ Department
→ Designation
→ Employee

Important mapping:

- Old salary sheet "Department" = new Major Department / Payroll Reporting Group.
- Old salary sheet "Sub-Department" = new Department.
- Section/Sub-Section Module is skipped/postponed for now.

Important real payroll context:

- CSRM and TSL payroll data should guide the software.
- Some sister concerns may be treated as Major Department / Payroll Reporting Group for current centralized payroll processing.
- Bank sheet, time bill, salary sheet, TA/DA, and festival bonus should eventually be generated from software.

Immediate next part:
Part-30.7: Employee Bank & Payment Info Module

Part-30.7 should support:

- employee
- company
- accountName
- bankName
- bankBranchName
- bankBranchCode
- accountNo
- processBankBranchNo
- routingNo
- paymentMode: bank/cash/mobile_banking
- mobileBankingProvider
- mobileBankingNo
- cashPayReason
- effectiveFrom
- effectiveTo
- isPrimary
- status
- isDeleted

Business rules for Part-30.7:

- Active employee required.
- Bank payment requires accountName, bankName, bank branch details, and accountNo.
- Cash payment should require cashPayReason.
- Mobile banking requires mobileBankingProvider and mobileBankingNo.
- Only one active primary payment info should exist per employee.
- Keep historical old bank/payment info rather than overwriting blindly.
- Add RBAC permissions:
  - employee_bank_info:read
  - employee_bank_info:manage
- Add audit log module type if needed:
  - employee_bank_info
- Register route:
  - `/employee-bank-infos` or a clean route name consistent with project convention.
- Provide complete Postman tests after code.

After Part-30.7:

- Part-30.8: Company Bank Account Module
- Part-30.9: Bank Sheet Engine
- Part-30.10: Bank Sheet PDF + Excel Export
- Later: Salary Structure Refactor, Payroll Calculation Improvement, TA/DA Claim Module, Festival Bonus Module

Do not start a new unrelated module.
Continue from Part-30.7 unless I say otherwise.
