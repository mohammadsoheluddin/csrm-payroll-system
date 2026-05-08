# Payment Distribution Engine

# CSRM Payroll System

---

# PURPOSE

Payment Distribution Engine handles:

- bank distribution
- cash distribution
- suspense deduction
- AIT deduction
- payment splitting

This acts as:
Payroll Accounting Layer.

---

# INPUT SOURCES

- Salary Sheet
- Time Bill
- Bonus Sheet

---

# CORE RESPONSIBILITIES

## Deduction Processing

- suspense
- AIT
- loan
- advance
- other deduction

---

## Payment Split

Each employee may receive:

- full bank payment
- full cash payment
- partial bank + partial cash

System must support all combinations.

---

# OUTPUT TYPES

- Salary Statement
- Cash Statement
- Bank Sheet
- Payment Summary

---

# IMPORTANT BUSINESS RULE

Cash department should NOT see:
bank-related columns.

Bank sheet should NOT include:
cash-related payable amount.

Different printable views required.

---

# FUTURE FEATURES

- payment approval
- payment lock
- bank export format
- branch-wise payment
- payment audit
- payment history

---

# PAYMENT OUTPUTS

- Bank Sheet
- Cash Sheet
- Payment Summary
- Accounting Summary

---

# IMPORTANT ARCHITECTURE RULE

Payment Distribution Engine should remain:
separate from salary calculation engine.
