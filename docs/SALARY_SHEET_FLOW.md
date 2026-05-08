# Salary Sheet Flow

# CSRM Payroll System

---

# PURPOSE

Salary Sheet is the main monthly salary processing engine.

It calculates:

- salary
- deductions
- attendance impact
- leave impact
- net salary

---

# INPUTS

## Employee Data

- employee
- department
- designation
- salary structure

## Attendance Data

- present
- absent
- leave
- holiday
- late

## Leave Data

- paid leave
- unpaid leave
- replacement leave

## Deduction Data

- advance
- loan
- absence deduction
- other deduction

---

# CORE FORMULAS

## Per Day Salary

Currently:
Gross Salary / 30

(or 31 depending on month)

---

## Absence Deduction

Gross Salary / 30 × Absence

---

## Net Salary

Gross Salary

- deductions
  = Net Salary

---

# IMPORTANT

Salary Sheet DOES NOT directly include:

- OT processing
- Time Bill processing

OT remains separate.

---

# OUTPUTS

Salary Sheet generates:

- employee net salary
- payroll data
- statement source data
- bank distribution source data

---

# FUTURE FEATURES

- salary hold
- attendance deduction engine
- loan auto deduction
- advance auto deduction
- increment impact
- effective-date salary calculation
