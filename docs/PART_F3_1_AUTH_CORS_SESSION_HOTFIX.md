# Part-F3.1 — Auth CORS + Session Bootstrap Hotfix

## Problem

During Part-F3 browser testing, the frontend stayed on:

```txt
Checking session
Please wait while we verify your login session.
```

Chrome console showed:

```txt
Access to XMLHttpRequest at 'http://localhost:5000/api/v1/auth/refresh-token'
from origin 'http://localhost:5173' has been blocked by CORS policy.
The value of the 'Access-Control-Allow-Origin' header in the response must not be '*'
when the request's credentials mode is 'include'.
```

## Root causes

1. Backend used `app.use(cors())`, which returns wildcard origin by default.
2. Frontend Axios uses `withCredentials: true` because refresh token is stored as an HTTP-only cookie.
3. Browser credentialed CORS requests cannot use `Access-Control-Allow-Origin: *`.
4. React dev StrictMode can run effects twice. The previous AuthProvider bootstrap guard could leave auth status stuck in `checking` during development.

## Fixed files

```txt
server/src/app.ts
client/src/app/providers/AuthProvider.tsx
```

## Expected behavior after fix

- `/dashboard` while logged out should redirect to `/login`.
- `/login` should show the login form, not checking session forever.
- Refresh token calls should no longer be blocked by browser CORS.
- If refresh token is missing/expired, frontend should set unauthenticated state.

## Test commands

Backend:

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run dev
```

Frontend:

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
npm run dev
```

Browser:

```txt
http://localhost:5173/login
http://localhost:5173/dashboard
```
