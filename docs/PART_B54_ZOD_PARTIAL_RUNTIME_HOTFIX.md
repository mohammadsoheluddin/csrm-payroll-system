# Part-B54 Hotfix — Employee Document Zod Partial Runtime Error

## Problem

While starting the backend after Part-B54, the server failed with:

```text
.partial() cannot be used on object schemas containing refinements
```

## Cause

`employeeDocument.validation.ts` used `.partial()` on a Zod object schema that already had a `.refine()` date-order validation. In Zod v4, `.partial()` cannot be used on object schemas containing refinements.

## Fix

The validation file now separates:

- the reusable raw body shape,
- create body schema with defaults and date-order refinement,
- update body schema using `.partial()` before applying update refinements.

This keeps the same API behavior while allowing the backend to boot properly.

## Scope

Changed file:

```text
server/src/modules/employeeDocument/employeeDocument.validation.ts
```

No data model, route, controller, or service behavior was changed.
