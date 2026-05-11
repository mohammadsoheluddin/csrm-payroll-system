# CSRM Payroll System — Backend Smoke Test Results

Created In: Part-50.4 — Backend Smoke Testing  
Status: Fill During Manual Testing

---

## Test Session Info

| Item | Value |
| ---- | ----- |
| Tester | Sohel |
| Date | 2026-05-11 |
| Environment | Local |
| Base URL | http://localhost:5000/api/v1 |
| Branch | main |
| Server Status | Pending |
| MongoDB Status | Pending |

---

## Pre-Test Health

| Check | Result | Note |
| ----- | ------ | ---- |
| node scripts/backend-health-check.cjs | Pending |  |
| npm run dev | Pending |  |
| MongoDB connected | Pending |  |
| Postman environment selected | Pending |  |

---

## Stage 1 — Auth

| Request | Expected | Actual | Status | Note |
| ------- | -------- | ------ | ------ | ---- |
| Admin Login | 200/201 + token |  | Pending |  |
| HR Login | 200/201 + token |  | Pending |  |
| Accounts Login | 200/201 + token |  | Pending |  |
| Manager Login | 200/201 + token |  | Pending |  |
| Employee Login | 200/201 + token |  | Pending |  |

---

## Stage 2 — Admin Master Data

| Request | Expected | Actual | Status | Note |
| ------- | -------- | ------ | ------ | ---- |
| GET /companies | 200 |  | Pending |  |
| GET /branches | 200 |  | Pending |  |
| GET /major-departments | 200 |  | Pending |  |
| GET /departments | 200 |  | Pending |  |
| GET /designations | 200 |  | Pending |  |
| GET /company-bank-accounts | 200 |  | Pending |  |

---

## Stage 3 — HR / Employee / Attendance / Leave

| Request | Expected | Actual | Status | Note |
| ------- | -------- | ------ | ------ | ---- |
| GET /employees | 200 |  | Pending |  |
| GET /employee-bank-infos | 200 |  | Pending |  |
| GET /employee-movements | 200 |  | Pending |  |
| GET /attendance | 200 |  | Pending |  |
| GET /attendance-finalizations | 200 |  | Pending |  |
| GET /leave | 200 |  | Pending |  |
| GET /leave-balances | 200 |  | Pending |  |
| GET /holiday | 200 |  | Pending |  |

---

## Stage 4 — Payroll / Salary / Payment

| Request | Expected | Actual | Status | Note |
| ------- | -------- | ------ | ------ | ---- |
| GET /salary-structure | 200 |  | Pending |  |
| GET /payroll | 200 |  | Pending |  |
| POST /payroll/generate | 200/201 or expected 409 |  | Pending |  |
| GET /salary-sheets | 200 |  | Pending |  |
| GET /salary-statements | 200 |  | Pending |  |
| GET /salary-payment-distributions | 200 |  | Pending |  |
| GET /time-bills | 200 |  | Pending |  |
| GET /ot-statements | 200 |  | Pending |  |
| GET /bonus-sheets | 200 |  | Pending |  |
| GET /bonus-statements | 200 |  | Pending |  |

---

## Stage 5 — RBAC Forbidden

| Request | Expected | Actual | Status | Note |
| ------- | -------- | ------ | ------ | ---- |
| Employee token GET /payroll | 403 |  | Pending |  |
| Employee token GET /audit-logs | 403 |  | Pending |  |
| Employee token GET /users | 403 |  | Pending |  |

---

## Stage 6 — Audit Log

| Request | Expected | Actual | Status | Note |
| ------- | -------- | ------ | ------ | ---- |
| GET /audit-logs | 200 |  | Pending |  |
| GET /audit-logs/sensitive | 200 |  | Pending |  |
| GET /audit-logs?action=permission_denied | 200 + data |  | Pending |  |
| GET /audit-logs?riskLevel=high | 200 |  | Pending |  |
| GET /audit-logs?category=authorization | 200 |  | Pending |  |

---

## Stage 7 — Report / System

| Request | Expected | Actual | Status | Note |
| ------- | -------- | ------ | ------ | ---- |
| GET /report-center | 200 |  | Pending |  |
| GET /report-layout-standards | 200 |  | Pending |  |
| GET /month-end-process-control | 200 |  | Pending |  |
| GET /rbac-audit | 200 |  | Pending |  |

---

## Issues Found

| SL | Module | Endpoint | Issue | Severity | Status |
| -- | ------ | -------- | ----- | -------- | ------ |
| 1 |  |  |  |  |  |

---

## Final Decision

| Item | Result |
| ---- | ------ |
| Smoke Testing Status | Pending |
| Ready for Part-50.5 Backend Completion Lock? | No |
