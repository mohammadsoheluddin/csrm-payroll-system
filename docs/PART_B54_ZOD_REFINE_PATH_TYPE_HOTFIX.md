# Part-B54 Zod Refine Path Type Hotfix

## Problem

TypeScript build failed in `employeeDocument.validation.ts` because the Zod refine options object used `as const`. That made the `path` field readonly:

```ts
path: ["expiryDate"] as readonly tuple
```

Zod v4 expects a mutable `PropertyKey[]` for `path`, so TypeScript rejected the options object.

## Fix

Removed `as const` from `issueExpiryValidationMessage` so the path is inferred as a normal mutable string array.

## Verification

Run from `server`:

```bash
npm run build
npm run route:sanity
npm run dev
```

The previous runtime issue is still fixed because create and update schemas are built separately before refinements are applied.
