# CSRM Payroll System — Frontend API, Auth, and Permission Strategy

Last Updated: 2026-05-12  
Related Part: Part-F0 — Frontend Architecture Blueprint & Folder Structure

---

## 1. Purpose

This document defines the frontend API client, authentication, token handling, backend error handling, and frontend permission guard strategy.

---

## 2. API Base URL

Use `.env`:

```txt
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 3. Auth Flow

Backend login route:

```http
POST /auth/login
```

Backend login behavior:

```txt
Response data contains accessToken.
refreshToken is set as httpOnly cookie.
```

Frontend login flow:

```txt
submit email/password
receive accessToken
store accessToken in auth store
load /users/me
build current session
redirect to /dashboard
```

Recommended app boot flow:

```txt
try refresh token using POST /auth/refresh-token
if accessToken returned, load /users/me
if refresh fails, stay logged out
```

Logout flow:

```txt
POST /auth/logout
clear access token
clear auth store
redirect to /login
```

---

## 4. Token Handling

Recommended first implementation:

```txt
accessToken: memory store through Zustand/auth store
refreshToken: backend httpOnly cookie
axios: withCredentials true
```

Development fallback:

```txt
If refresh cookie integration is unstable during local Vite development,
localStorage accessToken persistence may be used temporarily.
Document that choice clearly before production.
```

---

## 5. Axios Interceptor Strategy

Request interceptor:

```txt
read accessToken
add Authorization: Bearer accessToken
set withCredentials true
```

Response interceptor:

```txt
if 401 and request was not retried:
  call /auth/refresh-token
  save new accessToken
  retry original request
if refresh fails:
  clear auth
  redirect /session-expired or /login
```

---

## 6. Backend Response Types

Success:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorSources": [
    {
      "path": "body.company",
      "message": "Invalid company ID"
    }
  ]
}
```

---

## 7. Error UI Strategy

| Status | UI Behavior |
| --- | --- |
| 400 | show validation toast and map field errors |
| 401 | refresh once, then redirect session expired/login |
| 403 | show forbidden page or permission message |
| 404 | show not found, but check known route notes for report/system routes |
| 409 | show business-rule conflict modal/message |
| 500 | show system error with retry option |

---

## 8. Permission Strategy

Backend source file:

```txt
server/src/modules/user/user.constant.ts
```

Important:

```txt
/users/me currently returns user profile, not permissions array.
Frontend should derive permissions from role using a synced frontend permission map.
```

Frontend files planned:

```txt
client/src/config/roles.ts
client/src/config/permissions.ts
client/src/components/guards/Can.tsx
client/src/components/guards/PermissionGuard.tsx
client/src/app/router/ProtectedRoute.tsx
```

Permission rule:

```txt
super_admin and admin receive all permissions.
Other roles receive permissions according to the backend role permission map.
```

Frontend guard examples:

```txt
Payroll menu visible -> payroll:read
Generate payroll button visible -> payroll:process
Approve payroll button visible -> payroll:approve
Create employee button visible -> employee:manage
Audit log visible -> audit_log:read
```

---

## 9. Known Route Notes for Frontend

Do not call these as base list routes during frontend development:

```http
GET /report-center
GET /month-end-process-control
GET /rbac-audit
GET /payroll-reports
GET /bank-sheets
```

Use known sub-routes instead:

```http
GET /report-center/catalog
GET /report-center/dashboard?company={companyId}&month=5&year=2026
GET /report-center/readiness?company={companyId}&month=5&year=2026
GET /month-end-process-control/status?company={companyId}&month=5&year=2026
GET /month-end-process-control/checklist?company={companyId}&month=5&year=2026
GET /rbac-audit/summary
GET /rbac-audit/coverage
GET /payroll-reports/monthly-report?month=5&year=2026&company={companyId}
GET /bank-sheets/salary/preview?month=5&year=2026&company={companyId}
```

---

## 10. Download Strategy

For PDF/Excel/CSV export:

```txt
axios responseType: blob
read content-type
read content-disposition filename if available
fallback filename by report type/month/year
show loading per export button
show readable error if backend returns JSON error instead of file blob
```

Export routes should be centralized in module API service files, not hard-coded inside page components.
