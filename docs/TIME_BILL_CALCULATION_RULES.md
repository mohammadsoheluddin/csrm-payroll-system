# Time Bill Calculation Rules

# CSRM Payroll System

---

# PURPOSE

Defines:

- OT calculation
- tiffin calculation
- payable OT rules

---

# CORE FORMULAS

## OT Rate

Gross Salary / 30 / Duty Hour

---

# OT Amount

OT Hour × OT Rate

---

# TIFFIN AMOUNT

Tiffin × Duty Day

---

# TOTAL OT PAYABLE

OT Amount + Tiffin Amount

---

# IMPORTANT BUSINESS RULES

Time Bill processing remains:
separate from salary sheet.

---

# ELIGIBILITY

Future rules may include:

- attendance threshold
- shift eligibility
- worker category
- holiday duty

---

# FUTURE FEATURES

- holiday OT
- shift OT
- double OT
- OT approval
- OT freeze
- OT audit

---

# IMPORTANT ARCHITECTURE RULE

Time Bill should consume:
finalized attendance only.
