# Part-F4.1 — Frontend UI Reference Lock & Design Standard

Project: CSRM Payroll System  
Phase: Frontend Foundation / Design Lock  
Status: Approved design direction for future frontend implementation  
Code impact: Documentation/design standard only. No business screen code should be implemented in this part.

---

## 1. Purpose

This document locks the visual direction for the CSRM Payroll System frontend before continuing with deeper business modules.

The frontend must follow the premium ERP/admin-dashboard style shown in the provided UI reference screenshots:

- clean white/light interface
- fixed left sidebar
- sticky topbar
- dashboard cards and charts
- rounded tables
- filters and segmented tabs
- right-side drawers
- multi-step forms
- report center
- export preview screens
- payslip and salary sheet preview layout

This design lock prevents random UI decisions in later parts.

---

## 2. Design Target Decision

The CSRM Payroll frontend should look like a modern enterprise payroll/HR ERP system.

Target design quality:

```txt
Premium internal ERP dashboard
Clean, professional, payroll-office friendly
Audit-ready report and export interface
Role/permission-aware operations UI
Light-first design with future dark/theme support
```

Expected visual match with the references:

```txt
Design language: 90–95% similar
Layout pattern: same direction
Component style: same direction
Exact pixel copy: not required
Production behavior: required
Backend-connected data: required
```

Important rule:

```txt
Do not build static demo screens.
Every final business screen must be designed for real backend data, permissions, loading state, empty state, error state, and export/report workflows.
```

---

## 3. Global Layout Standard

### 3.1 App shell

The frontend app uses a classic ERP shell:

```txt
Left Sidebar + Topbar + Main Content Area
```

Recommended dimensions:

| Area | Standard |
| --- | --- |
| Sidebar expanded width | 260px–280px |
| Sidebar collapsed width | 72px–84px |
| Topbar height | 64px–72px |
| Main page horizontal padding | 24px desktop, 16px tablet/mobile |
| Page content max width | full width, no narrow marketing layout |
| Page background | very light gray / near-white |
| Card background | white |

### 3.2 Topbar

The topbar should include:

- sidebar toggle
- global search input
- environment/company selector if needed
- notification icon
- help icon optional
- user avatar/name/role menu

Topbar style:

```txt
White background
Thin bottom border
Sticky or fixed at top
Soft shadow only if needed
Compact but not cramped
```

### 3.3 Sidebar

Sidebar should be grouped by business domain:

```txt
Dashboard
Organization / Master Setup
Employee Management
Attendance
Leave & Holiday
Payroll Setup
Payroll Process
Payroll Reports
Time & OT
Bonus Management
Bank & Payment
Governance & Control
Settings
```

Sidebar behavior:

- active route highlight
- collapsible groups
- collapsed mini-sidebar mode
- permission-filtered items
- mobile drawer
- no menu item should be shown if user has no permission to access it

---

## 4. Color and Theme Standard

### 4.1 Primary palette

Recommended base palette:

| Token | Use |
| --- | --- |
| Primary blue | main action buttons, active nav, links |
| Brand cyan/teal | logo accent, secondary brand accent |
| Navy/dark slate | headings, sidebar dark variant, strong text |
| Soft gray | page background, borders, muted surfaces |
| Green | success, active, approved, present |
| Orange/amber | warning, pending, late |
| Red | danger, rejected, absent, delete |
| Purple | locked, special workflow, bonus/report accent |

Suggested Tailwind-style direction:

```txt
primary: blue-600 / blue-700
brand: cyan-500 / teal-500
surface: white
page: slate-50
border: slate-200
text: slate-900
muted: slate-500
success: emerald-600
warning: amber-500
danger: rose-600
info: sky-600
```

### 4.2 Light/dark and multi-theme

The app already has theme foundation. Future screens must support:

```txt
Light mode
Dark mode
System mode
Future preset themes: default, steel, emerald, indigo
```

Rules:

- Do not hard-code many one-off colors inside business screens.
- Prefer CSS variables/Tailwind tokens/component variants.
- Status colors may use semantic classes.
- Report previews may use a print-friendly light layout even when app is in dark mode.

---

## 5. Typography Standard

Recommended font direction:

```txt
Inter or system sans-serif
Readable business UI typography
Not decorative
```

Suggested scale:

| Element | Size |
| --- | --- |
| Page title | 24px–30px, semibold/bold |
| Section title | 18px–20px, semibold |
| Card title | 14px–16px, semibold |
| Body text | 14px |
| Table text | 12px–14px |
| Muted helper text | 12px–13px |
| Badge text | 11px–12px |

Rules:

- Keep numeric payroll amounts easy to scan.
- Use tabular numbers where useful.
- Bangla/English mixed content must not break layouts.
- Report pages should be print-friendly and readable.

---

## 6. Component Design Standard

### 6.1 Cards

Cards should use:

```txt
White background
1px soft border
Rounded corners: 14px–18px
Subtle shadow
Comfortable padding: 16px–24px
```

Use cards for:

- dashboard KPI widgets
- summary blocks
- approval status
- workflow steps
- report preview panels
- employee profile side panels

### 6.2 Buttons

Button variants:

```txt
primary
secondary
outline
ghost
danger
success
warning
link
```

Button rules:

- destructive actions need confirmation modal/drawer.
- export actions should show file format clearly.
- disabled state must show reason through tooltip or helper text where possible.
- permission-hidden buttons should not appear if user lacks permission.

### 6.3 Badges/status pills

Status badges should be compact and semantic:

```txt
Active / Inactive
Approved / Pending / Rejected
Draft / Generated / Locked
Present / Absent / Late / OT
Completed / Failed / Running
```

### 6.4 Tables

Table style should follow the reference screens:

```txt
Rounded container
Clear header row
Soft row borders
Hover state
Selected row state
Action column at right
Pagination footer
Bulk selection support
Status badges inside cells
```

Required table features for business modules:

- search
- filters
- sorting where useful
- pagination
- row actions menu
- bulk actions where needed
- soft delete/restore support
- export/download button where relevant
- empty/loading/error state

### 6.5 Forms

Forms should be structured and business-friendly:

```txt
Label above input
Required star
Helper text
Validation error text
Grouped sections
Save / Save & Close / Cancel buttons
```

Employee create/edit form should use multi-step layout:

```txt
1. Personal Information
2. Office Information
3. Salary & Office Charges
4. Bank & Payment Info
5. Documents
```

### 6.6 Drawers

Right-side drawer is preferred for detail/edit preview where full navigation is not required.

Use drawer for:

- master data quick edit
- employee summary/profile panel
- audit trail
- salary structure detail
- report configuration
- approval timeline

Drawer rules:

- title + status badge at top
- tabs where needed
- sticky footer buttons
- close icon
- do not overload with too many unrelated sections

### 6.7 Modals

Use modals for focused confirmation:

```txt
Delete
Restore
Lock payroll period
Approve / reject
Finalize attendance
Export confirmation if needed
```

Avoid using modal for large forms. Use page or drawer instead.

---

## 7. Dashboard Design Standard

Dashboard should follow the visual reference:

- top row KPI cards
- attendance trend chart
- payroll summary chart
- employees by department chart
- recent approvals
- recent audit activity
- system status
- quick actions

Dashboard must be customizable later:

```txt
User can show/hide widgets
User can reorder widgets later
Role-wise default dashboard
Company/month/year filter
```

Initial dashboard widgets can include:

```txt
Total Employees
Present Today
Pending Leaves
Payroll Ready
Locked Periods
Export Jobs
Attendance Trend
Payroll Summary
Employees by Department
Recent Approvals
Recent Audit Activity
System Status
Quick Actions
```

---

## 8. Report and Export UI Standard

Report pages must follow a consistent pattern:

```txt
Filter panel
Report type selector
Preview area
Saved configurations
Recent downloads/export jobs
Export options
```

Supported export actions:

```txt
PDF
Excel
CSV
JSON where needed
Print preview
```

Export UI rules:

- PDF/Excel/CSV buttons should be visually distinct but consistent.
- Export should use backend file response/download helper.
- Do not calculate payroll totals in frontend for final reports.
- Frontend may format/display totals received from backend.
- Report previews should clearly show company, month, year, generated time, and user.

---

## 9. Payroll Document Preview Standard

Payroll document previews should look formal and printable.

Required preview types:

```txt
Salary Sheet
Payslip
Bank Sheet / Salary Payment Distribution
Time Bill / OT Statement
Bonus Sheet / Bonus Statement
Salary Summary
```

Document preview rules:

- company logo/name at top
- period/month/year
- generated timestamp
- filter context
- table with grouped totals
- grand total
- prepared/checked/accounts/approved signature areas where required
- print/PDF/Excel actions available from preview toolbar

Print/PDF preview must use a clean white document surface even if app theme is dark.

---

## 10. Salary Summary Design Rule

Salary Summary is a critical report and must not be treated as a static frontend table.

Final rule:

```txt
Salary Summary calculation and grouping must come from backend.
Frontend will only display, preview, and export backend-generated salary summary data.
```

Expected future backend module:

```txt
Part-B51 — Dedicated Salary Summary Report Backend Module
```

Expected future frontend route:

```txt
/reports/salary-summary
```

Expected UI pattern:

```txt
Month/year filter
Company/concern filter
Preview table
CSRM Salary & Wages
TSL Salary & Wages
CSRM OT
TSL OT
Combined totals
Group total
Excel/PDF export
```

---

## 11. Implementation Rules for Future Parts

Future frontend code must follow these rules:

1. Use existing `client/src` feature-based structure.
2. Do not create random one-off CSS for every screen.
3. Build reusable components first when pattern repeats.
4. Keep tables, forms, drawers, modals, cards, badges, and export buttons consistent.
5. All screens must respect auth and permission guard.
6. All API requests must use the Part-F4 API client/error handling pattern.
7. All final business data must come from backend APIs.
8. Loading, empty, error, forbidden, and conflict states must be handled.
9. Future report screens must follow report/export standard.
10. Mock data may be used temporarily only when clearly labeled and isolated.

---

## 12. Immediate Next Frontend Work After This Lock

Recommended order:

```txt
Part-F5 — Sidebar Permission Filtering + Permission-Wise UI Guard
Part-F6 — Dashboard UI Foundation based on locked design
Part-F7 — Reusable Table/Form/Drawer/Modal Component Kit
Part-F8 — Master Data UI Foundation
Part-F9 — Employee Directory UI Foundation
Part-F10 — Employee Create/Edit Multi-Step Form Foundation
Part-F11 — Report Center UI + Export Preview Foundation
```

Parallel/new backend extension:

```txt
Part-B51 — Dedicated Salary Summary Report Backend Module
```

---

## 13. Final Lock Statement

The CSRM Payroll System frontend visual direction is locked as:

```txt
Premium white ERP/admin dashboard
Left sidebar + topbar shell
Business-card dashboard
Rounded data tables
Right-side drawers
Multi-step forms
Report center and printable export preview
Backend-connected and permission-aware UI
```

This document should guide all future frontend UI implementation.
