# Production Readiness Checklist

# CSRM Payroll System

---

# PURPOSE

Defines:
minimum production readiness requirements.

---

# BACKEND CHECKS

- build passes
- validation working
- RBAC working
- audit logging working
- error handling working

---

# PAYROLL CHECKS

- duplicate payroll prevention
- payroll approval workflow
- payroll locking
- payroll snapshot preservation

---

# EXPORT CHECKS

- PDF export
- Excel export
- bank sheet export

---

# SECURITY CHECKS

- JWT security
- environment variables
- permission enforcement

---

# IMPORTANT RULE

Production deployment should happen ONLY after:
successful operational testing.
