# Part-F2 — Layout + Routing + Theme Foundation

## Status

Completed and locally verified.

```txt
npm run lint  ✅ passed
npm run build ✅ passed
```

## Purpose

Part-F2 locks the frontend application shell before starting authentication, API integration, or business CRUD/report screens.

This part intentionally does **not** implement real module data screens. It only prepares the frontend navigation/layout foundation so the next parts can be added safely.

## What was completed

### 1. Responsive ERP layout shell

Implemented a CSRM Payroll admin layout with:

- Desktop sidebar
- Mobile sidebar drawer
- Sticky app header
- Main content container
- Header breadcrumb support
- Search placeholder area
- Notification placeholder button
- Sidebar collapse/expand state

### 2. Route map foundation

Created a centralized route metadata system in:

```txt
client/src/app/router/routeConfig.tsx
```

Each route now carries:

- Path
- Title
- Short title
- Description
- Section
- Breadcrumbs
- Required permissions metadata
- Planned/ready status

This creates a safe foundation for future protected routing and permission checks.

### 3. Placeholder route pages

All major frontend routes now open a consistent placeholder page instead of 404.

This proves that the sidebar, breadcrumb, route metadata, and layout shell are wired correctly before real screens begin.

### 4. Sidebar structure

Sidebar is now grouped by business area:

- Overview
- Administration
- HR Operations
- Payroll Engine
- Reports & Control
- Settings

Nested links are already mapped for major CSRM Payroll modules.

### 5. Theme foundation

Theme support now includes:

- Light mode
- Dark mode
- System mode
- Color presets
  - Default Blue
  - CSRM Steel
  - Emerald HR
  - Indigo Admin
- Persistent preferences through Zustand/localStorage
- Global CSS variable strategy

### 6. Layout preference foundation

Layout state now includes:

- Desktop sidebar collapsed/expanded state
- Mobile sidebar open/close state
- Comfortable / compact density

### 7. Reusable UI foundation

Added starter reusable components:

```txt
client/src/components/ui/Button.tsx
client/src/components/ui/Badge.tsx
client/src/components/ui/Card.tsx
```

These are intentionally minimal and project-owned. More reusable data table/form/modal/report components will come in future parts.

## Important frontend route notes

Frontend report routes are intentionally different from backend API routes.

Example frontend page route:

```txt
/reports/center
```

Backend API routes must still follow documented backend sub-routes, such as:

```txt
/report-center/catalog
/report-center/dashboard?company={{companyId}}&month=5&year=2026
/report-center/readiness?company={{companyId}}&month=5&year=2026
/month-end-process-control/status?company={{companyId}}&month=5&year=2026
/rbac-audit/summary
/rbac-audit/coverage
/bank-sheets/salary/preview?month=5&year=2026&company={{companyId}}
```

Do not assume every backend base route supports `GET /`.

## Updated files

```txt
client/src/app/providers/ThemeProvider.tsx
client/src/app/router/ProtectedRoute.tsx
client/src/app/router/routeConfig.tsx
client/src/app/router/router.tsx
client/src/components/layout/AppHeader.tsx
client/src/components/layout/AppLayout.tsx
client/src/components/layout/AppSidebar.tsx
client/src/components/layout/MobileSidebar.tsx
client/src/components/navigation/AppBreadcrumbs.tsx
client/src/components/ui/Badge.tsx
client/src/components/ui/Button.tsx
client/src/components/ui/Card.tsx
client/src/config/routePaths.ts
client/src/config/sidebar.config.tsx
client/src/features/dashboard/pages/DashboardPage.tsx
client/src/features/settings/ThemeSettingsPage.tsx
client/src/features/system/pages/ModulePlaceholderPage.tsx
client/src/index.css
client/src/lib/router/routeLookup.ts
client/src/stores/layout.store.ts
client/src/stores/theme.store.ts
docs/PART_F2_LAYOUT_ROUTING_THEME_FOUNDATION.md
```

## Local testing guide

From client folder:

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
npm run dev
```

Open:

```txt
http://localhost:5173/
```

Expected checks:

1. `/` redirects to `/dashboard`.
2. Dashboard opens with Part-F2 status cards.
3. Desktop sidebar shows grouped navigation.
4. Sidebar collapse button works on desktop.
5. Mobile sidebar opens with hamburger button on smaller screens.
6. Header breadcrumb changes per page.
7. Theme buttons switch light/dark/system mode.
8. `/settings/theme` opens theme settings page.
9. Theme preset buttons update global UI colors.
10. Placeholder routes open for modules instead of 404.
11. `/login`, `/forbidden`, `/session-expired`, and unknown route still work.

## Next logical part

```txt
Part-F3 — Auth + Token + Protected Routes
```

Part-F3 should connect:

- Login form
- Backend auth endpoint
- Access token memory/storage strategy
- Refresh token cookie strategy
- `/users/me`
- Auth store
- Protected route enforcement
- Session expired behavior
- Role/permission derivation foundation
