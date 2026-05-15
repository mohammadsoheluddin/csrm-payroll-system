# Part-F16.1 Hotfix — Legacy Salary Import Request Entity Too Large

## Problem

When uploading real CSRM/TSL Excel salary sheets from the frontend legacy salary import page, the backend returned:

```text
request entity too large
```

## Root Cause

The frontend sends the `.xlsx` file to the parse endpoint as a Base64 JSON payload. Express's default JSON body limit is only about 100kb, so real Excel files can exceed that limit before the request reaches the legacy salary parser.

## Fix

Updated `server/src/app.ts`:

```ts
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
```

This keeps the current frontend/backend flow working and allows normal payroll Excel files to be parsed.

## Important Boundary

This fix does not mix imported legacy salary data with native payroll calculation. It only allows the existing legacy import parser to receive real Excel files.

## Verify

```bash
cd server
npm run build
npm run dev
```

Then open frontend and upload a real `.xlsx` file again:

```text
http://localhost:5173/salary/legacy-imports
```

