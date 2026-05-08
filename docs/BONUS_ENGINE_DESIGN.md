# Bonus Engine Design

# CSRM Payroll System

---

# PURPOSE

Bonus Engine manages:

- festival bonus
- incentive bonus
- special bonus
- attendance bonus
- performance bonus

---

# COMMON BONUS TYPES

- Eid Bonus
- Puja Bonus
- Festival Bonus
- Attendance Bonus
- Production Bonus
- Special Incentive

---

# BONUS CALCULATION BASIS

Possible bases:

- gross salary
- basic salary
- fixed amount
- attendance percentage
- service duration

---

# COMMON BUSINESS RULES

## Festival Bonus

Usually:

- 1 gross salary
  OR
- percentage of gross/basic salary

---

## Attendance Bonus

Requires:

- no absence
- no unpaid leave
- attendance threshold

---

# BONUS PROCESSING FLOW

Employee Selection
↓
Bonus Calculation
↓
Bonus Sheet
↓
Bonus Statement
↓
Bank/Cash Distribution
↓
Payment

---

# IMPORTANT

Bonus processing should remain:
separate from monthly salary sheet.

Reason:

- accounting clarity
- audit clarity
- separate approval workflow

---

# FUTURE FEATURES

- bonus hold
- partial bonus
- probation restriction
- bonus eligibility rule engine
- department-wise bonus
- production-based bonus

---

# BONUS OUTPUTS

- Bonus Sheet
- Bonus Statement
- Bonus Bank Sheet
- Bonus Cash Sheet
- Bonus Summary

---

# IMPORTANT ARCHITECTURE RULE

Bonus should become:
independent processing engine,
NOT hardcoded inside salary engine.
