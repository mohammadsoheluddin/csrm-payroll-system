# Error Handling Standard

# CSRM Payroll System

---

# PURPOSE

This document defines:

- error handling rules
- API error standards
- validation handling

---

# STANDARD ERROR FLOW

throw AppError
↓
globalErrorHandler
↓
formatted response

---

# COMMON ERROR TYPES

- Validation Error
- Authentication Error
- Authorization Error
- Database Error
- Business Rule Error
- Duplicate Error

---

# VALIDATION ERRORS

Use:
Zod validation.

Validation must happen before controller execution.

---

# BUSINESS RULE ERRORS

Examples:

- duplicate payroll
- invalid leave
- locked payroll update
- invalid movement

---

# IMPORTANT RULE

Never expose:

- internal DB details
- sensitive stack info
- secrets

in production response.

---

# ERROR RESPONSE STRUCTURE

{
"success": false,
"message": "Error message",
"errorSources": [],
"stack": ""
}

---

# FUTURE FEATURES

- error codes
- localization
- structured logging
- centralized monitoring
