# API Conventions

# CSRM Payroll System

---

# PURPOSE

This document defines:

- API standards
- naming conventions
- response format
- routing structure
- backend consistency rules

for the entire system.

---

# BASE API STRUCTURE

/api/v1/<module>

Example:

/api/v1/employees
/api/v1/payroll
/api/v1/attendance

---

# MODULE STRUCTURE

Each module should contain:

- interface
- model
- validation
- service
- controller
- route

---

# RESPONSE FORMAT

All APIs should use standard response structure:

{
"success": true,
"statusCode": 200,
"message": "Message here",
"data": {}
}

---

# ERROR RESPONSE FORMAT

{
"success": false,
"message": "Validation Error",
"errorSources": [],
"stack": ""
}

---

# HTTP METHOD RULES

GET:
retrieve data

POST:
create data

PATCH:
partial update

DELETE:
soft delete

---

# IMPORTANT RULE

Hard delete should generally be avoided.

Use:
isDeleted = true

---

# CONTROLLER RULES

Controllers should:

- remain thin
- call services
- avoid business logic

---

# SERVICE RULES

Business logic belongs inside:
service layer.

---

# VALIDATION RULES

All request validation:

- must use Zod
- must use validateRequest middleware

---

# AUTHORIZATION RULES

Protected APIs must use:

- auth middleware
- RBAC permission check

---

# FUTURE API GOALS

- pagination standard
- filtering standard
- sorting standard
- API versioning
- audit-aware APIs
