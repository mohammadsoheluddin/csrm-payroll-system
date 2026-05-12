# Part-F3 — Auth + Token + Protected Routes

## Status

Completed as frontend foundation work.

This part connects the React/Vite frontend with the backend authentication flow without starting business CRUD/report screens.

## Backend routes used

Base URL is controlled by:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Auth and profile routes:

```txt
POST /auth/login
POST /auth/refresh-token
POST /auth/logout
GET  /users/me
```

Backend behavior confirmed from repo:

- `POST /auth/login` returns `data.accessToken`.
- `POST /auth/login` sets `refreshToken` as an HTTP-only cookie.
- `POST /auth/refresh-token` returns a new `data.accessToken` using the cookie.
- `GET /users/me` requires `Authorization: Bearer <accessToken>`.
- `POST /auth/logout` clears the refresh cookie.

## Frontend auth strategy

Access-token strategy:

- Access token is kept in Zustand app state only.
- Access token is attached to API requests through the Axios request interceptor.
- The frontend does not persist the access token in localStorage/sessionStorage in Part-F3.
- On browser reload, `AuthProvider` attempts `POST /auth/refresh-token` using the HTTP-only refresh cookie.
- If refresh succeeds, frontend calls `GET /users/me` and restores the session.
- If refresh fails, user becomes unauthenticated and protected routes redirect to `/login`.

Refresh behavior:

- Axios response interceptor retries one failed 401 request after calling `/auth/refresh-token`.
- If refresh fails, auth state is cleared and the user is redirected to `/session-expired`.
- Login/register/refresh routes skip automatic refresh retry to avoid loops.

## Protected routes

`ProtectedRoute` now enforces:

1. Session checking state.
2. Redirect to `/login` when unauthenticated.
3. Permission check against the frontend role-permission map.
4. Redirect to `/forbidden` when authenticated but not authorized.

Public-only route:

- `/login` is wrapped with `PublicOnlyRoute`.
- Authenticated users opening `/login` are redirected back to the previous protected page or `/dashboard`.

## Permission strategy

The frontend uses role-permission mapping in:

```txt
client/src/config/permissions.ts
client/src/config/roles.ts
```

Important note:

- Backend `/users/me` currently returns profile fields such as `_id`, `name`, `email`, `role`, etc.
- It does not return a permissions array yet.
- Therefore, Part-F3 derives frontend permission checks from the synced frontend role-permission map.
- If backend later exposes permissions in `/users/me`, frontend can switch to backend-provided permissions.

## New files

```txt
client/.env.example
client/src/app/providers/AuthProvider.tsx
client/src/app/router/PublicOnlyRoute.tsx
client/src/features/auth/api/auth.api.ts
client/src/features/auth/schemas/login.schema.ts
client/src/lib/api/apiError.ts
client/src/lib/api/httpClient.ts
client/src/stores/auth.store.ts
client/src/types/auth.types.ts
```

## Updated files

```txt
client/src/app/providers/AppProviders.tsx
client/src/app/router/ProtectedRoute.tsx
client/src/app/router/router.tsx
client/src/components/guards/Can.tsx
client/src/components/guards/PermissionGuard.tsx
client/src/components/layout/AppHeader.tsx
client/src/features/auth/pages/LoginPage.tsx
client/src/features/dashboard/pages/DashboardPage.tsx
client/src/features/system/pages/ForbiddenPage.tsx
client/src/features/system/pages/SessionExpiredPage.tsx
```

## Manual test checklist

### Backend must be running

From project root or server folder, run the backend the same way used during backend smoke tests.

Example:

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run dev
```

Backend API should be available at:

```txt
http://localhost:5000/api/v1
```

### Frontend commands

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm install
npm run lint
npm run build
npm run dev
```

### Browser tests

Open:

```txt
http://localhost:5173/dashboard
```

Expected if not logged in:

```txt
Redirects to /login
```

Login with a valid backend user created during backend testing.

Expected after login:

```txt
Redirects to /dashboard
Header shows logged-in user name and role
Logout button appears
```

Refresh browser on dashboard.

Expected when refresh cookie is valid:

```txt
Session restores automatically
Dashboard remains accessible
```

Open a route that current role does not have permission for.

Expected:

```txt
Redirects to /forbidden
```

Click logout.

Expected:

```txt
Backend logout is called
Frontend auth state clears
Redirects to /login
```

## Validation result

Tested locally inside generated package:

```bash
npm run lint
npm run build
```

Result:

```txt
Lint passed
Build passed
```

Vite may show a chunk-size warning after build because frontend dependencies now include routing, forms, Zod, Axios, icons, charts, query, and UI utilities. This is acceptable for Part-F3 foundation. Code-splitting can be improved later when business screens grow.

## Next logical part

```txt
Part-F4 — API Client + Error Handling Foundation
```
