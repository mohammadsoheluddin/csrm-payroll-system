# RBAC Permission Matrix

# CSRM Payroll System

---

# PURPOSE

This document defines:

- system roles
- access permissions
- authorization boundaries

---

# MAIN ROLES

- super_admin
- admin
- hr
- accounts
- manager
- employee

---

# SUPER ADMIN

Full system access.

Can:

- manage everything
- configure system
- manage roles
- access audit

---

# ADMIN

Operational system management.

Can:

- manage HR modules
- manage payroll
- approve workflows

---

# HR

Human resource operations.

Can:

- employee management
- attendance
- leave
- movement
- salary processing

Cannot:

- system-level configuration

---

# ACCOUNTS

Financial processing role.

Can:

- payroll statement
- bank sheet
- cash statement
- payment processing

Cannot:

- HR employee lifecycle management

---

# MANAGER

Department-level visibility.

Can:

- review employees
- approve leave
- monitor attendance

Limited modification rights.

---

# EMPLOYEE

Self-service role.

Can:

- view own attendance
- view own leave
- view own payslip

Cannot:

- access others data

---

# IMPORTANT PRINCIPLE

RBAC should follow:
least privilege principle.

---

# FUTURE FEATURES

- granular permission matrix
- module-level permission
- action-level permission
- delegated approval
- temporary access
