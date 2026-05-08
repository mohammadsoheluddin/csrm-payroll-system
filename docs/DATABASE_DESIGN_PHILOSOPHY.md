# Database Design Philosophy

# CSRM Payroll System

---

# PURPOSE

Defines:

- database design principles
- entity relationships
- data preservation strategy

---

# MAIN DATABASE PRINCIPLES

- preserve historical integrity
- avoid destructive updates
- preserve payroll snapshot
- support audit tracking

---

# IMPORTANT RULE

Payroll history should remain immutable.

Future employee changes should NOT modify old payroll records.

---

# CORE ENTITIES

- Employee
- Attendance
- Leave
- Salary Structure
- Payroll
- Employee Movement
- Employee Bank Info

---

# SNAPSHOT STRATEGY

Payroll stores:
employee snapshot +
salary snapshot +
payment snapshot

Reason:
future employee updates must not break historical payroll.

---

# SOFT DELETE STRATEGY

Most entities should use:

isDeleted = true

Avoid hard delete.

---

# FUTURE DATABASE GOALS

- indexing optimization
- archival strategy
- reporting optimization
- analytics-ready structure
