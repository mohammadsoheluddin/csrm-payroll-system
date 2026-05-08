# Postman Testing Strategy

# CSRM Payroll System

---

# PURPOSE

Defines:
API testing philosophy and workflow.

---

# IMPORTANT RULE

Backend correctness comes BEFORE frontend.

---

# TESTING FLOW

Authentication
↓
RBAC
↓
CRUD
↓
Business Logic
↓
Approval Workflow
↓
Export APIs

---

# IMPORTANT PAYROLL TESTS

- duplicate payroll prevention
- payroll lifecycle
- payroll lock
- audit validation
- bank distribution

---

# ROLE-BASED TESTING

Separate collections for:

- super_admin
- hr
- accounts
- manager
- employee

---

# FUTURE FEATURES

- automated collection
- environment config
- Newman automation
