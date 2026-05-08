# Codebase Rules

# CSRM Payroll System

---

# PURPOSE

Defines:

- coding discipline
- backend consistency
- architecture safety

---

# IMPORTANT RULES

## Full File Updates

When modifying architecture-sensitive files:
prefer full file replacement.

---

## Avoid Random Refactor

Do NOT:

- randomly rename APIs
- randomly rename services
- randomly change payload structure

without architectural reason.

---

# IMPORTANT PRINCIPLE

Business workflow stability
is more important than experimental refactor.

---

# MODULE STRUCTURE RULE

Every module should contain:

- interface
- model
- validation
- service
- controller
- route

---

# BUSINESS LOGIC RULE

Business logic belongs inside:
service layer.

Controllers should remain thin.

---

# IMPORTANT PAYROLL RULE

Historical payroll integrity must remain protected.

Old payroll should NOT change due to:

- employee edit
- movement
- department transfer
- salary change

---

# DOCUMENTATION RULE

Important architectural changes should update:
docs/ folder.
