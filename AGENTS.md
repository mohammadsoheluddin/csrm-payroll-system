# CSRM Payroll System — Codex Working Instructions

## Project Identity

This repository is the CSRM Payroll System, an enterprise-grade Payroll/HR/Admin software project for CSRM/TSL style multi-concern operations.

Primary stack:

- Backend: Node.js, Express.js, TypeScript, MongoDB, Mongoose
- Frontend: React, TypeScript, Vite, Tailwind-style utility classes
- Testing/verification: npm scripts, Postman/manual browser testing
- GitHub repo: mohammadsoheluddin/csrm-payroll-system

## Core Working Rules

1. Always inspect the existing repository before editing.
2. Do not guess file structure.
3. Prefer small, controlled parts over large risky rewrites.
4. Preserve existing backend/frontend patterns.
5. Give full updated files or exact diffs.
6. Avoid breaking existing APIs, routes, permissions, docs, or frontend navigation.
7. Keep legacy salary imported data separate from native payroll calculation.
8. Do not mix archive/reference data into payroll engine calculations.
9. Add docs for every completed part under `/docs`.
10. Always run verification commands before finalizing.

## Backend Rules

- Follow existing module structure under `server/src/modules/...`
- Use existing utilities such as sendResponse, catchAsync, AppError, validateRequest, auth, USER_ROLE/permissions, audit log pattern where applicable.
- Keep TypeScript production-ready.
- Avoid adding new production dependencies unless necessary.
- If adding routes, update `server/src/routes/index.ts`.
- Run:
  - `cd server && npm run build`
  - `npm run route:sanity` if route changes are made.
- If a build fails, fix before final response.

## Frontend Rules

- Follow existing structure under `client/src/features/...`
- Keep pages responsive and ERP-style.
- Do not create UI that wraps action buttons vertically inside narrow table cells.
- Use existing route/config/sidebar/query patterns.
- Run:
  - `cd client && npm run lint`
  - `npm run build`
- Add empty states, loading states, error states, and permission-aware UI.

## Documentation Rules

For every part, add a documentation file under `/docs`, for example:

- `docs/PART_F20_ATTENDANCE_REGISTER_FINALIZATION_UI_FOUNDATION.md`

The doc should include:

- Purpose
- Changed files
- New routes/endpoints
- Testing guide
- Business rules
- Notes/limitations
- Next logical part

## Git Rules

Do not push automatically unless the user explicitly says to push.

At the end, provide:

- changed files list
- verify commands
- cleanup command for patch/helper files if any
- git add command
- git commit command
- git push command

## Important Business Boundaries

- Employee data belongs in Payroll/HR system.
- Other future software should not duplicate employee master records.
- Legacy salary import is archive/reporting/comparison only.
- Native payroll calculation must use native payroll modules, not legacy archive data.
- Sensitive documents, salary, bank, NID, and confidential HR records must be permission-aware.
