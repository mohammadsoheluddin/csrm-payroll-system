# Part-F14 — Route Lazy Loading + Frontend Performance Optimization

## Status

Completed as a frontend-only performance pass. Backend code was not touched.

## Why this part was needed

Before this part, the frontend router imported most screen modules eagerly. As the app now includes master data, employee, attendance, leave, payroll, reports, audit, and RBAC screens, the initial bundle became large and Vite warned about big chunks.

Part-F14 changes the frontend from an eager route-loading model to a route-level code-splitting model.

## What changed

### 1. Route-level lazy loading

All major route screens are now loaded using React lazy imports:

- Login
- Dashboard
- Master Data
- Employees
- Attendance
- Leave
- Payroll
- Salary structures
- Salary workflow screens
- Reports
- Salary Summary
- Bank Sheets
- Month-End Control
- Audit Logs
- RBAC Audit
- System fallback pages

This keeps the first application shell smaller and loads feature code only when the user opens that module.

### 2. Route Suspense fallback

A shared route fallback was added:

```txt
client/src/app/router/RouteLoadingFallback.tsx
```

This gives users a polished loading state while a route chunk is being downloaded.

### 3. Route prefetch foundation

A prefetch registry was added:

```txt
client/src/app/router/routePreloaders.ts
```

The sidebar now preloads route chunks on hover/focus, so likely navigation feels faster without forcing every module into the initial bundle.

### 4. Post-login warm prefetch

After a successful auth bootstrap, the app now lightly preloads common first-use routes:

- Dashboard
- Employees
- Attendance
- Leave

This improves perceived performance after login without loading every payroll/report/audit module upfront.

## Updated files

```txt
client/src/app/providers/AuthProvider.tsx
client/src/app/router/router.tsx
client/src/app/router/lazyPages.tsx
client/src/app/router/lazyRoute.tsx
client/src/app/router/RouteLoadingFallback.tsx
client/src/app/router/routePreloaders.ts
client/src/components/layout/AppSidebar.tsx
```

## Build result observed during packaging

After Part-F14, Vite generated multiple route-level chunks instead of one very large app bundle. The initial app chunk reduced significantly compared with the previous single large bundle warning.

Observed important chunks during packaging:

```txt
index.js initial app shell: about 226.80 kB / gzip 69.90 kB
Dashboard route chunk: about 369.65 kB / gzip 108.81 kB
Employee route chunk: about 37.48 kB / gzip 8.38 kB
Payroll route chunks: split into separate payroll pages/components
Reports route chunks: split into report pages/components
Audit route chunks: split into audit/RBAC pages
```

## Expected benefits

```txt
Smaller initial browser workload
Faster first app shell rendering
Feature modules load only on demand
Sidebar hover/focus prefetch improves navigation feel
Better foundation for future large modules like B52/B54/B55/B56
Cleaner performance path before pilot usage
```

## Developer notes

The frontend still has room for future optimization:

```txt
Move Recharts-heavy dashboard content into a separate lazy widget chunk
Lazy-load large form panels/drawers inside feature pages
Add bundle visualizer only if needed later
Consider service-worker/cache strategy only near deployment phase
```

## Test checklist

Run:

```bash
cd client
npm run lint
npm run build
npm run dev
```

Then check:

```txt
/login
/dashboard
/employees
/attendance
/leave
/payroll
/salary/structures
/salary/sheets
/salary/statements
/salary/payment-distributions
/reports/center
/reports/salary-summary
/bank-sheets
/audit/logs
/rbac/audit
```

Expected:

```txt
Routes open without runtime errors
Route loading fallback appears briefly on slow network
Sidebar hover/focus does not break navigation
Protected routes still redirect correctly
Permission guards still work
Smoke helper still passes route probes
```
