# Attendance Finalization Flow

# CSRM Payroll System

---

# PURPOSE

Attendance Finalization is the monthly process that prepares attendance data for:

- salary sheet
- time bill
- leave impact
- payroll deduction

This is one of the most critical payroll stages.

---

# MONTH-END FLOW

Raw Attendance
↓
Attendance Review
↓
Leave Adjustment
↓
Holiday Adjustment
↓
Manual Correction
↓
Attendance Finalization
↓
Salary Sheet / Time Bill Processing

---

# FINALIZATION RESPONSIBILITIES

- verify attendance
- verify absence
- verify leave
- verify holiday duty
- verify replacement duty
- lock attendance period

---

# IMPORTANT BUSINESS RULES

## After Finalization

Attendance should become:
locked for normal editing.

Only authorized correction should be allowed.

---

## Leave Impact

Paid Leave:
does NOT reduce salary.

Unpaid Leave:
reduces salary.

---

## Replacement Duty

If employee works on holiday:

- replacement eligibility may be created
- replacement leave validation required

---

# FUTURE FEATURES

- attendance freeze
- attendance approval
- attendance audit
- attendance reopen workflow
- attendance discrepancy report

---

# IMPORTANT ARCHITECTURE RULE

Salary Sheet and Time Bill must consume:
finalized attendance only.
