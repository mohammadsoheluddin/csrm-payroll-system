# Part-49.3 — Audit Log Hardening

Status: Implemented  
Scope: Backend audit log consistency, risk tagging, sensitive audit view, RBAC denial audit

---

## 1. Purpose

Part-49.3 hardens the audit log system so that sensitive backend actions can be monitored more clearly.

This part does not change payroll calculation business rules. It improves audit visibility and governance.

---

## 2. What Changed

### 2.1 Risk Level Added

Audit logs now support `riskLevel`:

- `low`
- `medium`
- `high`
- `critical`

Examples:

| Action | Risk |
| ------ | ---- |
| read | low |
| create/update/generate/export | medium |
| soft_delete/restore/approve/reject/lock/unlock/permission_denied | high |
| pay/unlock on payroll/payment-sensitive modules | critical |

---

### 2.2 Category Added

Audit logs now support `category`:

- `authentication`
- `authorization`
- `data_access`
- `data_mutation`
- `approval`
- `lock_control`
- `export`
- `payroll_process`
- `system`
- `general`

This will help the future Audit UI to group logs professionally.

---

### 2.3 Sensitive Audit Endpoint Added

New endpoint:

```http
GET /api/v1/audit-logs/sensitive
```

It returns high-risk or sensitive action logs such as:

- permission denied
- role change
- soft delete
- restore
- approve/reject
- lock/unlock
- payment
- export/download

---

### 2.4 Permission Denied Audit Added

The `requirePermission` middleware now creates an audit log when a user is authenticated but lacks required permission.

This is important for:

- RBAC investigation
- unauthorized access attempts
- user support
- governance reporting

The business request is still blocked with `403 Forbidden`, but the denial is recorded safely.

---

### 2.5 Sensitive Data Redaction Added

Audit payloads are sanitized before saving.

Sensitive keys are redacted:

- password
- oldPassword
- newPassword
- confirmPassword
- token
- accessToken
- refreshToken
- authorization
- cookie
- secret
- jwt
- apiKey
- pin
- otp

Example stored value:

```json
{
  "password": "[REDACTED]"
}
```

---

## 3. New / Updated Query Options

Audit log list now supports:

```http
GET /api/v1/audit-logs?riskLevel=high
GET /api/v1/audit-logs?category=authorization
GET /api/v1/audit-logs?sensitiveOnly=true
GET /api/v1/audit-logs?includeData=false
```

Sensitive endpoint supports:

```http
GET /api/v1/audit-logs/sensitive
GET /api/v1/audit-logs/sensitive?riskLevel=critical
GET /api/v1/audit-logs/sensitive?module=payroll
GET /api/v1/audit-logs/sensitive?includeData=false
```

---

## 4. Updated Summary Output

Audit summary now includes:

- byModule
- byAction
- byActorRole
- byNetworkType
- byDeviceType
- byRiskLevel
- byCategory
- highRiskCount
- criticalRiskCount
- recent sensitive logs

Endpoint:

```http
GET /api/v1/audit-logs/summary
```

---

## 5. Postman Test Guide

### 5.1 Admin Can Read Audit Logs

```http
GET {{baseUrl}}/audit-logs
```

Expected:

```txt
200 OK
```

---

### 5.2 Sensitive Logs

```http
GET {{baseUrl}}/audit-logs/sensitive
```

Expected:

```txt
200 OK
```

---

### 5.3 High Risk Filter

```http
GET {{baseUrl}}/audit-logs?riskLevel=high
```

Expected:

```txt
200 OK
```

---

### 5.4 Category Filter

```http
GET {{baseUrl}}/audit-logs?category=authorization
```

Expected:

```txt
200 OK
```

---

### 5.5 Permission Denied Audit Test

Use an employee token and hit a restricted route, for example:

```http
GET {{baseUrl}}/payroll
```

Expected response:

```txt
403 Forbidden
```

Then login as admin and check:

```http
GET {{baseUrl}}/audit-logs?action=permission_denied
```

Expected:

```txt
permission_denied audit log should appear
```

---

## 6. Files Changed

```txt
server/src/middleware/requirePermission.ts
server/src/modules/auditLog/auditLog.interface.ts
server/src/modules/auditLog/auditLog.model.ts
server/src/modules/auditLog/auditLog.utils.ts
server/src/modules/auditLog/auditLog.service.ts
server/src/modules/auditLog/auditLog.controller.ts
server/src/modules/auditLog/auditLog.route.ts
server/src/modules/auditLog/auditLog.validation.ts
docs/PART_49_3_AUDIT_LOG_HARDENING.md
```

---

## 7. Build Commands

```bash
cd server
npm run typecheck
npm run build:clean
npm run dev
```

---

## 8. Next Part

Recommended next part:

```txt
Part-49.4 — Validation Standardization Pass
```
