# Payroll Business Flow

# CSRM Payroll System

This document explains the REAL industrial payroll workflow followed in the company.

---

# OVERVIEW

Payroll processing is NOT a single-sheet process.

The complete payroll ecosystem includes:

1. Attendance
2. Salary Sheet
3. Time Bill / OT Sheet
4. Salary Statement
5. Cash Statement
6. Bank Sheet
7. Festival Bonus
8. Leave Summary
9. Attendance Summary

---

# MAIN MONTH-END FLOW

Attendance Finalization
↓
Salary Sheet Generation
↓
Salary Statement Generation
↓
Bank/Cash Distribution
↓
Bank Sheet Generation
↓
Payment Processing

AND

Attendance Finalization
↓
Time Bill / OT Generation
↓
OT Statement
↓
OT Payment

---

# SALARY SHEET PURPOSE

Salary sheet handles:

- gross salary
- attendance
- absence
- leave
- deductions
- net salary

This is the primary monthly salary processor.

---

# TIME BILL PURPOSE

Time Bill (OT Sheet) is separate.

Handles:

- OT hour
- OT amount
- tiffin
- duty day
- OT total

Time Bill is NOT directly merged into salary sheet.

---

# STATEMENT PURPOSE

Statement sheet distributes payment into:

- bank
- cash
- suspense
- AIT
- other deductions

Statement acts as:
Payroll Accounting Distribution Layer.

---

# BANK SHEET PURPOSE

Generated from statement.

Used for:

- bank processing
- salary transfer
- branch payment

---

# CASH SHEET PURPOSE

Generated for cashier.

Only cash payable amounts are visible.

Bank-related columns remain hidden.

---

# IMPORTANT BUSINESS RULE

Salary Sheet
≠
Time Bill
≠
Statement
≠
Bank Sheet

These are connected but separate engines.

---

# FUTURE ENGINES

- Attendance Engine
- Salary Sheet Engine
- Time Bill Engine
- Statement Engine
- Bank Sheet Engine
- Bonus Engine
