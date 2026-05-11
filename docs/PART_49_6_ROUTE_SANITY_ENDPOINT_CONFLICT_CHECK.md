# Part-49.6 — Route Sanity + Endpoint Conflict Check

Created: 2026-05-11

## Purpose

This part introduces a route sanity check utility for the CSRM Payroll System backend.

The goal is to prevent route-order mistakes and endpoint conflicts before final backend smoke testing.

Common route-order problems in Express-style routing include:

- `GET /:id` declared before `GET /deleted`
- `GET /:id` declared before `GET /summary`
- `GET /:id` declared before `GET /export`
- duplicate route declarations inside the same route file
- static endpoints accidentally being treated as dynamic route params

This is especially important now because many modules have recently received:

- `/deleted` endpoints
- `/:id/restore` endpoints
- export endpoints
- summary endpoints
- sensitive audit endpoints
- bulk action endpoints

---

## Files Added / Updated

### Added

```txt
scripts/route-sanity-check.cjs
```

### Updated

```txt
server/package.json
```

A new npm script was added:

```bash
npm run route:sanity
```

---

## What the Route Sanity Script Checks

The script scans all files matching:

```txt
server/src/modules/**/**.route.ts
```

It checks:

1. Total route files scanned
2. Total route declarations
3. Duplicate route declarations in the same file
4. Static route shadowing by earlier dynamic routes

Example dangerous pattern:

```ts
router.get('/:id', ...);
router.get('/deleted', ...);
```

Here `/deleted` may be interpreted as an `id` depending on route matching behavior and order. Correct pattern:

```ts
router.get('/deleted', ...);
router.get('/:id', ...);
```

---

## Current Route Sanity Result

The assembled backend state was scanned during Part-49.6.

Result:

```txt
Route sanity check passed.
No duplicate or shadowed endpoints detected.
```

Important route groups confirmed safe:

- `/deleted` routes are not shadowed by `/:id`
- `/summary` routes are not shadowed by `/:id`
- `/export/*` routes are not shadowed by `/:id`
- `/sensitive` audit route is not shadowed by `/:id`
- saved report routes are ordered safely
- route duplication was not detected by the script

---

## How to Run

From project root:

```bash
node scripts/route-sanity-check.cjs
```

From server folder:

```bash
cd server
npm run route:sanity
```

Recommended full verification:

```bash
cd server
npm run typecheck
npm run build:clean
npm run route:sanity
```

---

## What Success Looks Like

Expected successful output includes:

```txt
CSRM Payroll System - Route Sanity Check
Route files      : 37
Route declarations: ...
Duplicates       : 0
Order conflicts  : 0
Route sanity check passed. No duplicate or shadowed endpoints detected.
```

The exact route declaration count may change as the project grows.

---

## What Failure Looks Like

If a route conflict is detected, the script will exit with a non-zero code and show a message like:

```txt
Potential route order conflicts:
- server/src/modules/company/company.route.ts:20 GET /deleted may be shadowed by earlier GET /:id at line 15
```

Fix by moving the static route above the dynamic route.

Correct:

```ts
router.get('/deleted', ...);
router.get('/:id', ...);
```

Wrong:

```ts
router.get('/:id', ...);
router.get('/deleted', ...);
```

---

## Route Ordering Standard Going Forward

For each route file, use this order when possible:

```txt
1. POST /create or POST /generate
2. static collection routes: /summary, /dashboard, /catalog, /deleted, /sensitive
3. export routes: /export/preview, /export/csv, /export/excel, /export/pdf
4. bulk action routes: /bulk/process, /bulk/approve, /bulk/lock
5. list route: GET /
6. nested dynamic routes: /:id/history, /:id/restore, /:id/revert
7. single record route: GET /:id
8. update/delete route: PATCH /:id, DELETE /:id
9. record action routes: /:id/process, /:id/approve, /:id/lock
```

Note:

Exact ordering can vary by module, but static routes must not be placed after broad dynamic routes that can capture them.

---

## Why This Matters for Frontend

Frontend API integration depends on stable route behavior.

If route order is wrong:

- `/deleted` can be treated as an ID
- `/summary` can be treated as an ID
- `/export/pdf` can return unexpected 404/400 errors
- frontend screens may show confusing errors even when backend logic is correct

This part helps prevent those hidden bugs before frontend development starts.

---

## Next Part

Next logical backend part:

```txt
Part-50.1 — Build Health Final Pass
```

Then:

```txt
Part-50.2 — Backend API Documentation Pack
Part-50.3 — Postman Master Collection Cleanup
Part-50.4 — Backend Smoke Testing
Part-50.5 — Backend Completion Lock
```
