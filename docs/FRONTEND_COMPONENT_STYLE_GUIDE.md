# Frontend Component Style Guide

Project: CSRM Payroll System  
Purpose: Component-level style rules for future UI implementation.

---

## Core component groups

Future reusable component library should include:

```txt
App shell components
KPI cards
Data table
Filter toolbar
Status badges
Action buttons
Confirm modal
Right drawer
Tabs
Stepper
Form fields
Form section cards
Report preview toolbar
Export action buttons
Audit trail drawer
Empty/loading/error states
```

---

## Data table pattern

Every business table should support this standard shape where applicable:

```txt
Title/header
Filter toolbar
Search input
Status/company/month filters
Show deleted toggle where needed
Bulk checkbox selection
Sortable columns where useful
Action column
Pagination
Empty/loading/error state
```

Table density:

```txt
Comfortable by default
Compact optional later
```

---

## Form pattern

Every form should follow:

```txt
Header title + subtitle
Grouped sections
Required field marks
Validation summary
Field-level error
Server error mapping
Sticky footer/action area where useful
```

For large forms, use page or stepper. Do not put large forms in modals.

---

## Drawer pattern

Drawer layout:

```txt
Header: title, subtitle/status, close button
Content: tabs or sections
Footer: cancel/save/save & close actions
```

Drawer width:

```txt
Small detail: 420px–480px
Standard edit: 520px–640px
Large preview: 720px+ if needed
```

---

## Status color pattern

Use semantic status components:

| Status | Visual direction |
| --- | --- |
| Active / Approved / Completed / Present | green |
| Pending / Late / Warning | amber/orange |
| Rejected / Failed / Delete / Absent | red |
| Draft / Info / Running | blue |
| Locked / Special workflow | purple |
| Disabled / Archived | gray |

---

## Report/export button pattern

Use consistent export action buttons:

```txt
PDF: red accent
Excel: green accent
CSV: orange/yellow accent
JSON: purple/blue accent
Print: neutral
```

Rules:

- use backend-generated files
- show loading state while downloading
- show success/failure toast
- disabled state if endpoint unavailable

---

## Screen quality checklist

Before accepting any future frontend screen, verify:

```txt
Build passes
Lint passes
Protected route works
Permission guard works
Loading state exists
Empty state exists
Error state exists
Responsive layout works
No hard-coded final payroll totals in frontend
No random unapproved UI style
```
