# Security Guidelines

# CSRM Payroll System

---

# PURPOSE

Defines:
security principles and safe development practices.

---

# AUTHENTICATION

Use:
JWT-based authentication.

---

# AUTHORIZATION

Use:
RBAC permission checks.

---

# IMPORTANT SECURITY AREAS

- payroll
- payment
- employee bank info
- audit logs

---

# IMPORTANT RULES

## Never expose:

- password
- JWT secret
- sensitive env data

---

# IMPORTANT PAYROLL RULE

Only authorized users should:

- process payroll
- approve payroll
- lock payroll
- generate bank sheet

---

# FUTURE FEATURES

- refresh token rotation
- MFA
- audit alert
- suspicious activity monitoring
