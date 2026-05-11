# Part-49.1 — Build Health / TypeScript Compile Stabilization

Created: 2026-05-11

## 1. Purpose

Part-48.x touched many backend modules for soft delete, restore, lifecycle, attendance/leave, and payroll/payment safety. Before adding new business modules, the project needs a build-health checkpoint.

This part does not add a new business feature. It standardizes local build/type-check commands and records the verification process.

---

## 2. Files Updated

| File | Purpose |
| ---- | ------- |
| `.gitattributes` | Stabilizes line endings across Windows/Git Bash/VS Code and reduces LF/CRLF Git warnings |
| `server/package.json` | Adds build/type-check/diagnostic scripts |
| `docs/PART_49_1_BUILD_HEALTH_TYPESCRIPT_STABILIZATION.md` | Documents build health process and expected commands |

Optional cleanup:

| File | Action |
| ---- | ------ |
| `server/srccommontypes.ts` | Remove if it still exists. It appears to be a stray empty file and is not part of the real source tree. |

---

## 3. New / Standardized NPM Scripts

Run commands from:

```bash
cd /e/Projects/CSRM-Payroll-System/server
```

### Development Server

```bash
npm run dev
```

Starts the backend with `ts-node-dev` in transpile-only mode.

### Clean Build Output

```bash
npm run clean
```

Removes the `dist` folder safely using Node.js, so it works on Windows, Git Bash, PowerShell, and Linux.

### Normal Build

```bash
npm run build
```

Runs TypeScript build using `tsconfig.json`.

### Clean Build

```bash
npm run build:clean
```

Removes old `dist` output first, then builds again.

### Type Check Only

```bash
npm run typecheck
```

Checks TypeScript without generating `dist` output.

### Type Check With Diagnostics

```bash
npm run typecheck:diagnostics
```

Shows TypeScript performance diagnostics such as total compile time, memory, files, and type counts.

### Build With Diagnostics

```bash
npm run build:diagnostics
```

Builds and also shows TypeScript compile diagnostics.

### Production Start

```bash
npm run start:prod
```

Runs the compiled `dist/server.js` output.

---

## 4. Recommended Local Verification Order

After replacing Part-49.1 files, run this order:

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run typecheck
npm run build:clean
npm run build:diagnostics
npm run dev
```

Expected result:

- `typecheck` should complete without `TS` errors.
- `build:clean` should create/update `dist`.
- `build:diagnostics` should complete and print compile statistics.
- `dev` should start the server.

---

## 5. What To Do If Build Fails

If build fails, do not continue to the next feature part. Copy the full terminal error and fix the first TypeScript error first.

Common build error categories:

1. Missing import/export
2. Wrong interface field name
3. Wrong route/controller function name
4. Audit log action/module union mismatch
5. Mongoose ObjectId typing issue
6. Zod validation shape mismatch
7. Old file path still imported somewhere
8. Route imports mismatched with service/controller exports

Recommended command for clearer errors:

```bash
npm run typecheck
```

Recommended command for performance details:

```bash
npm run typecheck:diagnostics
```

---

## 6. Line Ending Note

Before this part, Git sometimes showed warnings like:

```txt
LF will be replaced by CRLF the next time Git touches it
```

The new `.gitattributes` file helps standardize line endings for source files.

After adding `.gitattributes`, existing files may still show line-ending changes once when Git normalizes them. This is normal.

If needed later, run a separate line-ending normalization commit. Do not mix that with business logic changes.

---

## 7. Optional Stray File Cleanup

If this file exists:

```txt
server/srccommontypes.ts
```

Remove it:

```bash
git rm server/srccommontypes.ts
```

Reason:

The real common types file is:

```txt
server/src/common/types.ts
```

The root-level `server/srccommontypes.ts` path looks like an accidental stray file.

---

## 8. Current Recommended Next Step

After Part-49.1 passes locally, the next logical part is:

```txt
Part-49.2 — RBAC Route Enforcement Consistency Pass
```

Reason:

The project now has many modules and routes. Some routes are permission-based and some are still role-based. The next standardization step should align route protection with the permission matrix.
