# Attendance Status Matrix

# CSRM Payroll System

---

# PURPOSE

Defines:

- attendance statuses
- payroll impact
- leave relationship

---

# STATUS TYPES

| Status           | Salary Impact | OT Impact     |
| ---------------- | ------------- | ------------- |
| Present          | Normal        | Eligible      |
| Absent           | Deduction     | Not Eligible  |
| Paid Leave       | No Deduction  | Usually No OT |
| Unpaid Leave     | Deduction     | No OT         |
| Holiday          | No Deduction  | Possible OT   |
| Duty             | Normal        | Possible OT   |
| Replacement Duty | Normal        | Possible OT   |

---

# IMPORTANT RULES

Attendance status should become:
single source of truth.

---

# FUTURE FEATURES

- half day
- late deduction
- shift attendance
- attendance scoring
