# Reporting Engine

# CSRM Payroll System

---

# PURPOSE

Reporting Engine generates:

- HR reports
- payroll reports
- attendance reports
- OT reports
- banking reports
- summary reports

---

# CORE REPORT TYPES

## Attendance Reports

- employee-wise
- department-wise
- company-wise
- date-range based

---

## Leave Reports

- leave summary
- leave balance
- leave history

---

## Payroll Reports

- salary sheet
- payroll summary
- payroll overview

---

## OT Reports

- time bill
- OT summary
- department-wise OT

---

## Banking Reports

- bank sheet
- cash sheet
- payment summary

---

# EXPORT TYPES

- JSON
- CSV
- Excel
- PDF

---

# IMPORTANT REPORTING REQUIREMENTS

Reports must support:

- company filter
- department filter
- month filter
- employee filter
- date-range filter

---

# FUTURE FEATURES

- dashboard analytics
- charts
- HR analytics
- payroll trend
- salary growth analysis
- leave analytics
- OT analytics

---

# IMPORTANT ARCHITECTURE RULE

Reporting Engine should consume data from:
specialized engines.

Reports should NOT recalculate business logic independently.
