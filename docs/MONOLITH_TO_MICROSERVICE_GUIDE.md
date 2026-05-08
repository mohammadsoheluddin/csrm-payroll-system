# Monolith to Microservice Guide

# CSRM Payroll System

---

# PURPOSE

Defines:
future service separation strategy.

---

# CURRENT ARCHITECTURE

Current architecture:
modular monolith.

Correct for current stage.

---

# IMPORTANT RULE

Do NOT migrate to microservices early.

---

# POSSIBLE FUTURE SERVICES

- Identity Service
- Attendance Service
- Payroll Service
- Reporting Service
- Notification Service

---

# SERVICE SEPARATION CONDITIONS

Only consider separation when:

- scaling becomes difficult
- deployment becomes bottleneck
- module ownership grows
- performance isolation required

---

# FUTURE GOALS

- API Gateway
- gRPC
- message queue
- distributed event architecture
