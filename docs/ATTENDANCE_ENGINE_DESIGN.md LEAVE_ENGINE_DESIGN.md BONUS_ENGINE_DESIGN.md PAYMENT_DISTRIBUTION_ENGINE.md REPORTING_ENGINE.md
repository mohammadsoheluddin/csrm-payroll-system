# Attendance Engine Design

# CSRM Payroll System

---

# PURPOSE

Attendance Engine is the foundational engine of the payroll ecosystem.

Almost all major systems depend on attendance:

- salary sheet
- time bill
- leave
- deductions
- replacement leave
- holiday processing
- reporting

---

# CORE RESPONSIBILITIES

Attendance Engine manages:

- daily attendance
- present
- absent
- leave
- holiday
- late
- manual correction
- attendance summary
- payroll attendance calculation

---

# ATTENDANCE SOURCES

## Manual Entry

HR/Admin manually inputs attendance.

---

## Biometric Device

Future support:

- punch machine
- fingerprint device
- attendance sync

---

# DAILY STATUS TYPES

- Present
- Absent
- Leave
- Holiday
- Weekly Holiday
- Late
- Half Day
- Duty
- Replacement Duty

---

# IMPORTANT BUSINESS RULES

## Weekly Holiday

Currently:
Friday is standard holiday for most employees.

Future:
employee-specific weekly holiday support possible.

---

## Leave Impact

Paid Leave:
does NOT reduce salary.

Unpaid Leave:
reduces salary.

---

## Replacement Leave

If employee works on holiday:

- replacement leave may be granted later
- must validate attendance existence
- must validate holiday duty

---

# FUTURE ATTENDANCE FEATURES

- shift attendance
- night shift
- overtime eligibility
- auto late deduction
- attendance approval
- attendance lock
- biometric reconciliation
- attendance audit

---

# ATTENDANCE OUTPUTS

Attendance Engine feeds:

- Salary Sheet Engine
- Time Bill Engine
- Leave Engine
- Attendance Summary
- Reporting Engine

---

# IMPORTANT ARCHITECTURE RULE

Attendance should become:
single source of truth.

Other engines should consume attendance output instead of recalculating independently.
