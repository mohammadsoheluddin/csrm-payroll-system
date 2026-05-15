# Part-F15 — Pilot Readiness Checklist + Frontend Completion Lock

Status: **Frontend completion lock / pilot-readiness checkpoint**

This document locks the frontend foundation work completed from Part-F1 through Part-F14 and defines the checklist that must be passed before internal pilot use.

## 1. Completion Scope

The following frontend foundation parts are considered completed and ready for pilot validation:

- Part-F1 — Frontend Project Setup
- Part-F2 — Layout + Routing + Theme Foundation
- Part-F3 — Auth + Token + Protected Routes
- Part-F3.1 — Auth CORS + Session Bootstrap Hotfix
- Part-F4 — API Client + Error Handling Foundation
- Part-F4.1 — Frontend UI Reference Lock & Design Standard
- Part-F5 — Sidebar Permission Filtering + Permission-Wise UI Guard
- Part-F6 — Dashboard Widget Customization + Role-Based Dashboard Foundation
- Part-F7 — Master Data Foundation Screens
- Part-F7.1 — Master Data UI Test + Backend Integration Fix Pass
- Part-F8 — Employee Directory + Profile Foundation
- Part-F8.1 — Employee Directory UI Test + Backend Integration Fix Pass
- Part-F9 — Attendance + Leave Foundation Screens
- Part-F9.1 — Attendance + Leave UI Test + Backend Integration Fix Pass
- Part-F10 — Payroll + Salary Foundation Screens
- Part-F10.1 — Payroll Lookup Build Hotfix
- Part-F10.2 — Payroll + Salary UI Test & Backend Integration Fix Pass
- Part-F11 — Reports + Export Foundation Screens
- Part-F11.1 — Reports + Export UI Test & Backend Integration Fix Pass
- Part-F12 — Audit Log + RBAC Audit Screens
- Part-F12.1 — Audit Log + RBAC Audit UI Test & Backend Integration Fix Pass
- Part-F12.2 — Global UI Responsiveness & Premium Polish Pass
- Part-F13 — Frontend Smoke Test + Backend Integration Check
- Part-F13.1 — Frontend Smoke Test Fix Pass
- Part-F14 — Route Lazy Loading + Frontend Performance Optimization
- Part-F15 — Pilot Readiness Checklist + Frontend Completion Lock

## 2. Locked Frontend Areas

The following areas are now considered locked as a frontend foundation candidate:

- React + TypeScript + Vite application foundation
- Tailwind-based premium ERP UI styling foundation
- Responsive layout shell with sidebar, header, breadcrumbs, and mobile drawer
- Theme support foundation
- Auth foundation with login, protected routes, refresh-token flow, logout, and session handling
- API client and normalized error handling
- Permission-aware route, sidebar, and button/action guards
- Dashboard widget customization foundation
- Master Data screens
- Employee Directory and Profile foundation
- Attendance and Leave foundation screens
- Payroll and Salary foundation screens
- Report Center, Salary Summary, Bank Sheet, Month-End, and layout-standard screens
- Audit Log and RBAC Audit screens
- Route-level lazy loading and prefetch foundation
- Smoke-test helper and smoke-test checklist

## 3. Pilot Readiness Checklist

Before internal pilot use, the following checklist should be completed.

### 3.1 Environment and Build

- [ ] `client/.env` exists and points to the correct backend API base URL.
- [ ] Backend `.env` is configured for the correct MongoDB database.
- [ ] Backend build passes.
- [ ] Frontend lint passes.
- [ ] Frontend build passes.
- [ ] Backend and frontend can run together locally.

Recommended commands:

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run build
npm run dev
```

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
npm run dev
```

### 3.2 Smoke Test

- [ ] Frontend route smoke test passes.
- [ ] Backend health check passes.
- [ ] Authenticated `/users/me` probe passes with a real access token.
- [ ] No infinite `Checking session` issue.
- [ ] No CORS error in browser console.
- [ ] No red runtime error in browser console.

Recommended smoke helper:

```bash
cd /e/Projects/CSRM-Payroll-System
node scripts/frontend-smoke-check.mjs
```

Authenticated smoke helper:

```bash
API_AUTH_TOKEN="PASTE_REAL_ACCESS_TOKEN_HERE" node scripts/frontend-smoke-check.mjs
```

Expected result:

```txt
Total : 27
Passed: 27
Failed: 0
Smoke helper completed successfully.
```

### 3.3 Auth and Permissions

- [ ] Login works with valid backend user.
- [ ] Invalid login shows proper validation/error message.
- [ ] Logout works.
- [ ] Refresh browser keeps valid session where refresh cookie is valid.
- [ ] Expired session redirects to session-expired page.
- [ ] Unauthorized role is blocked from restricted routes.
- [ ] Sidebar items are filtered by permission.
- [ ] Buttons/actions are hidden or disabled according to permission.

### 3.4 Module-Level Checks

- [ ] Dashboard loads and widget customization works.
- [ ] Master Data list/create/edit/delete/restore flows work where backend supports them.
- [ ] Employee list, profile drawer, create/edit, lifecycle, delete/restore flows work.
- [ ] Attendance list/create/edit/delete/restore flows work.
- [ ] Leave list/create/edit/approve/reject/cancel/delete/restore flows work.
- [ ] Payroll run/list/detail/generate/process/approve/lock/delete/restore foundation works.
- [ ] Salary structure list/create/edit/delete/restore works.
- [ ] Salary sheets/statements/payment-distribution screens load and call backend routes safely.
- [ ] Report Center pages load.
- [ ] Salary Summary report preview/export route calls are safe.
- [ ] Bank Sheet preview/export route calls are safe.
- [ ] Audit Logs page loads and detail drawer works.
- [ ] RBAC Audit summary/coverage/matrix pages load.

### 3.5 UI/UX Pilot Checks

- [ ] Desktop layout looks clean and professional.
- [ ] Tablet layout is usable.
- [ ] Mobile layout does not break, especially sidebar and large tables.
- [ ] Table horizontal scrolling works where required.
- [ ] Long forms remain usable.
- [ ] Drawers/modals work smoothly.
- [ ] Loading, empty, error, and permission-denied states are readable.
- [ ] Theme setting does not break the design.

## 4. Known Limitations at Lock Time

This is not a final commercial production release. The following items remain future/pilot hardening work:

- Real-world user acceptance testing is still required.
- Full payroll financial validation with real company data is still required.
- Some screens are foundation-level and may need more advanced workflow polish after pilot feedback.
- Report layouts may need company-approved print-format adjustments.
- Route-level lazy loading is added, but deeper performance profiling can be done later.
- Some future modules are reserved but not implemented yet.

## 5. Reserved Future Backend / Finance-Adjacent Modules

The following requirements are reserved for future backend design and implementation:

- Part-B52 — Legacy Salary Sheet Import & Archive Module
- Part-B53 — Management Remuneration & Executive Compensation Module
- Part-B54 — Ancillary Bill & Voucher Engine Foundation
- Part-B55 — Employee Loan & Installment Deduction Module
- Part-B56 — Suspense Import & Salary Adjustment Module
- Part-B57 — Rod Bachai Bill Module
- Part-B58 — Pharmacy / Medical Bill Module
- Part-B59 — Sales Commission Module
- Part-B60 — Supplier Bill + Cheque Issue Register Foundation
- Part-B61 — Dining Monthly Expense Summary Module
- Part-B62 — Facility Maintenance / AC Servicing Record Module

## 6. Lock Decision

The frontend is now considered a **Pilot-Readiness Candidate**.

This means:

- The frontend foundation is complete enough for internal pilot testing.
- The app is not yet a final commercial production release.
- Future work should be handled as controlled parts, not random changes.
- Any new feature should be added through a named part with documentation, test commands, and Git commit.

## 7. Next Recommended Work

After this lock, the next safest paths are:

1. Pilot smoke test using real data and real role accounts.
2. UI/UX feedback pass from actual users.
3. Report layout validation against official company formats.
4. Part-B52 — Legacy Salary Sheet Import & Archive Module.
5. Pilot deployment planning.
