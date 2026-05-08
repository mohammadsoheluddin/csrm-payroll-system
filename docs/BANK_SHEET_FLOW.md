# Bank Sheet Flow

# CSRM Payroll System

---

# PURPOSE

Bank Sheet is generated from Statement.

Used for:

- bank salary processing
- bank upload
- branch payment processing

---

# INPUT SOURCE

Statement Engine

---

# COMMON COLUMNS

- SL No
- Employee ID
- Employee Name
- Account Name
- Account Number
- Branch
- Routing No
- Branch Code
- Bank Name
- Amount

---

# IMPORTANT

Bank Sheet ONLY contains:
bank payable amount.

Cash payable amount is excluded.

---

# CASH VERSION

Cash department receives separate printable sheet.

There:

- only cash payable amount visible
- bank columns hidden

---

# FUTURE FEATURES

- Excel export
- bank-specific format
- auto branch grouping
- batch transfer file generation
- bank audit history
