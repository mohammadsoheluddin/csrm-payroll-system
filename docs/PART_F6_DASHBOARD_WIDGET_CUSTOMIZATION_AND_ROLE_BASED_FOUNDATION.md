# Part-F6 — Dashboard Widget Customization + Role-Based Dashboard Foundation

## Status

Completed.

## Purpose

Part-F6 converts the dashboard from a static foundation/status page into a configurable role-based ERP dashboard foundation. It does not connect live business analytics yet. It prepares the UI structure so future module dashboards can be connected without redesigning the dashboard layout.

## What Was Added

- Central dashboard widget registry.
- Role-wise dashboard widget visibility.
- Permission-aware dashboard quick actions.
- Local dashboard preference storage using Zustand persist.
- Widget hide/show controls.
- Widget ordering controls.
- Comfortable/compact dashboard density control.
- Salary Summary B51 dashboard entry card.
- Payroll trend chart placeholder using Recharts.
- Dashboard metrics/status strip.
- Implementation roadmap widget.

## Important Files

```txt
client/src/features/dashboard/pages/DashboardPage.tsx
client/src/features/dashboard/config/dashboardWidgets.tsx
client/src/features/dashboard/data/dashboardFoundationData.ts
client/src/features/dashboard/components/DashboardHero.tsx
client/src/features/dashboard/components/DashboardMetricStrip.tsx
client/src/features/dashboard/components/DashboardWidgetGrid.tsx
client/src/features/dashboard/components/DashboardWidgetContent.tsx
client/src/features/dashboard/components/DashboardWidgetSettingsPanel.tsx
client/src/features/dashboard/components/DashboardQuickActionGrid.tsx
client/src/features/dashboard/components/DashboardPayrollTrendChart.tsx
client/src/stores/dashboard.store.ts
client/src/types/dashboard.types.ts
```

## Dashboard Customization Strategy

Current dashboard preferences are stored locally in browser storage under:

```txt
csrm-dashboard-preferences
```

This is enough for frontend foundation and pilot UI testing. Later, user-specific dashboard preferences can be persisted in backend by adding a user preference module.

## Role-Based Dashboard Strategy

Dashboard widgets are filtered by:

1. User role.
2. Required permission.
3. Local hide/show preference.
4. Required widgets that cannot be hidden.

The same permission map used by sidebar and route guards is reused by dashboard widgets and quick actions.

## Salary Summary Status

Salary Summary is visible as a dashboard widget/quick action for roles with:

```txt
salary_summary:read
```

Export-related UI remains disabled/planned until the dedicated Salary Summary UI part.

## What Was Not Done

- No live backend dashboard summary API was connected.
- No real payroll/attendance/leave counts were calculated in frontend.
- No business CRUD page was built.
- No Salary Summary preview/export UI was built.

Those should be added module-by-module after this dashboard foundation is accepted.

## Verification

Run:

```bash
cd client
npm run lint
npm run build
npm run dev
```

Expected:

- Dashboard opens after login.
- Dashboard shows Part-F6 hero.
- Widget settings panel opens/closes.
- Widget hide/show works.
- Widget ordering works.
- Density switch works.
- Salary Summary widget appears for allowed roles.
- Quick actions are filtered by permission.
