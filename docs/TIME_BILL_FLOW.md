# Time Bill / OT Flow

# CSRM Payroll System

---

# PURPOSE

Time Bill handles:

- overtime
- duty hour
- tiffin
- OT amount

This is separate from salary sheet.

---

# INPUTS

- attendance
- OT hour
- duty day
- OT eligibility
- gross salary

---

# CORE FORMULAS

## OT Rate

Gross Salary / 30 / Duty Hour

---

## OT Amount

OT Hour × OT Rate

---

## Tiffin Amount

Tiffin × Duty Day

---

## Total OT Payable

OT Amount + Tiffin Amount

---

# IMPORTANT

Time Bill is:
NOT merged directly into Salary Sheet.

Reason:
real industrial accounting workflow keeps them separate.

---

# OUTPUTS

- OT Sheet
- OT Summary
- OT Statement
- OT Bank Sheet
- OT Cash Sheet

---

# FUTURE FEATURES

- shift-wise OT
- holiday OT
- OT approval
- OT lock
- OT audit
- OT analytics
