# Payroll Calculation Rules

# CSRM Payroll System

---

# PURPOSE

Defines:

- salary calculation
- deduction rules
- payable salary logic

---

# CORE FORMULAS

## Per Day Salary

Current standard:

Gross Salary / 30

(or 31 depending on business policy)

---

# ABSENCE DEDUCTION

Deduction =
Gross Salary / 30 × Absence Day

---

# NET SALARY

Gross Salary

- Deduction
- Advance
- Loan
- # Other Deduction
  Net Salary

---

# IMPORTANT RULES

## Paid Leave

No salary deduction.

---

## Unpaid Leave

Salary deduction applicable.

---

## Advance

Employee advance amount should reduce payable salary.

---

## Loan

Loan installment deduction supported.

---

# FUTURE FEATURES

- prorated salary
- joining month calculation
- resignation month calculation
- salary hold
- arrear calculation
- retroactive adjustment

---

# IMPORTANT ARCHITECTURE RULE

Payroll calculation engine should remain:
separate from Time Bill Engine.
