# CSRM Payroll System — Module Status Tracker

Last Updated: 2026-05-10  
Current Sync Point: Part-48.0 — Docs Sync & Current State Lock

---

## Status Legend

| Status                   | Meaning                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| ✅ Present / Implemented | Module or feature exists in current backend codebase                            |
| 🟡 Needs Standardization | Exists but needs consistency, RBAC, audit, soft delete, build, or report polish |
| 🔵 Planned               | Not immediate, but expected in future roadmap                                   |
| 🔴 Not Started           | Not present yet or not confirmed in codebase                                    |

Important note:

This tracker records current codebase/module presence and development direction. It does not mean every module is production-final. Enterprise production readiness still needs standardization, testing, audit hardening, RBAC consistency, and build stabilization.

---

## 1. Current Overall Project Status

| Area               | Status | Notes                                                                         |
| ------------------ | ------ | ----------------------------------------------------------------------------- |
| Backend Foundation | ✅     | Express + TypeScript + MongoDB + Mongoose backend exists                      |
| Frontend           | 🔴     | React/Vite scaffold exists, but real UI is not implemented yet                |
| Authentication     | ✅     | JWT auth foundation exists                                                    |
| RBAC               | 🟡     | Permission foundation exists, but route enforcement is mixed                  |
| Audit Log          | 🟡     | Foundation exists, but delete/restore metadata standardization needed         |
| Validation         | 🟡     | Zod pattern exists, but module-by-module consistency review needed            |
| Reporting          | 🟡     | Many report modules exist, but layout/export standardization should continue  |
| Build Health       | 🟡     | Dependency install clean; TypeScript build needs separate stabilization check |
| Documentation      | 🟡     | Part-48.0 updates key continuity docs; README should be updated later         |

---

## 2. Core / Master Modules

| Module               | Folder               | Status | Notes                                                       |
| -------------------- | -------------------- | ------ | ----------------------------------------------------------- |
| Auth                 | `auth`               | ✅     | Login/JWT foundation                                        |
| User                 | `user`               | ✅     | User and role/permission base                               |
| Branch               | `branch`             | 🟡     | Exists; should receive soft delete/restore standard         |
| Company / Concern    | `company`            | 🟡     | Exists; should receive soft delete/restore standard         |
| Company Bank Account | `companyBankAccount` | 🟡     | Exists; important for bank sheet/payment workflow           |
| Major Department     | `majorDepartment`    | 🟡     | Exists; important for payroll reporting hierarchy           |
| Department           | `department`         | 🟡     | Exists; should align with company/majorDepartment hierarchy |
| Designation          | `designation`        | 🟡     | Exists; should receive soft delete/restore standard         |

---

## 3. Employee / HR Modules

| Module               | Folder               | Status | Notes                                                                       |
| -------------------- | -------------------- | ------ | --------------------------------------------------------------------------- |
| Employee             | `employee`           | 🟡     | Core employee master exists; employeeId rule must remain permanent          |
| Employee Bank Info   | `employeeBankInfo`   | 🟡     | Exists; duplicate/payment rule should stay carefully handled                |
| Employee Bulk Import | `employeeBulkImport` | 🟡     | Exists; future Excel/template validation should be polished                 |
| Employee Movement    | `employeeMovement`   | 🟡     | Exists; transfer/promotion/increment style workflows need audit consistency |

---

## 4. Attendance / Leave Modules

| Module                  | Folder                   | Status | Notes                                                              |
| ----------------------- | ------------------------ | ------ | ------------------------------------------------------------------ |
| Attendance              | `attendance`             | 🟡     | Exists; finalization and import integration should stay consistent |
| Attendance Import       | `attendanceImport`       | 🟡     | Exists; future biometric/device import compatibility needed        |
| Attendance Finalization | `attendanceFinalization` | 🟡     | Exists; important for payroll lock/finalization                    |
| Leave                   | `leave`                  | 🟡     | Exists; overlap/balance/policy rules should remain strict          |
| Leave Balance           | `leaveBalance`           | 🟡     | Exists; hard-delete/regeneration patterns need review              |
| Holiday                 | `holiday`                | 🟡     | Exists; should receive standard soft delete/restore behavior       |

---

## 5. Payroll / Salary Modules

| Module                      | Folder                      | Status | Notes                                                                  |
| --------------------------- | --------------------------- | ------ | ---------------------------------------------------------------------- |
| Salary Structure            | `salaryStructure`           | 🟡     | Exists; versioning/finalization should be kept safe                    |
| Payroll                     | `payroll`                   | 🟡     | Exists; lock/finalization/payment rules need continued hardening       |
| Payroll Report              | `payrollReport`             | 🟡     | Exists; JSON/PDF/Excel/CSV patterns should be consistent               |
| Salary Sheet                | `salarySheet`               | 🟡     | Exists; report layout should align with CSRM salary sheet reference    |
| Salary Statement            | `salaryStatement`           | 🟡     | Exists; should align with payment/reporting flow                       |
| Salary Payment Distribution | `salaryPaymentDistribution` | 🟡     | Exists; bank/cash/mobile distribution rules should be carefully tested |

---

## 6. Time Bill / OT Modules

| Module                  | Folder                  | Status | Notes                                                            |
| ----------------------- | ----------------------- | ------ | ---------------------------------------------------------------- |
| Time Bill               | `timeBill`              | 🟡     | Exists; should align with CSRM/TSL time bill rules               |
| OT Statement            | `otStatement`           | 🟡     | Exists; should align with overtime/tiffin workflow               |
| OT Payment Distribution | `otPaymentDistribution` | 🟡     | Exists; should align with bank/cash/mobile distribution standard |

---

## 7. Bonus Modules

| Module                     | Folder                     | Status | Notes                                                                 |
| -------------------------- | -------------------------- | ------ | --------------------------------------------------------------------- |
| Bonus Sheet                | `bonusSheet`               | 🟡     | Exists; festival bonus logic needs careful policy alignment           |
| Bonus Statement            | `bonusStatement`           | 🟡     | Exists; reporting/export polish required                              |
| Bonus Payment Distribution | `bonusPaymentDistribution` | 🟡     | Exists; bank/cash/mobile distribution should match salary/OT patterns |

---

## 8. Bank / Payment Modules

| Module                      | Folder                      | Status | Notes                                                              |
| --------------------------- | --------------------------- | ------ | ------------------------------------------------------------------ |
| Bank Sheet                  | `bankSheet`                 | 🟡     | Exists; export and approval workflow should be production-polished |
| Bank Sheet History          | `bankSheetHistory`          | 🟡     | Exists; useful for audit/history                                   |
| Company Bank Account        | `companyBankAccount`        | 🟡     | Exists; linked to company/payment workflows                        |
| Salary Payment Distribution | `salaryPaymentDistribution` | 🟡     | Exists                                                             |
| OT Payment Distribution     | `otPaymentDistribution`     | 🟡     | Exists                                                             |
| Bonus Payment Distribution  | `bonusPaymentDistribution`  | 🟡     | Exists                                                             |

---

## 9. Reporting / Layout / System Modules

| Module                    | Folder                   | Status | Notes                                                  |
| ------------------------- | ------------------------ | ------ | ------------------------------------------------------ |
| Report Center             | `reportCenter`           | 🟡     | Exists; more mature soft delete metadata noticed here  |
| Report Layout Standard    | `reportLayoutStandard`   | 🟡     | Exists; should guide future PDF/Excel layouts          |
| Month End Process Control | `monthEndProcessControl` | 🟡     | Exists; important for payroll period lock/finalization |
| Audit Log                 | `auditLog`               | 🟡     | Exists; needs delete/restore metadata consistency      |
| RBAC Audit                | `rbacAudit`              | 🟡     | Exists; RBAC consistency pass needed                   |

---

## 10. Route Registration Status

Main route registry:

`server/src/routes/index.ts`

Current status:

| Check                                    | Status |
| ---------------------------------------- | ------ |
| Active module route registry exists      | ✅     |
| Most current modules are registered      | ✅     |
| Route style is fully consistent          | 🟡     |
| Permission-based RBAC everywhere         | 🟡     |
| Restore/deleted-list routes standardized | 🔴     |

Important:

Part-48.1 and related follow-up parts should introduce a consistent convention for:

- soft delete
- restore
- deleted list
- audit log metadata
- permission naming

---

## 11. Soft Delete / Restore Status

Current state:

| Item                                     | Status | Notes                             |
| ---------------------------------------- | ------ | --------------------------------- |
| `isDeleted` exists in many modules       | ✅     | But not always with full metadata |
| `deletedAt` exists everywhere            | 🔴     | Not confirmed everywhere          |
| `deletedBy` exists everywhere            | 🔴     | Not standardized                  |
| `deleteReason` exists everywhere         | 🔴     | Not standardized                  |
| Restore API exists everywhere            | 🔴     | Needs standardization             |
| Deleted list API exists everywhere       | 🔴     | Needs standardization             |
| Delete/restore audit log is standardized | 🔴     | Needs Part-48.x work              |
| Hard delete prevention standard          | 🔴     | Needs Part-48.x work              |

Immediate next part:

Part-48.1 — Soft Delete / Restore Standardization Foundation

---

## 12. RBAC / Permission Status

Current state:

| Area                         | Status | Notes                                             |
| ---------------------------- | ------ | ------------------------------------------------- |
| Role enum exists             | ✅     | In user-related constants                         |
| Permission matrix exists     | ✅     | Needs continued alignment with new modules        |
| Permission middleware exists | ✅     | Used in several modules                           |
| All routes permission-based  | 🟡     | Some routes still appear role-based               |
| RBAC audit module exists     | ✅     | Needs route consistency pass                      |
| Future action                | 🟡     | Part-49.2 RBAC route enforcement consistency pass |

---

## 13. Build / Quality Status

| Item                      | Status | Notes                                                     |
| ------------------------- | ------ | --------------------------------------------------------- |
| Dependency installation   | ✅     | `npm ci --ignore-scripts` completed during ZIP inspection |
| npm audit vulnerabilities | ✅     | No issue reported during inspection                       |
| TypeScript build          | 🟡     | Needs separate stabilization/performance check            |
| Automated tests           | 🔴     | Not yet established                                       |
| Postman testing           | 🟡     | Main manual testing tool                                  |
| API documentation         | 🟡     | Needs consolidated API catalog later                      |

---

## 14. Documentation Status

| Document                          | Status | Notes                                                  |
| --------------------------------- | ------ | ------------------------------------------------------ |
| `PROJECT_CONTINUITY.md`           | ✅     | Updated in Part-48.0                                   |
| `NEXT_CHAT_PROMPT.md`             | ✅     | Updated in Part-48.0                                   |
| `MODULE_STATUS_TRACKER.md`        | ✅     | Updated in Part-48.0                                   |
| `SOFT_DELETE_RESTORE_STANDARD.md` | ✅     | Created in Part-48.0                                   |
| `README.md`                       | 🟡     | Should be updated in a later docs pass                 |
| `RBAC_PERMISSION_MATRIX.md`       | 🟡     | Should be reviewed after RBAC consistency pass         |
| `API_CONVENTIONS.md`              | 🟡     | Should be reviewed after restore/deleted-list standard |
| `POSTMAN_TESTING_STRATEGY.md`     | 🟡     | Should be updated after Part-48.x                      |

---

## 15. Immediate Next Parts

| Part      | Title                                                            | Priority |
| --------- | ---------------------------------------------------------------- | -------- |
| Part-48.1 | Soft Delete / Restore Standardization Foundation                 | HIGH     |
| Part-48.2 | Apply Soft Delete Standard to Core Master Modules                | HIGH     |
| Part-48.3 | Restore + Deleted List APIs                                      | HIGH     |
| Part-48.4 | Apply Soft Delete Standard to HR / Employee Modules              | HIGH     |
| Part-48.5 | Apply Soft Delete Standard to Payroll / Payment / Report Modules | HIGH     |
| Part-49.1 | Build Health / TypeScript Compile Stabilization                  | HIGH     |
| Part-49.2 | RBAC Route Enforcement Consistency Pass                          | HIGH     |
| Part-50.1 | README + Final Continuity Pack Update                            | MEDIUM   |
| Part-51.1 | Frontend Planning / API Documentation Pack                       | MEDIUM   |

---

## 16. Long-Term Roadmap

Future dedicated systems may be separate apps rather than forcing everything into payroll:

- Payroll / HR software
- Accounts & Finance software
- Store & Warehouse Management software
- Sales & Marketing software
- Delivery / Scale operations software
- Transport software
- Production record system

Important ecosystem rule:

Employee information should remain inside Payroll/HR software. Other future systems should maintain users only where needed and should not duplicate full employee records.
