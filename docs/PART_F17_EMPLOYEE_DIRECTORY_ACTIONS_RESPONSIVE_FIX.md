# Part-F17 — Employee Directory Actions Responsive Fix

## Purpose

This frontend hotfix fixes the Employee Directory table action column responsiveness issue where the View/Edit/Lifecycle/Delete action buttons could wrap vertically and create a very tall row on medium/large browser widths.

## Root Cause

The shared `SimpleDataTable` sticky action column did not allow a page-level minimum action-column width. The Employee Directory page has four action buttons in active mode, so the action cell became too narrow and the buttons wrapped into a vertical stack.

## Changes

### `client/src/components/data-table/SimpleDataTable.tsx`

- Added optional `actionsColumnClassName` prop.
- Applied the class to the sticky Actions header and each Actions cell.
- Kept the default action column compact for other tables.

### `client/src/features/employees/pages/EmployeeDirectoryPage.tsx`

- Set Employee Directory action column to `min-w-[25rem] lg:min-w-[27rem]`.
- Changed the action button wrapper from wrapping to a single-line `flex-nowrap` layout.
- Added `shrink-0` to action buttons.

## Expected Result

- Action buttons stay on one horizontal line in the Employee Directory table.
- Row height stays clean and consistent.
- If the browser width is not enough, the table uses the existing horizontal scrollbar instead of breaking the action buttons vertically.

## Verification

Run from project root:

```bash
cd client
npm run lint
npm run build
npm run dev
```

Then check:

```text
http://localhost:5173/employees
```

Confirm that the action buttons for each employee row are shown horizontally.
