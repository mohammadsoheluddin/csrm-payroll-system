# CSRM Payroll System — Pilot Readiness Checklist

Use this checklist before internal pilot use.

## 1. Technical Readiness

- [ ] Backend builds successfully.
- [ ] Frontend lint passes.
- [ ] Frontend builds successfully.
- [ ] Backend runs locally.
- [ ] Frontend runs locally.
- [ ] Smoke helper passes.
- [ ] Authenticated smoke helper passes with real access token.

## 2. User and Role Readiness

Create or verify the following test users:

- [ ] super_admin
- [ ] admin
- [ ] hr
- [ ] accounts
- [ ] manager
- [ ] employee

Check:

- [ ] Correct sidebar per role
- [ ] Correct route blocking per role
- [ ] Correct button/action visibility per permission
- [ ] Forbidden page works
- [ ] Session expired page works

## 3. Data Readiness

Prepare test data:

- [ ] Company
- [ ] Branch
- [ ] Major Department
- [ ] Department / Section
- [ ] Designation
- [ ] Company Bank Account
- [ ] Employee
- [ ] Attendance records
- [ ] Leave records
- [ ] Salary Structure
- [ ] Payroll run data
- [ ] Salary sheet / statement / distribution data
- [ ] Report data
- [ ] Audit log data

## 4. Module Readiness

- [ ] Dashboard
- [ ] Master Data
- [ ] Employees
- [ ] Attendance
- [ ] Leave
- [ ] Payroll
- [ ] Salary Structures
- [ ] Salary Sheets
- [ ] Salary Statements
- [ ] Salary Payment Distributions
- [ ] Report Center
- [ ] Salary Summary
- [ ] Bank Sheets
- [ ] Month-End Control
- [ ] Audit Logs
- [ ] RBAC Audit

## 5. Export Readiness

- [ ] CSV export works where available.
- [ ] Excel export works where available.
- [ ] PDF export works where available.
- [ ] Downloaded file names are readable.
- [ ] No-data export behavior is acceptable.
- [ ] Export buttons follow permission rules.

## 6. UI/UX Readiness

- [ ] Desktop layout acceptable.
- [ ] Tablet layout acceptable.
- [ ] Mobile layout acceptable.
- [ ] Sidebar works on mobile.
- [ ] Tables scroll properly.
- [ ] Drawers and modals work.
- [ ] Forms are usable.
- [ ] Loading states are clear.
- [ ] Empty states are clear.
- [ ] Error states are clear.

## 7. Pilot Sign-Off

- [ ] HR user check done.
- [ ] Accounts user check done.
- [ ] Manager user check done.
- [ ] Admin user check done.
- [ ] Report output reviewed.
- [ ] Payroll financial values reviewed.
- [ ] Known limitations documented.
- [ ] Pilot feedback collection method selected.
