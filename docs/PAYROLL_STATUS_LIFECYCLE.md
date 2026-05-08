# Payroll Status Lifecycle

# CSRM Payroll System

---

# PURPOSE

Defines:

- payroll states
- payroll transitions
- approval lifecycle

---

# PAYROLL STATES

draft
↓
processed
↓
approved
↓
paid

---

# OPTIONAL STATES

- locked
- cancelled
- reopened

---

# STATUS RULES

## Draft

Initial generated payroll.

Editable.

---

## Processed

Reviewed payroll.

Ready for approval.

---

## Approved

Management-approved payroll.

Should become restricted.

---

## Paid

Payment completed.

Should become highly restricted.

---

# LOCK RULE

Locked payroll should not allow:

- normal editing
- recalculation
- deletion

---

# FUTURE FEATURES

- payroll reopen
- payroll correction
- rollback workflow
- approval hierarchy
