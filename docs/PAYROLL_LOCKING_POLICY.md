# Payroll Locking Policy

# CSRM Payroll System

---

# PURPOSE

Defines:

- payroll locking rules
- editing restrictions
- post-approval protection

---

# IMPORTANT PRINCIPLE

Processed payroll data should become progressively restricted.

---

# PAYROLL STATES

draft
→ editable

processed
→ limited edit

approved
→ highly restricted

paid
→ almost immutable

---

# LOCK RULE

Locked payroll should NOT allow:

- recalculation
- deletion
- salary modification
- deduction modification

---

# REOPEN POLICY

Only authorized roles may:

- reopen payroll
- unlock payroll
- perform correction

All reopen actions must create:
audit log entries.

---

# FUTURE FEATURES

- approval hierarchy
- correction workflow
- rollback history
