# Part-F1 — Frontend Project Setup

Last Updated: 2026-05-12  
Project: CSRM Payroll System  
Status: Frontend setup foundation prepared / Business UI not started

---

## 1. Purpose

Part-F1 converts the existing default Vite React starter inside `client/` into a CSRM Payroll frontend foundation.

This part does **not** implement business screens yet. It prepares the frontend environment so the next parts can safely build layout, authentication, protected routing, API integration, permission guards, and dashboard features.

---

## 2. What Changed

### Updated core frontend setup

```txt
client/package.json
client/vite.config.ts
client/tsconfig.app.json
client/src/main.tsx
client/src/App.tsx
client/src/App.css
client/src/index.css
```

### Added app foundation

```txt
client/src/app/App.tsx
client/src/app/providers/AppProviders.tsx
client/src/app/providers/QueryProvider.tsx
client/src/app/providers/ThemeProvider.tsx
client/src/app/router/router.tsx
client/src/app/router/routeConfig.tsx
client/src/app/router/ProtectedRoute.tsx
```

### Added base layout foundation

```txt
client/src/components/layout/AppLayout.tsx
client/src/components/layout/AppHeader.tsx
client/src/components/layout/AppSidebar.tsx
```

### Added shared placeholders

```txt
client/src/components/feedback/LoadingState.tsx
client/src/components/feedback/ErrorState.tsx
client/src/components/feedback/EmptyState.tsx
client/src/components/guards/Can.tsx
client/src/components/guards/PermissionGuard.tsx
```

### Added frontend config foundation

```txt
client/src/config/env.ts
client/src/config/routePaths.ts
client/src/config/roles.ts
client/src/config/permissions.ts
client/src/config/sidebar.config.tsx
```

### Added frontend utilities/types/store

```txt
client/src/lib/utils/cn.ts
client/src/stores/theme.store.ts
client/src/types/api.types.ts
```

### Added placeholder pages

```txt
client/src/features/auth/pages/LoginPage.tsx
client/src/features/dashboard/pages/DashboardPage.tsx
client/src/features/system/pages/ForbiddenPage.tsx
client/src/features/system/pages/SessionExpiredPage.tsx
client/src/features/system/pages/NotFoundPage.tsx
```

---

## 3. Final Part-F1 Dependency Set

Part-F1 prepares the dependency list for the approved frontend stack:

```txt
react
react-dom
react-router-dom
@tanstack/react-query
axios
react-hook-form
@hookform/resolvers
zod
lucide-react
recharts
sonner
zustand
clsx
tailwind-merge
class-variance-authority
date-fns
tailwindcss
@tailwindcss/vite
```

---

## 4. Environment Variable Standard

Create this file locally if not already created:

```txt
client/.env
```

Recommended content:

```env
VITE_APP_NAME="CSRM Payroll System"
VITE_API_BASE_URL="http://localhost:5000/api/v1"
```

The frontend currently falls back to:

```txt
http://localhost:5000/api/v1
```

---

## 5. Current Route Shell

Part-F1 creates only the frontend setup shell:

| Route | Purpose |
| --- | --- |
| `/` | Redirects to `/dashboard` |
| `/login` | Placeholder login page |
| `/dashboard` | Frontend setup dashboard shell |
| `/forbidden` | 403 placeholder page |
| `/session-expired` | Session expired placeholder page |
| `*` | 404 placeholder page |

Full protected route and real auth logic will start in Part-F3.

---

## 6. Permission Foundation

`client/src/config/permissions.ts` is synced from:

```txt
server/src/modules/user/user.constant.ts
```

Important:

```txt
Frontend permission guard is for UX only.
Backend RBAC remains the real security layer.
```

Actual permission enforcement in sidebar/buttons will be implemented in Part-F5.

---

## 7. Theme Foundation

Part-F1 adds:

```txt
light theme
dark theme
system theme setting
CSS variable based theme foundation
Zustand persisted theme store
```

Future theme styles such as Corporate Blue, Compact ERP, and Modern Dashboard can be layered on top without changing business logic.

---

## 8. Testing Procedure

From project root:

```bash
cd client
npm install
npm run lint
npm run build
npm run dev
```

Open:

```txt
http://localhost:5173
```

Expected result:

```txt
/ redirects to /dashboard
Dashboard shows Part-F1 frontend setup foundation
Sidebar is visible on large screen
Theme toggle works
/login opens placeholder login page
/forbidden opens forbidden page
/session-expired opens session expired page
unknown route opens 404 page
```

---

## 9. Important Notes

- Do not start business UI screens before Part-F2 and Part-F3 foundations are done.
- Do not wire API calls in random page components.
- Keep backend locked except bug fixes, route corrections, integration compatibility fixes, permission corrections, and documentation sync.
- Report/system routes must follow `docs/BACKEND_KNOWN_ROUTE_AND_DATA_NOTES.md` during later integration.

---

## 10. Next Part

```txt
Part-F2 — Layout + Routing + Theme Foundation
```

Part-F2 should expand the app layout, mobile sidebar behavior, route groups, page shell patterns, theme selector UI, and dashboard layout frame.
