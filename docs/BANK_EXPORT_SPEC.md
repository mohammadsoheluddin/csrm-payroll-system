# Bank Export Specification

# CSRM Payroll System

---

# PURPOSE

Defines:

- bank sheet structure
- export requirements
- bank processing format

---

# INPUT SOURCE

Statement Engine

---

# COMMON EXPORT COLUMNS

- SL No
- Employee ID
- Employee Name
- Account Name
- Account Number
- Routing Number
- Branch
- Branch Code
- Bank Name
- Amount

---

# IMPORTANT BUSINESS RULES

## Bank Sheet

Contains ONLY:
bank payable amount.

Cash amount excluded.

---

# CASH SHEET

Separate printable sheet.

Bank-related columns hidden.

---

# EXPORT TYPES

- Excel
- CSV
- PDF (optional)

---

# FUTURE FEATURES

- bank-specific templates
- branch grouping
- bulk upload file
- payment tracking
- bank export audit

---

# IMPORTANT ARCHITECTURE RULE

Bank export should consume:
Statement Engine output only.
